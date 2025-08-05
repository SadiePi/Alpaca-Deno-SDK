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

export type QueryParams = Record<string, string | number | boolean | null>;
export type BodyParams = Record<string, unknown>;

export enum AssetClass {
  UsEquity = "us_equity",
  UsOption = "us_option",
  Crypto = "crypto",
}

export enum Exchange {
  AMEX,
  ARCA,
  BATS,
  NYSE,
  NASDAQ,
  NYSEARCA,
  OTC,
}
