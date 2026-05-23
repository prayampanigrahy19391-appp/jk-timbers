import { NextRequest, NextResponse } from 'next/server';
import { searchCatalogProducts } from '@/services/productService';

function parsePositiveNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSort(value: string | null) {
  return value === 'priceAsc' || value === 'priceDesc' || value === 'newest' || value === 'nameAsc'
    ? value
    : undefined;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') ?? undefined;
  const categoryId = url.searchParams.get('categoryId') ?? undefined;
  const categorySlug = url.searchParams.get('categorySlug') ?? undefined;
  const rawTagIds = url.searchParams.get('tagIds')?.split(',').filter(Boolean) ?? [];
  const tagIds = rawTagIds.length > 0 ? rawTagIds : undefined;
  const minPrice = parsePositiveNumber(url.searchParams.get('minPrice'));
  const maxPrice = parsePositiveNumber(url.searchParams.get('maxPrice'));
  const inStock = url.searchParams.get('inStock') === 'true';
  const sort = parseSort(url.searchParams.get('sort'));
  const page = parsePositiveInteger(url.searchParams.get('page'), 1);
  const pageSize = parsePositiveInteger(url.searchParams.get('pageSize'), 24);
  const specifications = Array.from(url.searchParams.entries())
    .filter(([key]) => key.startsWith('spec.'))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key.replace(/^spec\./, '')] = value;
      return acc;
    }, {});

  const semantic = url.searchParams.get('semantic') === 'true';

  if (semantic && query) {
    const { vectorSearch } = await import('@/services/vectorSearchService');
    const matchedProducts = await vectorSearch.search({
      query,
      categoryId,
      minPrice,
      maxPrice,
      limit: pageSize,
    });

    return NextResponse.json({
      products: matchedProducts,
      total: matchedProducts.length,
      page: 1,
      pageSize,
      totalPages: 1,
    });
  }

  const result = await searchCatalogProducts({
    query,
    categoryId,
    categorySlug,
    tagIds,
    minPrice,
    maxPrice,
    inStock: url.searchParams.has('inStock') ? inStock : undefined,
    specifications: Object.keys(specifications).length ? specifications : undefined,
    sort,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
