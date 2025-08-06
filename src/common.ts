import { Z } from "./external.ts";

export type AlpacaAPI = "Trading" | "Market" | "Broker";
export type APIMethod = "GET" | "OPTIONS" | "PUT" | "DELETE" | "POST" | "PATCH";
/**
 * Supported currencies for trading accounts.
 */
export const CurrencySchema = Z.union([Z.literal("USD"), Z.literal("...")]);

export type QueryParams = Record<string, string | number | boolean | null>;
export type BodyParams = Record<string, unknown>;

export const AssetClassSchema = Z.union([Z.literal("us_equity"), Z.literal("us_option"), Z.literal("crypto")]);

export const ExchangeSchema = Z.union([
  Z.literal("AMEX"),
  Z.literal("ARCA"),
  Z.literal("BATS"),
  Z.literal("NYSE"),
  Z.literal("NASDAQ"),
  Z.literal("NYSEARCA"),
  Z.literal("OTC"),
]);

export const AlpacaDateSchema = Z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const AlpacaTimeSchema = Z.string().regex(/^\d{2}:\d{2}$/);
export const AlpacaDateTimeSchema = Z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/);
