# Architecture Decision Record: 0002 - Async Background Job Processing

## Status
Approved

## Context
Various core checkout and ordering operations consume significant computation:
* Generating PDF invoices via headless browser layout processing.
* Synchronizing finalized payment status and inventory levels with external corporate ERPs.
* Triggering multi-recipient notification emails.

Executing these operations inside the lifecycle of the user's payment webhook callback or client checkout API route degrades HTTP response time, risks gateway timeouts (504s), and leaves the system open to failures if third-party endpoints (e.g. SMTP server, ERP host) are temporarily offline.

## Decision
We will execute all non-real-time business operations in background queues:
1. Integrate **BullMQ** to define queues backed by Redis storage.
2. Separate business operations into independent workers (`src/services/jobs/`).
3. Handle failure modes with automatic retry policies using exponential backoff.
4. Fall back to thread-safe memory loops (`MemoryQueue`) when Redis is unavailable, assuring delivery attempt logs remain operational.

## Consequences
* **Pros**:
  * Ultra-fast client request response times.
  * Enhanced resilience: third-party downtimes are tolerated, and jobs are retried rather than failing checkout.
  * Clear operational separation of concern.
* **Cons**:
  * Potential for temporary state inconsistency (e.g. order marked paid, but invoice PDF takes a few seconds to appear in the dashboard).
