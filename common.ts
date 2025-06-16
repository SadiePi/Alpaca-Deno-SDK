export const baseURLs = {
  live: "https://api.alpaca.markets/",
  paper: "https://paper-api.alpaca.markets/",
  data: "https://data.alpaca.markets/",
  broker: "https://broker-api.sandbox.alpaca.markets/",
} as const;

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
export type UUID = string; // for now
export type QueryParams = Record<string, string | number | boolean | null>;
export type BodyParams = Record<string, unknown>;
