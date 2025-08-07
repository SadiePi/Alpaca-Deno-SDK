import { ClientModule } from "../client.ts";
import { AlpacaDateSchema, AssetClassSchema, ExchangeSchema } from "../common.ts";
import { Z } from "../external.ts";

export const ActiveStatusSchema = Z.union([Z.literal("active"), Z.literal("inactive")]);

export const AttributeSchema = Z.union([
  Z.literal("ptp_no_exception"),
  Z.literal("ptp_with_exception"),
  Z.literal("ipo"),
  Z.literal("has_options"),
  Z.literal("options_late_close"),
]);

export const ContractTypeSchema = Z.union([Z.literal("call"), Z.literal("put")]);

export const ContractStyleSchema = Z.union([Z.literal("american"), Z.literal("european")]);

export const TreasurySubtypeSchema = Z.union([
  Z.literal("bond"),
  Z.literal("bill"),
  Z.literal("note"),
  Z.literal("strips"),
  Z.literal("tips"),
  Z.literal("floating"),
]);

export const BondStatusSchema = Z.union([Z.literal("outstanding"), Z.literal("matured"), Z.literal("pre_issuance")]);

export const DeliverableTypeSchema = Z.union([Z.literal("cash"), Z.literal("equity")]);

export const SettlementTypeSchema = Z.union([
  Z.literal("T+0"),
  Z.literal("T+1"),
  Z.literal("T+2"),
  Z.literal("T+3"),
  Z.literal("T+4"),
  Z.literal("T+5"),
]);

export const SettlementMethodSchema = Z.union([
  Z.literal("BTOB"),
  Z.literal("CADF"),
  Z.literal("CAFX"),
  Z.literal("CCC"),
]);

export const CouponTypeSchema = Z.union([Z.literal("fixed"), Z.literal("floating"), Z.literal("zero")]);

export const CouponFrequencySchema = Z.union([
  Z.literal("annual"),
  Z.literal("semi_annual"),
  Z.literal("quarterly"),
  Z.literal("monthly"),
  Z.literal("zero"),
]);

export const AssetSchema = Z.object({
  id: Z.uuid(),
  class: AssetClassSchema,
  cusip: Z.string().nullable().optional(),
  exchange: ExchangeSchema,
  symbol: Z.string(),
  name: Z.string().regex(/.+/),
  status: ActiveStatusSchema,
  tradable: Z.boolean(),
  marginable: Z.boolean(),
  shortable: Z.boolean(),
  easy_to_borrow: Z.boolean(),
  fractionable: Z.boolean(),
  maintenance_margin_requirement: Z.number().optional(), // deprecated, see margin_requirement_long or margin_requirement_short
  margin_requirement_long: Z.coerce.number().optional(),
  margin_requirement_short: Z.coerce.number().optional(),
  attributes: AttributeSchema.array().optional(),
}).strict();

export type Asset = Z.infer<typeof AssetSchema>;

export const AssetsQuerySchema = Z.object({
  status: ActiveStatusSchema.optional(),
  asset_class: AssetClassSchema.optional(),
  exchange: ExchangeSchema.optional(),
  attributes: AttributeSchema.array()
    .transform(arr => arr.join(","))
    .optional(),
}).strict();

export type AssetsQuery = Z.input<typeof AssetsQuerySchema>;

export const AssetsQueryResponseSchema = AssetSchema.array();

export const DeliverableSchema = Z.object({
  type: DeliverableTypeSchema,
  symbol: Z.string(),
  asset_id: Z.uuid().optional(),
  amount: Z.coerce.number(),
  allocation_percentage: Z.coerce.number(),
  settlement_type: SettlementTypeSchema,
  settlement_method: SettlementMethodSchema,
  delayed_settlement: Z.boolean(),
}).strict();

export type RawDeliverable = Z.input<typeof DeliverableSchema>;
export type Deliverable = Z.infer<typeof DeliverableSchema>;

export const OptionContractSchema = Z.object({
  id: Z.uuid(),
  symbol: Z.string(),
  name: Z.string(),
  status: ActiveStatusSchema,
  tradable: Z.boolean(),
  expiration_date: AlpacaDateSchema,
  root_symbol: Z.string().optional(),
  underlying_symbol: Z.string(),
  underlying_asset_id: Z.uuid(),
  type: ContractTypeSchema,
  style: ContractStyleSchema,
  strike_price: Z.coerce.number(),
  multiplier: Z.coerce.number(),
  size: Z.coerce.number(),
  open_interest: Z.coerce.number().optional(),
  open_interest_date: AlpacaDateSchema.optional(),
  close_price: Z.coerce.number().optional(),
  close_price_date: AlpacaDateSchema.optional(),
  deliverables: DeliverableSchema.array().optional(),
}).strict();

export const OptionContractsQuerySchema = Z.object({
  underlying_symbols: Z.string()
    .array()
    .transform(arr => arr.join(","))
    .optional(),
  show_deliverables: Z.boolean().optional(),
  status: ActiveStatusSchema.optional(),
  expiration_date: AlpacaDateSchema.optional(),
  expiration_date_gte: AlpacaDateSchema.optional(),
  expiration_date_lte: AlpacaDateSchema.optional(),
  root_symbol: Z.string().optional(),
  type: ContractTypeSchema.optional(),
  style: ContractStyleSchema.optional(),
  strike_price_gte: Z.number().optional(),
  strike_price_lte: Z.number().optional(),
  page_token: Z.string().optional(),
  limit: Z.int().max(10000).optional(),
  ppind: Z.boolean().optional(),
}).strict();

export type OptionContractsQuery = Z.input<typeof OptionContractsQuerySchema>;

export const OptionContractsQueryResponseSchema = Z.object({
  option_contracts: OptionContractSchema.array(),
})
  .strict()
  .transform(r => r.option_contracts);

export type OptionContract = Z.infer<typeof OptionContractSchema>;

export const TreasuriesQuerySchema = Z.object({
  subtype: TreasurySubtypeSchema.optional(),
  bond_status: BondStatusSchema.optional(),
  cusips: Z.string()
    .length(12)
    .array()
    .max(1000)
    .transform(arr => arr.join(","))
    .optional(),
  isins: Z.string()
    .length(12)
    .array()
    .max(1000)
    .transform(arr => arr.join(","))
    .optional(),
}).strict();

export type TreasuriesQuery = Z.input<typeof TreasuriesQuerySchema>;

export const TreasurySchema = Z.object({
  cusip: Z.string().length(12),
  isin: Z.string().length(12),
  bond_status: BondStatusSchema,
  tradable: Z.boolean(),
  subtype: TreasurySubtypeSchema,
  issue_date: AlpacaDateSchema,
  maturity_date: AlpacaDateSchema,
  description: Z.string(),
  description_short: Z.string(),
  close_price: Z.coerce.number().optional(),
  close_price_date: AlpacaDateSchema.optional(),
  close_yield_to_maturity: Z.coerce.number().optional(),
  close_yield_to_worst: Z.coerce.number().optional(),
  coupon: Z.coerce.number(),
  coupon_type: CouponTypeSchema,
  coupon_frequency: CouponFrequencySchema,
  first_coupon_date: AlpacaDateSchema.optional(),
  next_coupon_date: AlpacaDateSchema.optional(),
  last_coupon_date: AlpacaDateSchema.optional(),
}).strict();

export type Treasury = Z.infer<typeof TreasurySchema>;

export const TreasuriesQueryResponseSchema = Z.object({
  us_treasuries: TreasurySchema.array(),
})
  .strict()
  .transform(r => r.us_treasuries);

export type TreasuriesQueryResponse = Z.infer<typeof TreasuriesQueryResponseSchema>;

export default class TradingAssetsModule extends ClientModule {
  getAssets(query: AssetsQuery) {
    return this.client.fetch({
      name: "Get Assets",
      endpoint: "v2/assets",
      method: "GET",

      querySchema: AssetsQuerySchema,
      bodySchema: Z.never(),
      responseSchema: AssetsQueryResponseSchema,

      okStatus: 200,
      statusMessages: {},

      payload: { query },
    });
  }

  getAsset(symbol_or_asset_id: string) {
    return this.client.fetch({
      name: "Get Asset",
      endpoint: `v2/assets/${symbol_or_asset_id}`,
      method: "GET",

      querySchema: Z.never(),
      bodySchema: Z.never(),
      responseSchema: AssetSchema,

      okStatus: 200,
      statusMessages: {
        404: `Asset Not Found: ${symbol_or_asset_id}`,
      },

      payload: {},
    });
  }

  getOptionContracts(query: OptionContractsQuery) {
    return this.client.fetch({
      name: "Get Option Contracts",
      endpoint: "v2/options/contracts",
      method: "GET",

      querySchema: OptionContractsQuerySchema,
      bodySchema: Z.never(),
      responseSchema: OptionContractsQueryResponseSchema,

      okStatus: 200,
      statusMessages: {},

      payload: { query },
    });
  }

  getOptionContract(symbol_or_id: string) {
    return this.client.fetch({
      name: "Get Option Contract",
      endpoint: `v2/options/contracts/${symbol_or_id}`,
      method: "GET",

      querySchema: Z.never(),
      bodySchema: Z.never(),
      responseSchema: OptionContractSchema,

      okStatus: 200,
      statusMessages: {
        404: `Option Contract Not Found: ${symbol_or_id}`,
      },

      payload: {},
    });
  }

  getTreasuries(query: TreasuriesQuery) {
    return this.client.fetch({
      name: "Get Treasuries",
      endpoint: "v2/treasuries",
      method: "GET",

      querySchema: TreasuriesQuerySchema,
      bodySchema: Z.never(),
      responseSchema: TreasuriesQueryResponseSchema,

      okStatus: 200,
      statusMessages: {
        400: "Bad Request",
        403: "Forbidden",
        429: "Too Many Requests",
        500: "Internal Server Error",
      },
      payload: { query },
    });
  }
}
