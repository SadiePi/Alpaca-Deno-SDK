import { ClientModule } from "../client.ts";
import { AssetClass, Exchange, QueryParams } from "../common.ts";
import { Z } from "../external.ts";

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

export const AssetSchema = Z.object({
  id: Z.uuid(),
  class: Z.enum(AssetClass),
  cusip: Z.string().nullable(),
  exchange: Z.enum(Exchange),
  symbol: Z.string(),
  name: Z.string(),
  status: Z.enum(ActiveStatus),
  tradable: Z.boolean(),
  marginable: Z.boolean(),
  shortable: Z.boolean(),
  easy_to_borrow: Z.boolean(),
  fractionable: Z.boolean(),
  // maintenance_margin_requirement: From.string.float, // deprecated, see margin_requirement_long or margin_requirement_short
  attributes: Z.array(Z.enum(Attribute)),
  margin_requirement_long: Z.coerce.number(),
  margin_requirement_short: Z.coerce.number(),
});

export type RawAsset = Z.input<typeof AssetSchema>;
export type Asset = Z.infer<typeof AssetSchema>;

export const DeliverableSchema = Z.object({
  type: Z.enum(DeliverableType),
  symbol: Z.string(),
  asset_id: Z.string().nullable(),
  settlement_type: Z.enum(SettlementType),
  settlement_method: Z.enum(SettlementMethod),
  delayed_settlement: Z.boolean(),
  amount: Z.coerce.number(),
  allocation_percentage: Z.coerce.number(),
});

export type RawDeliverable = Z.input<typeof DeliverableSchema>;
export type Deliverable = Z.infer<typeof DeliverableSchema>;

export const OptionContractSchema = Z.object({
  id: Z.uuid(),
  symbol: Z.string(),
  name: Z.string(),
  status: Z.enum(ActiveStatus),
  tradable: Z.boolean(),
  root_symbol: Z.string(),
  underlying_symbol: Z.string(),
  underlying_asset_id: Z.string(),
  type: Z.enum(ContractType),
  style: Z.enum(ContractStyle),
  expiration_date: Z.unknown(), // date
  strike_price: Z.coerce.number(),
  multiplier: Z.coerce.number(),
  size: Z.coerce.number(),
  open_interest: Z.coerce.number(),
  open_interest_date: Z.unknown(), // date
  close_price: Z.coerce.number(),
  close_price_date: Z.unknown(), // date
  deliverables: Z.array(DeliverableSchema),
});

export type RawOptionContract = Z.input<typeof OptionContractSchema>;
export type OptionContract = Z.infer<typeof OptionContractSchema>;

export const TreasurySchema = Z.object({
  cusip: Z.string(),
  isin: Z.string(),
  bond_status: Z.enum(BondStatus),
  tradable: Z.boolean(),
  subtype: Z.enum(TreasurySubtype),
  description: Z.string(),
  description_short: Z.string(),
  close_price: Z.coerce.number(),
  close_yield_to_maturity: Z.coerce.number(),
  close_yield_to_worst: Z.coerce.number(),
  coupon: Z.coerce.number(),
  coupon_type: Z.enum(CouponType),
  coupon_frequency: Z.enum(CouponFrequency),
  issue_date: Z.unknown(), // date
  maturity_date: Z.unknown(), // date
  close_price_date: Z.unknown(), // date
  first_coupon_date: Z.unknown(), // date
  next_coupon_date: Z.unknown(), // date
  last_coupon_date: Z.unknown(), // date
});

export type RawTreasury = Z.input<typeof TreasurySchema>;
export type Treasury = Z.infer<typeof TreasurySchema>;

export default class TradingAssetsModule extends ClientModule {
  async getAssets(query: AssetsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.attributes) preparedQuery.attributes = query.attributes.join(",");

    const response = await this.client.fetch("v2/assets", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Assets: Undocumented response status: ${response.status} ${response.statusText}`);

    return AssetSchema.array().parse(await response.json());
  }

  async getAsset(symbol_or_asset_id: string) {
    const response = await this.client.fetch(`v2/assets/${symbol_or_asset_id}`, "GET");
    if (response.status === 404) throw new Error(`Get Asset: 404 Not Found: ${symbol_or_asset_id}`);
    if (response.status !== 200)
      throw new Error(`Get Asset: Undocumented response status: ${response.status} ${response.statusText}`);

    return AssetSchema.parse(await response.json());
  }

  async getOptionContracts(query: OptionContractsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.underlying_symbols) {
      preparedQuery.underlying_symbols = query.underlying_symbols.join(",");
    }

    const response = await this.client.fetch("v2/options/contracts", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Option Contracts: Undocumented response status: ${response.status} ${response.statusText}`);

    return OptionContractSchema.array().parse(await response.json());
  }

  async getOptionContract(symbol_or_id: string) {
    const response = await this.client.fetch(`v2/options/contracts/${symbol_or_id}`, "GET");

    if (response.status === 404) throw new Error(`Get Option Contract: 404 Not Found: ${symbol_or_id}`);
    if (response.status !== 200)
      throw new Error(`Get Option Contract: Undocumented response status: ${response.status} ${response.statusText}`);

    return OptionContractSchema.parse(await response.json());
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

    return TreasurySchema.array().parse(await response.json());
  }
}
