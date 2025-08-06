import { ClientModule } from "../client.ts";
import { AlpacaDateTimeSchema, AssetClassSchema, QueryParams } from "../common.ts";
import { Z } from "../external.ts";

export const OrderClassSchema = Z.union([
  Z.literal("simple"),
  Z.literal("bracket"),
  Z.literal("oco"),
  Z.literal("oto"),
  Z.literal("mleg"),
]);

export const OrderSideSchema = Z.union([Z.literal("buy"), Z.literal("sell")]);

export const OrderTypeSchema = Z.union([
  Z.literal("market"),
  Z.literal("limit"),
  Z.literal("stop"),
  Z.literal("stop_limit"),
  Z.literal("trailing_stop"),
]);

export const TimeInForceSchema = Z.union([
  Z.literal("day"),
  Z.literal("gtc"),
  Z.literal("opg"),
  Z.literal("cls"),
  Z.literal("ioc"),
  Z.literal("fok"),
]);

export const PositionIntentSchema = Z.union([
  Z.literal("buy_to_open"),
  Z.literal("buy_to_close"),
  Z.literal("sell_to_open"),
  Z.literal("sell_to_close"),
]);

export const OrderQueryStatusSchema = Z.union([Z.literal("open"), Z.literal("closed")]);

export const OrderQueryDirectionSchema = Z.union([Z.literal("asc"), Z.literal("desc")]);

export const OrderStatusSchema = Z.union([
  Z.literal("new"),
  Z.literal("partially_filled"),
  Z.literal("filled"),
  Z.literal("done_for_day"),
  Z.literal("canceled"),
  Z.literal("expired"),
  Z.literal("replaced"),
  Z.literal("pending_cancel"),
  Z.literal("pending_replace"),
  Z.literal("accepted"),
  Z.literal("pending_new"),
  Z.literal("accepted_for_bidding"),
  Z.literal("stopped"),
  Z.literal("rejected"),
  Z.literal("suspended"),
  Z.literal("calculated"),
]);

// TODO define
export const OrderLegSchema = Z.unknown();
export const OrderTakeProfitSchema = Z.unknown();
export const OrderStopLossSchema = Z.unknown();

export const OrderSchema = Z.object({
  id: Z.string().optional(),
  client_order_id: Z.string().max(128).optional(),
  created_at: AlpacaDateTimeSchema.optional(),
  updated_at: AlpacaDateTimeSchema.nullable().optional(),
  submitted_at: AlpacaDateTimeSchema.nullable().optional(),
  filled_at: AlpacaDateTimeSchema.nullable().optional(),
  expired_at: AlpacaDateTimeSchema.nullable().optional(),
  canceled_at: AlpacaDateTimeSchema.nullable().optional(),
  failed_at: AlpacaDateTimeSchema.nullable().optional(),
  replaced_at: AlpacaDateTimeSchema.nullable().optional(),
  replaced_by: Z.uuid().nullable().optional(),
  replaces: Z.uuid().nullable().optional(),
  asset_id: Z.uuid().optional(),
  symbol: Z.string().min(1).optional(),
  asset_class: AssetClassSchema.optional(),
  notional: Z.coerce.number().nullable(), // deprecated, see qty
  qty: Z.coerce.number().nullable(),
  filled_qty: Z.coerce.number().optional(),
  filled_avg_price: Z.coerce.number().nullable().optional(),
  order_class: OrderClassSchema.optional(),
  order_type: OrderTypeSchema.optional(), // deprecated, see type
  type: OrderTypeSchema,
  side: OrderSideSchema.optional(),
  time_in_force: TimeInForceSchema,
  limit_price: Z.coerce.number().nullable().optional(),
  stop_price: Z.coerce.number().nullable().optional(),
  status: OrderStatusSchema.optional(),
  extended_hours: Z.boolean().optional(),
  legs: OrderLegSchema.array().max(4).nullable().optional(),
  trail_percent: Z.coerce.number().nullable().optional(),
  trail_price: Z.coerce.number().nullable().optional(),
  hwm: Z.coerce.number().nullable().optional(),
  position_intent: PositionIntentSchema.optional(),
});

export type Order = Z.infer<typeof OrderSchema>;

// TODO differentiate shapes
export const CreateOrderBodySchema = Z.object({
  symbol: Z.string().optional(),
  qty: Z.number().transform(String).optional(),
  notional: Z.number().transform(String).optional(),
  side: OrderSideSchema.optional(),
  type: OrderTypeSchema,
  time_in_force: TimeInForceSchema,
  limit_price: Z.number().transform(String).optional(),
  stop_price: Z.number().transform(String).optional(),
  trail_price: Z.number().transform(String).optional(),
  trail_percent: Z.number().transform(String).optional(),
  extended_hours: Z.boolean().optional(),
  client_order_id: Z.uuid().optional(),
  order_class: OrderClassSchema.optional(),
  legs: OrderLegSchema.array().max(4).optional(),
  take_profit: OrderTakeProfitSchema.optional(),
  stop_loss: OrderStopLossSchema.optional(),
  position_intent: PositionIntentSchema.optional(),
}).strict();

export type CreateOrderBody = Z.input<typeof CreateOrderBodySchema>;

export const OrdersQuerySchema = Z.object({
  status: OrderQueryStatusSchema.optional(),
  limit: Z.number().int().max(10000).transform(String).optional(),
  after: AlpacaDateTimeSchema.optional(),
  until: AlpacaDateTimeSchema.optional(),
  direction: OrderQueryDirectionSchema.optional(),
  nested: Z.boolean().optional(),
  symbols: Z.string()
    .array()
    .transform(a => a.join(","))
    .optional(),
  side: OrderSideSchema.optional(),
  asset_class: AssetClassSchema.array()
    .transform(a => a.join(","))
    .optional(),
}).strict();

export type OrdersQuery = Z.input<typeof OrdersQuerySchema>;

export const OrdersQueryResponseSchema = OrderSchema.array();
export type OrdersQueryResponse = Z.infer<typeof OrdersQueryResponseSchema>;

export const DeleteAllOrdersResponseSchema = Z.object({
  id: Z.uuid(),
  status: Z.int(),
})
  .strict()
  .array();

export default class TradingOrdersModule extends ClientModule {
  async create(body: CreateOrderBody) {
    const preparedBody = CreateOrderBodySchema.parse(body);

    const response = await this.client.fetch("v2/orders", "POST", { body: preparedBody });
    if (response.status === 403) throw new Error("Create Order: 403 Buying power or shares is not sufficient");
    if (response.status === 422) throw new Error("Create Order: 422 Input parameters are not recognized");
    if (response.status !== 200)
      throw new Error(`Create Order: Undocumented response status: ${response.status} ${response.statusText}`);

    return OrderSchema.parse(await response.json());
  }

  async search(query: OrdersQuery) {
    const preparedQuery = OrdersQuerySchema.parse(query);

    const response = await this.client.fetch("v2/orders", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Orders: Undocumented response status: ${response.status} ${response.statusText}`);

    return OrderSchema.array().parse(await response.json());
  }

  async deleteAll() {
    const response = await this.client.fetch("v2/orders", "DELETE");
    if (response.status !== 207)
      throw new Error(`Delete All Orders: Undocumented response status: ${response.status} ${response.statusText}`);

    const parsed = DeleteAllOrdersResponseSchema.parse(await response.json());

    const errors = parsed
      .filter(order => order.status !== 200)
      .map(order => new Error(`Delete All Orders: Failed to delete order ${order.id}: ${order.status}`));
    if (errors) throw new AggregateError(errors, "Delete All Orders: Some orders failed to delete");

    return parsed;
  }

  async getByClientID(client_order_id: string) {
    const preparedQuery: QueryParams = { client_order_id };

    const response = await this.client.fetch("v2/orders:by_client_order_id", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(
        `Get Order by Client ID: Undocumented response status: ${response.status} ${response.statusText}`
      );

    return OrderSchema.parse(await response.json());
  }

  async get(order_id: string, nested?: boolean) {
    const preparedQuery: QueryParams = {};
    if (nested) preparedQuery.nested = nested.toString();

    const response = await this.client.fetch(`v2/orders/${order_id}`, "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Order: Undocumented response status: ${response.status} ${response.statusText}`);

    return OrderSchema.parse(await response.json());
  }

  async _replace(_order_id: string, _body: CreateOrderBody) {}

  async delete(order_id: string) {
    const response = await this.client.fetch(`v2/orders/${order_id}`, "DELETE");
    if (response.status === 422) throw new Error("Delete Order: 422 The order status is not cancelable");
    if (response.status !== 204)
      throw new Error(`Delete Order: Undocumented response status: ${response.status} ${response.statusText}`);
  }
}
