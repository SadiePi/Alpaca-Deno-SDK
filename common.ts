export type AlpacaAPI = "Trading" | "Market" | "Broker";
export type APIMethod = "GET" | "OPTIONS" | "PUT" | "DELETE" | "POST" | "PATCH";
/**
 * Supported currencies for trading accounts.
 */
export enum Currency {
  /** US Dollar */
  USD = "USD",
  /** Placeholder for other currencies */
  OTHER = "...",
}

export type UUID = string & { tag: "UUID" };
export function validateUUID(uuid: string): uuid is UUID {
  // A simple regex to validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) return false;
  Object.assign(uuid, { tag: "UUID" });
  return true;
}

export type QueryParams = Record<string, string | number | boolean | null>;
export type BodyParams = Record<string, unknown>;
