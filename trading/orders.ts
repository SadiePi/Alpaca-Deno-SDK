import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";
import { QueryParams, UUID, validateUUID } from "../common.ts";
import { AssetClass } from "./assets.ts";

export type OrderClass = "simple" | "bracket" | "oco" | "oto" | "mleg";
export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit" | "trailing_stop";
export type TimeInForce = "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";
export type RawOrderLeg = unknown;
export type OrderLeg = unknown;
export type OrderTakeProfit = unknown;
export type OrderStopLoss = unknown;
export type PositionIntent = "buy_to_open" | "buy_to_close" | "sell_to_open" | "sell_to_close";
export type OrderQueryStatus = "open" | "closed";
export type OrderQueryDirection = "asc" | "desc";
export type OrderStatus =
  | "new"
  | "partially_filled"
  | "filled"
  | "done_for_day"
  | "canceled"
  | "expired"
  | "replaced"
  | "pending_cancel"
  | "pending_replace"
  | "accepted"
  | "pending_new"
  | "accepted_for_bidding"
  | "stopped"
  | "rejected"
  | "suspended"
  | "calculated";

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

interface BaseOrder {
  id: string;
  client_order_id: string;
  replaced_by?: UUID;
  replaces?: UUID;
  asset_id: UUID;
  symbol?: string;
  asset_class: AssetClass;
  order_class: OrderClass;
  order_type: OrderType; // deprecated, see type
  type: OrderType;
  side: OrderSide;
  time_in_force: TimeInForce;
  status: OrderStatus;
  extended_hours: boolean;
  position_intent: PositionIntent;
}

export interface RawOrder extends BaseOrder {
  created_at: string; // date-time
  updated_at?: string; // date-time
  submitted_at?: string; // date-time
  filled_at?: string; // date-time
  expired_at?: string; // date-time
  canceled_at?: string; // date-time
  failed_at?: string; // date-time
  replaced_at?: string; // date-time
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price: string;
  limit_price: string;
  stop_price: string;
  legs: RawOrderLeg[];
  trail_percent: string;
  trail_price: string;
  hwm: string;
}

export interface Order extends BaseOrder {
  raw: RawOrder;
  created_at: Temporal.PlainDateTime;
  updated_at?: Temporal.PlainDateTime;
  submitted_at?: Temporal.PlainDateTime;
  filled_at?: Temporal.PlainDateTime;
  expired_at?: Temporal.PlainDateTime;
  canceled_at?: Temporal.PlainDateTime;
  failed_at?: Temporal.PlainDateTime;
  replaced_at?: Temporal.PlainDateTime;
  notional?: number;
  qty?: number;
  filled_qty: number;
  filled_avg_price: number;
  limit_price: number | null;
  stop_price: number | null;
  legs: OrderLeg[];
  trail_percent: number | null;
  trail_price: number | null;
  hwm: number | null;
}

export function parseOrder(raw: RawOrder): Order {
  if (!validateUUID(raw.id)) throw new Error(`Invalid UUID for order id: ${raw.id}`);
  if (!validateUUID(raw.asset_id)) throw new Error(`Invalid UUID for order asset_id: ${raw.asset_id}`);
  if (raw.replaced_by && !validateUUID(raw.replaced_by))
    throw new Error(`Invalid UUID for order replaced_by: ${raw.replaced_by}`);
  if (raw.replaces && !validateUUID(raw.replaces)) throw new Error(`Invalid UUID for order replaces: ${raw.replaces}`);

  return {
    ...raw,
    raw,
    created_at: Temporal.PlainDateTime.from(raw.created_at),
    updated_at: raw.updated_at ? Temporal.PlainDateTime.from(raw.updated_at) : undefined,
    submitted_at: raw.submitted_at ? Temporal.PlainDateTime.from(raw.submitted_at) : undefined,
    filled_at: raw.filled_at ? Temporal.PlainDateTime.from(raw.filled_at) : undefined,
    expired_at: raw.expired_at ? Temporal.PlainDateTime.from(raw.expired_at) : undefined,
    canceled_at: raw.canceled_at ? Temporal.PlainDateTime.from(raw.canceled_at) : undefined,
    failed_at: raw.failed_at ? Temporal.PlainDateTime.from(raw.failed_at) : undefined,
    replaced_at: raw.replaced_at ? Temporal.PlainDateTime.from(raw.replaced_at) : undefined,
    notional: raw.notional ? Number(raw.notional) : undefined,
    qty: raw.qty ? Number(raw.qty) : undefined,
    filled_qty: Number(raw.filled_qty),
    filled_avg_price: Number(raw.filled_avg_price),
    limit_price: raw.limit_price ? Number(raw.limit_price) : null,
    stop_price: raw.stop_price ? Number(raw.stop_price) : null,
    trail_percent: raw.trail_percent ? Number(raw.trail_percent) : null,
    trail_price: raw.trail_price ? Number(raw.trail_price) : null,
    hwm: raw.hwm ? Number(raw.hwm) : null,
  };
}

interface BaseDeleteOrderResponse {
  status: number;
}

export interface RawDeleteOrderResponse extends BaseDeleteOrderResponse {
  id: string;
}

export interface DeleteOrderResponse extends BaseDeleteOrderResponse {
  raw: RawDeleteOrderResponse;
  id: UUID;
}

export function parseDeleteOrderResponse(raw: RawDeleteOrderResponse): DeleteOrderResponse {
  if (!validateUUID(raw.id)) throw new Error(`Invalid UUID for delete order response id: ${raw.id}`);
  return {
    ...raw,
    raw,
    id: raw.id as UUID,
  };
}

export default class OrdersModule extends ClientModule<TradingClient> {
  async _create(_body: OrderBody) {}

  async search(query: OrdersQuery) {
    const preparedQuery = { ...query } as QueryParams;
    // if(query.after) preparedQuery.after = converted
    // if(query.until) preparedQuery.until = converted
    if (query.symbols) preparedQuery.symbols = query.symbols.join(",");

    const response = await this.client.fetch("v2/orders", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Orders: Unexpected response status: ${response.status} ${response.statusText}`);

    const json = (await response.json()) as RawOrder[];
    // TODO validate
    return json.map(parseOrder);
  }

  async deleteAll() {
    const response = await this.client.fetch("v2/orders", "DELETE");
    if (response.status !== 207)
      throw new Error(`Delete All Orders: Unexpected response status: ${response.status} ${response.statusText}`);

    const json = (await response.json()) as RawDeleteOrderResponse[];
    // TODO validate
    const parsed = json.map(order => parseDeleteOrderResponse(order));
    parsed.forEach(order => {
      if (order.status !== 200)
        throw new Error(`Delete All Orders: Order ${order.id} failed with status ${order.status}`);
    });
    return parsed;
  }

  async getByClientID(client_order_id: UUID) {
    const preparedQuery: QueryParams = { client_order_id };

    const response = await this.client.fetch("v2/orders:by_client_order_id", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Order by Client ID: Unexpected response status: ${response.status} ${response.statusText}`);

    const json = (await response.json()) as RawOrder;
    // TODO validate
    return parseOrder(json);
  }

  async get(_order_id: UUID, nested?: boolean) {
    const preparedQuery: QueryParams = {};
    if (nested) preparedQuery.nested = nested.toString();

    const response = await this.client.fetch(`v2/orders/${_order_id}`, "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Order: Unexpected response status: ${response.status} ${response.statusText}`);

    const json = (await response.json()) as RawOrder;
    // TODO validate
    return parseOrder(json);
  }

  async _replace(_order_id: UUID, _body: OrderBody) {}
  async _delete(_order_id: UUID) {}
}
