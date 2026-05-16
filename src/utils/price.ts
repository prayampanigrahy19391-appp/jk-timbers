export function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
}
