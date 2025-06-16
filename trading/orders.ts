export type OrderClass = "simple" | "bracket" | "oco" | "oto" | "mleg";
export type OrderSide = "buy" | "sell";
export type OrderType =
  | "market"
  | "limit"
  | "stop"
  | "stop_limit"
  | "trailing_stop";
export type TimeInForce = "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";
export type OrderLeg = unknown;
export type OrderTakeProfit = unknown;
export type OrderStopLoss = unknown;
export type PositionIntent =
  | "buy_to_open"
  | "buy_to_close"
  | "sell_to_open"
  | "sell_to_close";

export type OrderBody = unknown;
export type OrdersQuery = unknown;
