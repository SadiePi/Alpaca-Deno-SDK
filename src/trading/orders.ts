import { ClientModule } from "../client.ts";
import { AssetClass, QueryParams } from "../common.ts";
import { Morph, Parsed, Raw, UUID } from "../morph.ts";

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

export type RawOrderLeg = unknown;
export type OrderLeg = unknown;
export type OrderTakeProfit = unknown;
export type OrderStopLoss = unknown;

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

export const ParseOrder = Morph.object.parse({
  id: Morph.string.tagged.uuid,
  client_order_id: Morph.I<string>(),
  replaced_by: Morph.string.tagged.uuid,
  replaces: Morph.string.tagged.uuid,
  asset_id: Morph.string.tagged.uuid,
  symbol: Morph.I<string>(),
  asset_class: Morph.string.enum(AssetClass),
  order_class: Morph.string.enum(OrderClass),
  order_type: Morph.string.enum(OrderType), // deprecated, see type
  type: Morph.string.enum(OrderType),
  side: Morph.string.enum(OrderSide),
  time_in_force: Morph.string.enum(TimeInForce),
  status: Morph.string.enum(OrderStatus),
  extended_hours: Morph.I<boolean>(),
  position_intent: Morph.string.enum(PositionIntent),
  // created_at: From.I<string>(), // date-time
  // updated_at: From.I<string>(), // date-time
  // submitted_at: From.I<string>(), // date-time
  // filled_at: From.I<string>(), // date-time
  // expired_at: From.I<string>(), // date-time
  // canceled_at: From.I<string>(), // date-time
  // failed_at: From.I<string>(), // date-time
  // replaced_at: From.I<string>(), // date-time
  notional: Morph.string.float, // deprecated, see qty
  qty: Morph.string.float,
  filled_qty: Morph.string.float,
  filled_avg_price: Morph.string.float,
  limit_price: Morph.string.float,
  stop_price: Morph.string.float,
  legs: Morph.I<RawOrderLeg[]>(),
  trail_percent: Morph.string.float,
  trail_price: Morph.string.float,
  hwm: Morph.string.float,
});

export type RawOrder = Raw<typeof ParseOrder>;
export type Order = Parsed<typeof ParseOrder>;

export const ParseDeleteOrderResponse = Morph.object.parse({
  status: Morph.I<number>(),
  id: Morph.string.tagged.uuid,
});

export type RawDeleteOrderResponse = Raw<typeof ParseDeleteOrderResponse>;
export type DeleteOrderResponse = Parsed<typeof ParseDeleteOrderResponse>;

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

    return ((await response.json()) as RawOrder[]).map(ParseOrder);
  }

  async deleteAll() {
    const response = await this.client.fetch("v2/orders", "DELETE");
    if (response.status !== 207)
      throw new Error(`Delete All Orders: Undocumented response status: ${response.status} ${response.statusText}`);

    const parsed = ((await response.json()) as RawDeleteOrderResponse[]).map(ParseDeleteOrderResponse);
    const errors = parsed
      .filter(order => order.status !== 200)
      .map(order => new Error(`Delete All Orders: Failed to delete order ${order.id}: ${order.status}`));
    if (errors) throw errors;

    return parsed;
  }

  async getByClientID(client_order_id: UUID) {
    const preparedQuery: QueryParams = { client_order_id };

    const response = await this.client.fetch("v2/orders:by_client_order_id", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(
        `Get Order by Client ID: Undocumented response status: ${response.status} ${response.statusText}`
      );

    return ParseOrder(await response.json());
  }

  async get(order_id: UUID, nested?: boolean) {
    const preparedQuery: QueryParams = {};
    if (nested) preparedQuery.nested = nested.toString();

    const response = await this.client.fetch(`v2/orders/${order_id}`, "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Order: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseOrder(await response.json());
  }

  async _replace(_order_id: UUID, _body: OrderBody) {}
  async _delete(_order_id: UUID) {}
}
