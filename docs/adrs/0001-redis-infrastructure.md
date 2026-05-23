# Architecture Decision Record: 0001 - Redis Infrastructure Introduction

## Status
Approved

## Context
As JK Timbers scales to support B2B contractors, high traffic concurrency, and external ERP integration endpoints, we face limits with single-process utilities:
1. **Rate Limiting**: Our current rate limiter is process-bound (uses a local Map). When deployed to a horizontally-scaled production setup (e.g. Vercel Serverless or multiple container instances behind a load balancer), rate-limiting state is not synchronized across workers.
2. **Task Deferral**: Certain workflows (like generating invoice PDFs, uploading to S3, and sending emails) are too slow to run inside standard client HTTP request-response handlers.
3. **Caching**: Frequently requested products and variants categories need a distributed fast cache to reduce DB load.

## Decision
We will introduce **Redis** (version 7+) as a core caching and system coordination layer. 

To prevent single points of failure in low-resource environments (such as local debugging or edge VMs), the application will:
* Centralize all Redis calls in a connection manager (`src/lib/redis.ts`).
* Seamlessly fall back to an in-memory mock client when `REDIS_URL` is omitted or when Redis encounters a socket connection failure.

## Consequences
* **Pros**:
  * Horizontally-scalable, distributed IP rate limiting.
  * Robust, multi-worker background job processing via BullMQ.
  * Transparent local fallbacks mean local developers do not need to install Redis to run the codebase.
* **Cons**:
  * Adds an additional operational dependency (requires managed Redis like Upstash, ElastiCache, or Aiven in production).
