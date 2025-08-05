import { ClientModule } from "../client.ts";
import { AssetClass, QueryParams } from "../common.ts";
import { Z } from "../external.ts";

export enum OrderClass {
  Simple = "simple",
  Bracket = "bracket",
  Oco = "oco",
  Oto = "oto",
  Mleg = "mleg",
}

export enum OrderSide {
  Buy = "buy",
  Sell = "sell",
}

export enum OrderType {
  Market = "market",
  Limit = "limit",
  Stop = "stop",
  StopLimit = "stop_limit",
  TrailingStop = "trailing_stop",
}

export enum TimeInForce {
  Day = "day",
  Gtc = "gtc",
  Opg = "opg",
  Cls = "cls",
  Ioc = "ioc",
  Fok = "fok",
}

export enum PositionIntent {
  BuyToOpen = "buy_to_open",
  BuyToClose = "buy_to_close",
  SellToOpen = "sell_to_open",
  SellToClose = "sell_to_close",
}

export enum OrderQueryStatus {
  Open = "open",
  Closed = "closed",
}

export enum OrderQueryDirection {
  Asc = "asc",
  Desc = "desc",
}

export enum OrderStatus {
  New = "new",
  PartiallyFilled = "partially_filled",
  Filled = "filled",
  DoneForDay = "done_for_day",
  Canceled = "canceled",
  Expired = "expired",
  Replaced = "replaced",
  PendingCancel = "pending_cancel",
  PendingReplace = "pending_replace",
  Accepted = "accepted",
  PendingNew = "pending_new",
  AcceptedForBidding = "accepted_for_bidding",
  Stopped = "stopped",
  Rejected = "rejected",
  Suspended = "suspended",
  Calculated = "calculated",
}

export const OrderLegSchema = Z.unknown();
export type RawOrderLeg = Z.input<typeof OrderLegSchema>;
export type OrderLeg = Z.infer<typeof OrderLegSchema>;

export const OrderTakeProfitSchema = Z.unknown();
export type OrderTakeProfit = Z.infer<typeof OrderTakeProfitSchema>;

export const OrderStopLossSchema = Z.unknown();
export type OrderStopLoss = Z.infer<typeof OrderStopLossSchema>;

export interface OrderBody {
  // TODO differentiate shapes
  symbol?: string;
  qty?: number;
  notional?: number;
  side?: OrderSide;
  type: OrderType;
  time_in_force: TimeInForce;
  limit_price?: number;
  stop_price?: number;
  trail_price?: number;
  trail_percent?: number;
  extended_hours?: boolean;
  client_order_id?: string;
  order_class?: OrderClass;
  legs?: OrderLeg[];
  take_profit?: OrderTakeProfit;
  stop_loss?: OrderStopLoss;
  position_intent?: PositionIntent;
}

export interface OrdersQuery {
  status?: OrderQueryStatus;
  limit?: number;
  after?: Temporal.PlainDateTime;
  until?: Temporal.PlainDateTime;
  direction?: OrderQueryDirection;
  nested?: boolean;
  symbols?: string[];
  side?: OrderSide;
  asset_class?: AssetClass[];
}

export const OrderSchema = Z.object({
  id: Z.uuid(),
  client_order_id: Z.string(),
  replaced_by: Z.uuid(),
  replaces: Z.uuid(),
  asset_id: Z.uuid(),
  symbol: Z.string(),
  asset_class: Z.enum(AssetClass),
  order_class: Z.enum(OrderClass),
  order_type: Z.enum(OrderType), // deprecated, see type
  type: Z.enum(OrderType),
  side: Z.enum(OrderSide),
  time_in_force: Z.enum(TimeInForce),
  status: Z.enum(OrderStatus),
  extended_hours: Z.boolean(),
  position_intent: Z.enum(PositionIntent),
  // created_at: From.I<string>(), // date-time
  // updated_at: From.I<string>(), // date-time
  // submitted_at: From.I<string>(), // date-time
  // filled_at: From.I<string>(), // date-time
  // expired_at: From.I<string>(), // date-time
  // canceled_at: From.I<string>(), // date-time
  // failed_at: From.I<string>(), // date-time
  // replaced_at: From.I<string>(), // date-time
  notional: Z.coerce.number(), // deprecated, see qty
  qty: Z.coerce.number(),
  filled_qty: Z.coerce.number(),
  filled_avg_price: Z.coerce.number(),
  limit_price: Z.coerce.number(),
  stop_price: Z.coerce.number(),
  legs: Z.array(OrderLegSchema),
  trail_percent: Z.coerce.number(),
  trail_price: Z.coerce.number(),
  hwm: Z.coerce.number(),
});

export type RawOrder = Z.input<typeof OrderSchema>;
export type Order = Z.infer<typeof OrderSchema>;

export const DeleteOrderResponseSchema = Z.object({
  status: Z.number(),
  id: Z.string().uuid(),
});

export type RawDeleteOrderResponse = Z.input<typeof DeleteOrderResponseSchema>;
export type DeleteOrderResponse = Z.infer<typeof DeleteOrderResponseSchema>;

export default class TradingOrdersModule extends ClientModule {
  async _create(_body: OrderBody) {}

  async search(query: OrdersQuery) {
    const preparedQuery = { ...query } as QueryParams;
    // if(query.after) preparedQuery.after = converted
    // if(query.until) preparedQuery.until = converted
    if (query.symbols) preparedQuery.symbols = query.symbols.join(",");

    const response = await this.client.fetch("v2/orders", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Orders: Undocumented response status: ${response.status} ${response.statusText}`);

    return OrderSchema.array().parse(await response.json());
  }

  async deleteAll() {
    const response = await this.client.fetch("v2/orders", "DELETE");
    if (response.status !== 207)
      throw new Error(`Delete All Orders: Undocumented response status: ${response.status} ${response.statusText}`);

    const parsed = DeleteOrderResponseSchema.array().parse(await response.json());
    const errors = parsed
      .filter(order => order.status !== 200)
      .map(order => new Error(`Delete All Orders: Failed to delete order ${order.id}: ${order.status}`));
    if (errors) throw errors;

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

  async _replace(_order_id: string, _body: OrderBody) {}
  async _delete(_order_id: string) {}
}
