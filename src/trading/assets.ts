import { ClientModule } from "../client.ts";
import { AssetClass, Exchange, QueryParams } from "../common.ts";
import { Parsed, Raw, Morph } from "../morph.ts";

export enum ActiveStatus {
  Active = "active",
  Inactive = "inactive",
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

export const ParseAsset = Morph.object.parse({
  id: Morph.string.uuid,
  class: Morph.string.enum(AssetClass),
  cusip: Morph.I<string | null>(),
  exchange: Morph.string.enum(Exchange),
  symbol: Morph.I<string>(),
  name: Morph.I<string>(),
  status: Morph.string.enum(ActiveStatus),
  tradable: Morph.I<boolean>(),
  marginable: Morph.I<boolean>(),
  shortable: Morph.I<boolean>(),
  easy_to_borrow: Morph.I<boolean>(),
  fractionable: Morph.I<boolean>(),
  // maintenance_margin_requirement: From.string.float, // deprecated, see margin_requirement_long or margin_requirement_short
  attributes: Morph.I<Attribute[]>(),
  margin_requirement_long: Morph.string.float,
  margin_requirement_short: Morph.string.float,
});

export type RawAsset = Raw<typeof ParseAsset>;
export type Asset = Parsed<typeof ParseAsset>;

export const ParseDeliverable = Morph.object.parse({
  type: Morph.string.enum(DeliverableType),
  symbol: Morph.I<string>(),
  asset_id: Morph.I<string | null>(),
  settlement_type: Morph.string.enum(SettlementType),
  settlement_method: Morph.string.enum(SettlementMethod),
  delayed_settlement: Morph.I<boolean>(),
  amount: Morph.string.float,
  allocation_percentage: Morph.string.float,
});

export type RawDeliverable = Raw<typeof ParseDeliverable>;
export type Deliverable = Parsed<typeof ParseDeliverable>;

export const ParseOptionContract = Morph.object.parse({
  id: Morph.string.uuid,
  symbol: Morph.I<string>(),
  name: Morph.I<string>(),
  status: Morph.string.enum(ActiveStatus),
  tradable: Morph.I<boolean>(),
  root_symbol: Morph.I<string>(),
  underlying_symbol: Morph.I<string>(),
  underlying_asset_id: Morph.I<string>(),
  type: Morph.string.enum(ContractType),
  style: Morph.string.enum(ContractStyle),
  expiration_date: Morph.I<unknown>(), // date
  strike_price: Morph.string.float,
  multiplier: Morph.string.int,
  size: Morph.string.float,
  open_interest: Morph.string.float,
  open_interest_date: Morph.I<unknown>(), // date
  close_price: Morph.string.float,
  close_price_date: Morph.I<unknown>(), // date
  deliverables: Morph.I<RawDeliverable[]>(),
});

export type RawOptionContract = Raw<typeof ParseOptionContract>;
export type OptionContract = Parsed<typeof ParseOptionContract>;

export const ParseTreasury = Morph.object.parse({
  cusip: Morph.I<string>(),
  isin: Morph.I<string>(),
  bond_status: Morph.string.enum(BondStatus),
  tradable: Morph.I<boolean>(),
  subtype: Morph.string.enum(TreasurySubtype),
  description: Morph.I<string>(),
  description_short: Morph.I<string>(),
  close_price: Morph.string.float,
  close_yield_to_maturity: Morph.string.float,
  close_yield_to_worst: Morph.string.float,
  coupon: Morph.string.float,
  coupon_type: Morph.string.enum(CouponType),
  coupon_frequency: Morph.string.enum(CouponFrequency),
  issue_date: Morph.I<unknown>(), // date
  maturity_date: Morph.I<unknown>(), // date
  close_price_date: Morph.I<unknown>(), // date
  first_coupon_date: Morph.I<unknown>(), // date
  next_coupon_date: Morph.I<unknown>(), // date
  last_coupon_date: Morph.I<unknown>(), // date
});

export type RawTreasury = Raw<typeof ParseTreasury>;
export type Treasury = Parsed<typeof ParseTreasury>;

export default class TradingAssetsModule extends ClientModule {
  async getAssets(query: AssetsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.attributes) preparedQuery.attributes = query.attributes.join(",");

    const response = await this.client.fetch("v2/assets", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Assets: Undocumented response status: ${response.status} ${response.statusText}`);

    return ((await response.json()) as RawAsset[]).map(ParseAsset);
  }

  async getAsset(symbol_or_asset_id: string) {
    const response = await this.client.fetch(`v2/assets/${symbol_or_asset_id}`, "GET");
    if (response.status === 404) throw new Error(`Get Asset: 404 Not Found: ${symbol_or_asset_id}`);
    if (response.status !== 200)
      throw new Error(`Get Asset: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseAsset(await response.json());
  }

  async getOptionContracts(query: OptionContractsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.underlying_symbols) {
      preparedQuery.underlying_symbols = query.underlying_symbols.join(",");
    }

    const response = await this.client.fetch("v2/options/contracts", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Option Contracts: Undocumented response status: ${response.status} ${response.statusText}`);

    return ((await response.json()) as RawOptionContract[]).map(ParseOptionContract);
  }

  async getOptionContract(symbol_or_id: string) {
    const response = await this.client.fetch(`v2/options/contracts/${symbol_or_id}`, "GET");

    if (response.status === 404) throw new Error(`Get Option Contract: 404 Not Found: ${symbol_or_id}`);
    if (response.status !== 200)
      throw new Error(`Get Option Contract: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseOptionContract(await response.json());
  }

  async getTreasuries(query: TreasuriesQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.cusips) preparedQuery.cusips = query.cusips.join(",");
    if (query.isins) preparedQuery.isins = query.isins.join(",");

    const response = await this.client.fetch("v2/treasuries", "GET", { query: preparedQuery });
    if (response.status === 400) throw new Error(`Get Treasuries: 400 Bad Request: ${response.statusText}`);
    if (response.status === 403) throw new Error(`Get Treasuries: 403 Forbidden: ${response.statusText}`);
    if (response.status === 429) throw new Error(`Get Treasuries: 429 Too Many Requests: ${response.statusText}`);
    if (response.status === 500) throw new Error(`Get Treasuries: 500 Internal Server Error: ${response.statusText}`);
    if (response.status !== 200)
      throw new Error(`Get Treasuries: Undocumented response status: ${response.status} ${response.statusText}`);

    return ((await response.json()) as RawTreasury[]).map(ParseTreasury);
  }
}
