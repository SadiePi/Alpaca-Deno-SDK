import { ClientModule } from "../client.ts";
import { QueryParams } from "../common.ts";
import { Parsed, ParsingSchema, Raw } from "../parsing.ts";
import { From, parse } from "../parsing.ts";

export enum ActiveStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum AssetClass {
  UsEquity = "us_equity",
  UsOption = "us_option",
  Crypto = "crypto",
}

export enum Exchange {
  AMEX = "AMEX",
  ARCA = "ARCA",
  BATS = "BATS",
  NYSE = "NYSE",
  NASDAQ = "NASDAQ",
  NYSEARCA = "NYSEARCA",
  OTC = "OTC",
}

export enum Attribute {
  PtpNoException = "ptp_no_exception",
  PtpWithException = "ptp_with_exception",
  IPO = "ipo",
  HasOptions = "has_options",
  OptionsLateClose = "options_late_close",
}

export enum ContractType {
  Call = "call",
  Put = "put",
}

export enum ContractStyle {
  American = "american",
  European = "european",
}

export enum TreasurySubtype {
  Bond = "bond",
  Bill = "bill",
  Note = "note",
  Strips = "strips",
  Tips = "tips",
  Floating = "floating",
}

export enum BondStatus {
  Outstanding = "outstanding",
  Matured = "matured",
  PreIssuance = "pre_issuance",
}

export enum DeliverableType {
  Cash = "cash",
  Equity = "equity",
}

export enum SettlementType {
  T0 = "T+0",
  T1 = "T+1",
  T2 = "T+2",
  T3 = "T+3",
  T4 = "T+4",
  T5 = "T+5",
}

export enum SettlementMethod {
  BTOB = "BTOB",
  CADF = "CADF",
  CAFX = "CAFX",
  CCC = "CCC",
}

export enum CouponType {
  Fixed = "fixed",
  Floating = "floating",
  Zero = "zero",
}

export enum CouponFrequency {
  Annual = "annual",
  SemiAnnual = "semi_annual",
  Quarterly = "quarterly",
  Monthly = "monthly",
  Zero = "zero",
}

export interface AssetsQuery {
  status?: ActiveStatus;
  asset_class?: AssetClass;
  exchange?: Exchange;
  attributes?: Attribute[];
}

export interface OptionContractsQuery {
  underlying_symbols?: string[];
  show_deliverables?: boolean;
  status?: ActiveStatus;
  expiration_date?: Temporal.PlainDate;
  expiration_date_gte?: Temporal.PlainDate;
  expiration_date_lte?: Temporal.PlainDate;
  root_symbol?: string;
  type?: ContractType;
  style?: ContractStyle;
  strike_price_gte?: number;
  strike_price_lte?: number;
  page_token?: string;
  limit?: number;
  ppind?: boolean;
}

export interface TreasuriesQuery {
  subtype?: TreasurySubtype;
  bond_status?: BondStatus;
  cusips?: string[];
  isins?: string[];
}

const AssetSchema = {
  id: From.string.uuid,
  class: From.string.enum(AssetClass),
  cusip: From.I<string | null>(),
  exchange: From.string.enum(Exchange),
  symbol: From.I<string>(),
  name: From.I<string>(),
  status: From.string.enum(ActiveStatus),
  tradable: From.I<boolean>(),
  marginable: From.I<boolean>(),
  shortable: From.I<boolean>(),
  easy_to_borrow: From.I<boolean>(),
  fractionable: From.I<boolean>(),
  // maintenance_margin_requirement: From.string.float, // deprecated, see margin_requirement_long or margin_requirement_short
  attributes: From.I<Attribute[]>(),
  margin_requirement_long: From.string.float,
  margin_requirement_short: From.string.float,
} as const satisfies ParsingSchema;
export type RawAsset = Raw<typeof AssetSchema>;
export type Asset = Parsed<typeof AssetSchema>;

const DeliverableSchema = {
  type: From.string.enum(DeliverableType),
  symbol: From.I<string>(),
  asset_id: From.I<string | null>(),
  settlement_type: From.string.enum(SettlementType),
  settlement_method: From.string.enum(SettlementMethod),
  delayed_settlement: From.I<boolean>(),
  amount: From.string.float,
  allocation_percentage: From.string.float,
} as const satisfies ParsingSchema;
export type RawDeliverable = Raw<typeof DeliverableSchema>;
export type Deliverable = Parsed<typeof DeliverableSchema>;

const OptionContractSchema = {
  id: From.string.uuid,
  symbol: From.I<string>(),
  name: From.I<string>(),
  status: From.string.enum(ActiveStatus),
  tradable: From.I<boolean>(),
  root_symbol: From.I<string>(),
  underlying_symbol: From.I<string>(),
  underlying_asset_id: From.I<string>(),
  type: From.string.enum(ContractType),
  style: From.string.enum(ContractStyle),
  expiration_date: From.I<unknown>(), // date
  strike_price: From.string.float,
  multiplier: From.string.int,
  size: From.string.float,
  open_interest: From.string.float,
  open_interest_date: From.I<unknown>(), // date
  close_price: From.string.float,
  close_price_date: From.I<unknown>(), // date
  deliverables: From.I<RawDeliverable[]>(),
} as const satisfies ParsingSchema;
export type RawOptionContract = Raw<typeof OptionContractSchema>;
export type OptionContract = Parsed<typeof OptionContractSchema>;

const TreasurySchema = {
  cusip: From.I<string>(),
  isin: From.I<string>(),
  bond_status: From.string.enum(BondStatus),
  tradable: From.I<boolean>(),
  subtype: From.string.enum(TreasurySubtype),
  description: From.I<string>(),
  description_short: From.I<string>(),
  close_price: From.string.float,
  close_yield_to_maturity: From.string.float,
  close_yield_to_worst: From.string.float,
  coupon: From.string.float,
  coupon_type: From.string.enum(CouponType),
  coupon_frequency: From.string.enum(CouponFrequency),
  issue_date: From.I<unknown>(), // date
  maturity_date: From.I<unknown>(), // date
  close_price_date: From.I<unknown>(), // date
  first_coupon_date: From.I<unknown>(), // date
  next_coupon_date: From.I<unknown>(), // date
  last_coupon_date: From.I<unknown>(), // date
} as const satisfies ParsingSchema;
export type RawTreasury = Raw<typeof TreasurySchema>;
export type Treasury = Parsed<typeof TreasurySchema>;

export default class TradingAssetsModule extends ClientModule {
  async getAssets(query: AssetsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.attributes) preparedQuery.attributes = query.attributes.join(",");

    const response = await this.client.fetch("v2/assets", "GET", {
      query: preparedQuery,
    });
    if (response.status !== 200) {
      throw new Error(
        `Get Assets: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawAsset[];
    // TODO validate
    return json.map((asset) => parse(AssetSchema, asset));
  }

  async getAsset(symbol_or_asset_id: string) {
    const response = await this.client.fetch(
      `v2/assets/${symbol_or_asset_id}`,
      "GET",
    );
    if (response.status === 404) {
      throw new Error(`Get Asset: 404 Not Found: ${symbol_or_asset_id}`);
    }
    if (response.status !== 200) {
      throw new Error(
        `Get Asset: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawAsset;
    // TODO validate
    return parse(AssetSchema, json);
  }

  async getOptionContracts(query: OptionContractsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.underlying_symbols) {
      preparedQuery.underlying_symbols = query.underlying_symbols.join(",");
    }

    const response = await this.client.fetch("v2/options/contracts", "GET", {
      query: preparedQuery,
    });
    if (response.status !== 200) {
      throw new Error(
        `Get Option Contracts: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawOptionContract[];
    // TODO validate
    return json.map((contract) => parse(OptionContractSchema, contract));
  }
  async getOptionContract(symbol_or_id: string) {
    const response = await this.client.fetch(
      `v2/options/contracts/${symbol_or_id}`,
      "GET",
    );

    if (response.status === 404) {
      throw new Error(`Get Option Contract: 404 Not Found: ${symbol_or_id}`);
    }
    if (response.status !== 200) {
      throw new Error(
        `Get Option Contract: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawOptionContract;
    // TODO validate
    return parse(OptionContractSchema, json);
  }

  async getTreasuries(query: TreasuriesQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.cusips) preparedQuery.cusips = query.cusips.join(",");
    if (query.isins) preparedQuery.isins = query.isins.join(",");

    const response = await this.client.fetch("v2/treasuries", "GET", {
      query: preparedQuery,
    });
    if (response.status === 400) {
      throw new Error(
        `Get Treasuries: 400 Bad Request: ${response.statusText}`,
      );
    }
    if (response.status === 403) {
      throw new Error(`Get Treasuries: 403 Forbidden: ${response.statusText}`);
    }
    if (response.status === 429) {
      throw new Error(
        `Get Treasuries: 429 Too Many Requests: ${response.statusText}`,
      );
    }
    if (response.status === 500) {
      throw new Error(
        `Get Treasuries: 500 Internal Server Error: ${response.statusText}`,
      );
    }
    if (response.status !== 200) {
      throw new Error(
        `Get Treasuries: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawTreasury[];
    // TODO validate
    return json.map((treasury) => parse(TreasurySchema, treasury));
  }
}
