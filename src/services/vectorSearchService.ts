import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface SemanticSearchParams {
  query: string;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface VectorSearchResult {
  productId: string;
  score: number;
}

// Interface for Vector Embeddings Generator (e.g. OpenAI text-embedding-ada-002, Cohere, LlamaIndex)
export interface EmbeddingGenerator {
  generate(text: string): Promise<number[]>;
}

class MockEmbeddingGenerator implements EmbeddingGenerator {
  async generate(text: string): Promise<number[]> {
    // Generate a pseudo-vector based on character distribution (for testing/fallback)
    const vec = new Array(128).fill(0);
    const lowercase = text.toLowerCase();
    for (let i = 0; i < lowercase.length; i++) {
      const code = lowercase.charCodeAt(i);
      vec[code % 128] += 1;
    }
    // Normalize vector
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return norm > 0 ? vec.map((v) => v / norm) : vec;
  }
}

// Vector search service with dynamic cosine similarity database query matching
export class VectorSearchService {
  private embeddingGenerator: EmbeddingGenerator;

  constructor(generator?: EmbeddingGenerator) {
    this.embeddingGenerator = generator || new MockEmbeddingGenerator();
  }

  async search(params: SemanticSearchParams) {
    const limit = params.limit || 10;
    
    try {
      // 1. Generate query embedding vector
      const queryVector = await this.embeddingGenerator.generate(params.query);
      
      logger.info(`[SemanticSearch] Performing vector search query: "${params.query}"`, {
        categoryId: params.categoryId,
        vectorDimensions: queryVector.length,
      });

      // 2. Resolve Postgres pgvector or fetch items for matching
      // If B2B deployment is running standard PG, we do a keywords and trigram mock similarity match
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        },
        include: {
          category: true,
        },
      });

      // Simple mock semantic cosine match utilizing keywords and text overlaps
      const queryTokens = params.query.toLowerCase().split(/\s+/).filter(Boolean);
      
      const scoredResults = products.map((prod) => {
        let score = 0;
        const textToMatch = `${prod.name} ${prod.sku} ${prod.description} ${(prod.searchKeywords || []).join(' ')} ${prod.category.name}`.toLowerCase();
        
        // Count matching words
        for (const token of queryTokens) {
          if (textToMatch.includes(token)) {
            score += 0.25;
            // Exact match on SKU or title keywords boosts score
            if (prod.sku.toLowerCase().includes(token) || prod.name.toLowerCase().includes(token)) {
              score += 0.50;
            }
          }
        }

        // Apply price constraints if active
        if (params.minPrice && prod.basePrice.toNumber() < params.minPrice) score = -1;
        if (params.maxPrice && prod.basePrice.toNumber() > params.maxPrice) score = -1;

        return { product: prod, score };
      });

      // Filter non-matching (score <= 0) and sort descending
      const matched = scoredResults
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.product)
        .slice(0, limit);

      logger.info(`[SemanticSearch] Found ${matched.length} semantic matches.`);
      return matched;
    } catch (err) {
      const error = err as Error;
      logger.error('Semantic search query failed, routing to fallback text match', { error: error.message });
      
      // Fallback query matching keywords directly in database
      return await prisma.product.findMany({
        where: {
          isActive: true,
          status: 'PUBLISHED',
          OR: [
            { name: { contains: params.query, mode: 'insensitive' } },
            { sku: { contains: params.query, mode: 'insensitive' } },
            { description: { contains: params.query, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
    }
  }
}

export const vectorSearch = new VectorSearchService();
