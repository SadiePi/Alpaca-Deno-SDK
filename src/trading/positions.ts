import { ClientModule } from "../client.ts";
import { AssetClassSchema, ExchangeSchema } from "../common.ts";
import { Z } from "../external.ts";
import { Order, OrderSchema, OrderSideSchema } from "./orders.ts";

export const PositionSchema = Z.object({
  asset_id: Z.uuid(),
  symbol: Z.string(),
  exchange: ExchangeSchema,
  asset_class: AssetClassSchema,
  avg_entry_price: Z.coerce.number(),
  qty: Z.coerce.number(),
  qty_available: Z.coerce.number().optional(),
  side: OrderSideSchema,
  market_value: Z.coerce.number(),
  cost_basis: Z.coerce.number(),
  unrealized_pl: Z.coerce.number(),
  unrealized_plpc: Z.coerce.number(),
  unrealized_intraday_pl: Z.coerce.number(),
  unrealized_intraday_plpc: Z.coerce.number(),
  current_price: Z.coerce.number(),
  lastday_price: Z.coerce.number(),
  change_today: Z.coerce.number(),
  asset_marginable: Z.boolean(),
});

export type Position = Z.infer<typeof PositionSchema>;

const AllPositionsResponseSchema = PositionSchema.array();

export const ClosePositionQuerySchema = Z.union([
  Z.object({ qty: Z.number().transform(String) }),
  Z.object({ percentage: Z.number().transform(String) }),
]);
export type ClosePositionQuery = Z.input<typeof ClosePositionQuerySchema>;

export const ClosePositionResponseSchema = Z.object({
  symbol: Z.string(),
  status: Z.number(),
  body: OrderSchema,
});

export type ClosePositionResponse = Z.infer<typeof ClosePositionResponseSchema>;
export const CloseAllPositionsResponseSchema = ClosePositionResponseSchema.array();

export default class TradingPositionsModule extends ClientModule {
  all(): Promise<Position[]> {
    return this.client.fetch({
      name: "Get All Positions",
      endpoint: "v2/positions",
      method: "GET",

      querySchema: Z.never(),
      bodySchema: Z.never(),
      responseSchema: AllPositionsResponseSchema,

      okStatus: 200,
      statusMessages: {},

      payload: {},
    });
  }

  closeAll(cancel_orders = false): Promise<ClosePositionResponse[]> {
    return this.client
      .fetch({
        name: "Close All Positions",
        endpoint: "v2/positions",
        method: "DELETE",

        querySchema: Z.object({ cancel_orders: Z.boolean().optional() }),
        bodySchema: Z.never(),
        responseSchema: CloseAllPositionsResponseSchema,

        okStatus: 207,
        statusMessages: {
          500: "Close All Positions: Failed to liquedate",
        },

        payload: { query: { cancel_orders } },
      })
      .then(parsed => {
        const errors = parsed
          .filter(r => r.status !== 200)
          .map(r => new Error(`Close All Positions: Failed to close ${r.symbol}: ${r.status}`));
        if (errors.length) throw new AggregateError(errors);
        return parsed;
      });
  }

  get(symbol_or_asset_id: string): Promise<Position> {
    return this.client.fetch({
      name: "Get Position",
      endpoint: `v2/positions/${symbol_or_asset_id}`,
      method: "GET",

      querySchema: Z.never(),
      bodySchema: Z.never(),
      responseSchema: PositionSchema,

      okStatus: 200,
      statusMessages: {},

      payload: {},
    });
  }

  close(symbol_or_asset_id: string, query: ClosePositionQuery): Promise<Order> {
    return this.client.fetch({
      name: "Close Position",
      endpoint: `v2/positions/${symbol_or_asset_id}`,
      method: "DELETE",

      querySchema: ClosePositionQuerySchema,
      bodySchema: Z.never(),
      responseSchema: OrderSchema,

      okStatus: 200,
      statusMessages: {},

      payload: { query },
    });
  }

  exercise(symbol_or_contract_id: string): Promise<void> {
    return this.client.fetch({
      name: "Exercise Options Position",
      endpoint: `v2/positions/${symbol_or_contract_id}/exercise`,
      method: "POST",

      querySchema: Z.never(),
      bodySchema: Z.never(),
      responseSchema: Z.never(),

      okStatus: 200,
      statusMessages: {
        403: "Exercise Options Position: Available position quantity is not sufficient",
        422: "Exercise Options Position: One or more parameters provided are invalid",
      },

      payload: {},
    });
  }
}
