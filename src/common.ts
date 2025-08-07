import { Z } from "./external.ts";

export type AlpacaAPI = "Trading" | "Market" | "Broker";
export type APIMethod = "GET" | "OPTIONS" | "PUT" | "DELETE" | "POST" | "PATCH";
/**
 * Supported currencies for trading accounts.
 */
export const CurrencySchema = Z.enum(["USD", "..."]);

export type QueryParams = Record<string, string | number | boolean | null>;
export type BodyParams = Record<string, unknown>;

export const AssetClassSchema = Z.enum(["us_equity", "us_option", "crypto"]);

export const ExchangeSchema = Z.enum(["AMEX", "ARCA", "BATS", "NYSE", "NASDAQ", "NYSEARCA", "OTC"]);

export const AlpacaDateSchema = Z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const AlpacaTimeSchema = Z.string().regex(/^\d{2}:\d{2}$/);
export const AlpacaDateTimeSchema = Z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/);
