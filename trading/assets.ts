import { UUID } from "../common.ts";

type ActiveStatus = "active" | "inactive";
type AssetClass = "us_equity" | "us_option" | "crypto";
type Exchange =
  | "AMEX"
  | "ARCA"
  | "BATS"
  | "NYSE"
  | "NASDAQ"
  | "NYSEARCA"
  | "OTC";
type Attribute =
  | "ptp_no_exception"
  | "ptp_with_exception"
  | "ipo"
  | "has_options"
  | "options_late_close";
type ContractType = "call" | "put";
type ContractStyle = "american" | "european";
type TreasurySubtype =
  | "bond"
  | "bill"
  | "note"
  | "strips"
  | "tips"
  | "floating";
type BondStatus = "outstanding" | "matured" | "pre_issuance";
type DeliverableType = "cash" | "equity";
type SettlementType = "T+0" | "T+1" | "T+2" | "T+3" | "T+4" | "T+5";
type SettlementMethod = "BTOB" | "CADF" | "CAFX" | "CCC";
type CouponType = "fixed" | "floating" | "zero";
type CouponFrequency =
  | "annual"
  | "semi_annual"
  | "quarterly"
  | "monthly"
  | "zero";

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

interface BaseAsset {
  id: UUID;
  class: AssetClass;
  cusip: string | null;
  exchange: Exchange;
  symbol: string;
  name: string;
  status: ActiveStatus;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
  // maintenance_margin_requirement: number; // deprecated, see margin_requirement_long or margin_requirement_short
  attributes: Attribute[];
}

export interface RawAsset extends BaseAsset {
  margin_requirement_long: string; // parse to number
  margin_requirement_short: string; // parse to number
}

export interface Asset extends BaseAsset {
  raw: RawAsset;
  margin_requirement_long: number;
  margin_requirement_short: number;
}

export function parseAsset(raw: RawAsset): Asset {
  return {
    ...raw,
    raw,
    margin_requirement_long: parseFloat(raw.margin_requirement_long),
    margin_requirement_short: parseFloat(raw.margin_requirement_short),
  };
}

interface BaseDeliverable {
  type: DeliverableType;
  symbol: string;
  asset_id?: string;
  settlement_type: SettlementType;
  settlement_method: SettlementMethod;
  delayed_settlement: boolean;
}

export interface RawDeliverable extends BaseDeliverable {
  amount: string;
  allocation_percentage: string;
}

export interface Deliverable extends BaseDeliverable {
  raw: RawDeliverable;
  amount: number;
  allocation_percentage: number;
}

export function parseDeliverable(raw: RawDeliverable): Deliverable {
  return {
    ...raw,
    raw,
    amount: parseFloat(raw.amount),
    allocation_percentage: parseFloat(raw.allocation_percentage),
  };
}

interface BaseOptionContract {
  id: string;
  symbol: string;
  name: string;
  status: ActiveStatus;
  tradable: boolean;
  root_symbol: string;
  underlying_symbol: string;
  underlying_asset_id: string;
  type: ContractType;
  style: ContractStyle;
}

export interface RawOptionContract extends BaseOptionContract {
  expiration_date: unknown; // date
  strike_price: string;
  multiplier: string;
  size: string;
  open_interest: string;
  open_interest_date: unknown; // date
  close_price: string;
  close_price_date: unknown; // date
  deliverables: RawDeliverable[];
}

export interface OptionContract extends BaseOptionContract {
  raw: RawOptionContract;
  // expiration_date: Temporal.PlainDate;
  strike_price: number;
  multiplier: number;
  size: number;
  open_interest: number;
  // open_interest_date: Temporal.PlainDate;
  close_price: number;
  // close_price_date: Temporal.PlainDate;
  deliverables: Deliverable[];
}

export function parseOptionContract(raw: RawOptionContract): OptionContract {
  return {
    ...raw,
    raw,
    // expiration_date: Temporal.PlainDate.from(raw.expiration_date),
    strike_price: parseFloat(raw.strike_price),
    multiplier: parseFloat(raw.multiplier),
    size: parseFloat(raw.size),
    open_interest: parseFloat(raw.open_interest),
    // open_interest_date: Temporal.PlainDate.from(raw.open_interest_date),
    close_price: parseFloat(raw.close_price),
    // close_price_date: Temporal.PlainDate.from(raw.close_price_date),
    deliverables: raw.deliverables.map(parseDeliverable),
  };
}

interface BaseTreasury {
  cusip: string;
  isin: string;
  bond_status: BondStatus;
  tradable: boolean;
  subtype: TreasurySubtype;
  description: string;
  description_short: string;
  close_price: number;
  close_yield_to_maturity: number;
  close_yield_to_worst: number;
  coupon: number;
  coupon_type: CouponType;
  coupon_frequency: CouponFrequency;
}

export interface RawTreasury extends BaseTreasury {
  issue_date: unknown; // date
  maturity_date: unknown; // date
  close_price_date: unknown; // date
  first_coupon_date: unknown; // date
  next_coupon_date: unknown; // date
  last_coupon_date: unknown; // date
}

export interface Treasury extends BaseTreasury {
  raw: RawTreasury;
  // issue_date: Temporal.PlainDate;
  // maturity_date: Temporal.PlainDate;
  // close_price_date: Temporal.PlainDate;
  // first_coupon_date: Temporal.PlainDate;
  // next_coupon_date: Temporal.PlainDate;
  // last_coupon_date: Temporal.PlainDate;
}

export function parseTreasury(raw: RawTreasury): Treasury {
  return {
    ...raw,
    raw,
    // issue_date: Temporal.PlainDate.from(raw.issue_date),
    // maturity_date: Temporal.PlainDate.from(raw.maturity_date),
    // close_price_date: Temporal.PlainDate.from(raw.close_price_date),
    // first_coupon_date: Temporal.PlainDate.from(raw.first_coupon_date),
    // next_coupon_date: Temporal.PlainDate.from(raw.next_coupon_date),
    // last_coupon_date: Temporal.PlainDate.from(raw.last_coupon_date),
  };
}
