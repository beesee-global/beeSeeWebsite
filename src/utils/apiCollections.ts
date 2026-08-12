/**
 * Converts the API's common array response shapes into a safe array.
 * Endpoints may return an array directly or wrap it in `data`, `items`,
 * `results`, or an endpoint-specific property.
 */
export const asArray = <T = any>(payload: unknown): T[] => {
  let current: unknown = payload;

  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(current)) return current as T[];
    if (!current || typeof current !== 'object') return [];

    const record = current as Record<string, unknown>;
    current = record.data ?? record.items ?? record.results ?? record.rows ?? record.faqs ?? record.categories;
  }

  return Array.isArray(current) ? current as T[] : [];
};
