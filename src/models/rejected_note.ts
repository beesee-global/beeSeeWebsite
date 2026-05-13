export interface RejectedNoted {
  /** Unique identifier */
  id: string;

  /** Rejection note message */
  message: string;

  /** Record creation timestamp */
  created_at: string;

  /** Record last update timestamp */
  updated_at: string;
}

/**
 * Payload used when creating a rejected note
 */
export type InsertRejectedNoted = Omit<
  RejectedNoted,
  "id" | "created_at" | "updated_at"
>;

/**
 * Payload used when updating a rejected note
 */
export type UpdateRejectedNoted = Partial<
  Omit<RejectedNoted, "id" | "created_at" | "updated_at">
>;