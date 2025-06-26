import { UUID } from "../common.ts";
import { AssetClass } from "./assets.ts";

export type OrderClass = "simple" | "bracket" | "oco" | "oto" | "mleg";
export type OrderSide = "buy" | "sell";
export type OrderType =
  | "market"
  | "limit"
  | "stop"
  | "stop_limit"
  | "trailing_stop";
export type TimeInForce = "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";
export type RawOrderLeg = unknown;
export type OrderLeg = unknown;
export type OrderTakeProfit = unknown;
export type OrderStopLoss = unknown;
export type PositionIntent =
  | "buy_to_open"
  | "buy_to_close"
  | "sell_to_open"
  | "sell_to_close";
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

export interface OrderBody { // TODO differentiate shapes
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
  created_at: unknown; // date-time
  updated_at?: unknown; // date-time
  submitted_at?: unknown; // date-time
  filled_at?: unknown; // date-time
  expired_at?: unknown; // date-time
  canceled_at?: unknown; // date-time
  failed_at?: unknown; // date-time
  replaced_at?: unknown; // date-time
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
