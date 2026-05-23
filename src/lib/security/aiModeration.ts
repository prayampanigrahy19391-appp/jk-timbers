import { logger } from '@/lib/logger';

export interface ModerationResult {
  isSafe: boolean;
  flaggedReason?: string;
  sanitizedContent: string;
}

const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /bypass safety/i,
  /act as a/i,
  /forget your guidelines/i,
  /you are now/i,
  /dan mode/i,
];

const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
  creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
};

export function moderateAndSanitizeInput(input: string): ModerationResult {
  const trimmedInput = input.trim();
  
  logger.info('[AIModerator] Evaluating user input for security safety', {
    inputLength: trimmedInput.length,
  });

  // 1. Check for prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmedInput)) {
      logger.warn('[AIModerator] Flagged input: potential prompt injection attack pattern matched', {
        patternMatch: pattern.source,
      });

      return {
        isSafe: false,
        flaggedReason: 'PROMPT_INJECTION_DETECTED',
        sanitizedContent: '',
      };
    }
  }

  // 2. Check for PII leaks and sanitize them (Replace with [REDACTED])
  let sanitized = trimmedInput;
  let piiFlaggedCount = 0;

  for (const [key, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(sanitized)) {
      piiFlaggedCount += 1;
      sanitized = sanitized.replace(pattern, `[REDACTED_${key.toUpperCase()}]`);
    }
  }

  if (piiFlaggedCount > 0) {
    logger.info(`[AIModerator] Sanitized ${piiFlaggedCount} PII fields in user prompt`);
  }

  return {
    isSafe: true,
    sanitizedContent: sanitized,
  };
}
