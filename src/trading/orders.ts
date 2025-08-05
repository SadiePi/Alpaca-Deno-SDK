import { ClientModule } from "../client.ts";
import { QueryParams, UUID } from "../common.ts";
import { From, parse, Parsed, ParsingSchema, Raw } from "../parsing.ts";
import { AssetClass } from "./assets.ts";

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

const OrderSchema = {
  id: From.string.uuid,
  client_order_id: From.I<string>(),
  replaced_by: From.string.uuid,
  replaces: From.string.uuid,
  asset_id: From.string.uuid,
  symbol: From.I<string>(),
  asset_class: From.string.enum(AssetClass),
  order_class: From.string.enum(OrderClass),
  order_type: From.string.enum(OrderType), // deprecated, see type
  type: From.string.enum(OrderType),
  side: From.string.enum(OrderSide),
  time_in_force: From.string.enum(TimeInForce),
  status: From.string.enum(OrderStatus),
  extended_hours: From.I<boolean>(),
  position_intent: From.string.enum(PositionIntent),
  // created_at: From.I<string>(), // date-time
  // updated_at: From.I<string>(), // date-time
  // submitted_at: From.I<string>(), // date-time
  // filled_at: From.I<string>(), // date-time
  // expired_at: From.I<string>(), // date-time
  // canceled_at: From.I<string>(), // date-time
  // failed_at: From.I<string>(), // date-time
  // replaced_at: From.I<string>(), // date-time
  notional: From.string.float, // deprecated, see qty
  qty: From.string.float,
  filled_qty: From.string.float,
  filled_avg_price: From.string.float,
  limit_price: From.string.float,
  stop_price: From.string.float,
  legs: From.I<RawOrderLeg[]>(),
  trail_percent: From.string.float,
  trail_price: From.string.float,
  hwm: From.string.float,
} as const satisfies ParsingSchema;
export type RawOrder = Raw<typeof OrderSchema>;
export type Order = Parsed<typeof OrderSchema>;

const DeleteOrderResponseSchema = {
  status: From.I<number>(),
  id: From.string.uuid,
} as const satisfies ParsingSchema;
export type RawDeleteOrderResponse = Raw<typeof DeleteOrderResponseSchema>;
export type DeleteOrderResponse = Parsed<typeof DeleteOrderResponseSchema>;

export default class TradingOrdersModule extends ClientModule {
  async _create(_body: OrderBody) {}

  async search(query: OrdersQuery) {
    const preparedQuery = { ...query } as QueryParams;
    // if(query.after) preparedQuery.after = converted
    // if(query.until) preparedQuery.until = converted
    if (query.symbols) preparedQuery.symbols = query.symbols.join(",");

    const response = await this.client.fetch("v2/orders", "GET", {
      query: preparedQuery,
    });
    if (response.status !== 200) {
      throw new Error(
        `Get Orders: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawOrder[];
    // TODO validate
    return json.map((order) => parse(OrderSchema, order));
  }

  async deleteAll() {
    const response = await this.client.fetch("v2/orders", "DELETE");
    if (response.status !== 207) {
      throw new Error(
        `Delete All Orders: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawDeleteOrderResponse[];
    // TODO validate
    const parsed = json.map((order) => parse(DeleteOrderResponseSchema, order));
    parsed.forEach((order) => {
      if (order.status !== 200) {
        throw new Error(
          `Delete All Orders: Order ${order.id} failed with status ${order.status}`,
        );
      }
    });
    return parsed;
  }

  async getByClientID(client_order_id: UUID) {
    const preparedQuery: QueryParams = { client_order_id };

    const response = await this.client.fetch(
      "v2/orders:by_client_order_id",
      "GET",
      { query: preparedQuery },
    );
    if (response.status !== 200) {
      throw new Error(
        `Get Order by Client ID: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawOrder;
    // TODO validate
    return parse(OrderSchema, json);
  }

  async get(_order_id: UUID, nested?: boolean) {
    const preparedQuery: QueryParams = {};
    if (nested) preparedQuery.nested = nested.toString();

    const response = await this.client.fetch(`v2/orders/${_order_id}`, "GET", {
      query: preparedQuery,
    });
    if (response.status !== 200) {
      throw new Error(
        `Get Order: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = (await response.json()) as RawOrder;
    // TODO validate
    return parse(OrderSchema, json);
  }

  async _replace(_order_id: UUID, _body: OrderBody) {}
  async _delete(_order_id: UUID) {}
}
