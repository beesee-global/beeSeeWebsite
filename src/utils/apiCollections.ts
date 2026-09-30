/**
 * Normalizes either an Axios response or an already-unwrapped response body.
 * The API has both legacy `{ data: [...] }` responses and nested
 * `{ data: { success, message, data: [...] } }` responses.
 */
export const normalizeApiResponse = <T = any>(payload: unknown): T => {
  const current = isAxiosResponse(payload)
    ? (payload as { data: unknown }).data
    : payload;

  if (!current || typeof current !== "object" || Array.isArray(current)) {
    return current as T;
  }

  const record = current as Record<string, unknown>;
  const nested = record.data;

  // Unwrap detail/envelope objects, but retain `{ data: [...] }` collection
  // wrappers because existing page consumers use that contract.
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as T;
  }

  return current as T;
};

const isAxiosResponse = (payload: unknown): payload is { data: unknown } => {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  return "config" in record && "status" in record && "data" in record;
};

/**
 * Converts the API's common array response shapes into a safe array.
 * Endpoints may return an array directly or wrap it in `data`, `items`,
 * `results`, or an endpoint-specific property.
 */
export const asArray = <T = any>(payload: unknown): T[] => {
  let current: unknown = normalizeApiResponse(payload);

  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(current)) return current as T[];
    if (!current || typeof current !== 'object') return [];

    const record = current as Record<string, unknown>;
    current = record.data ?? record.items ?? record.results ?? record.rows ?? record.faqs ?? record.categories;
  }

  return Array.isArray(current) ? current as T[] : [];
};
