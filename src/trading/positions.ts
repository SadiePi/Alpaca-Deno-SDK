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
  async all(): Promise<Position[]> {
    const response = await this.client.fetch("v2/positions", "GET");
    if (response.status !== 200)
      throw new Error(`Get All Positions: Undocumented response status: ${response.status} ${response.statusText}`);

    return AllPositionsResponseSchema.parse(await response.json());
  }

  async closeAll(cancel_orders = false): Promise<ClosePositionResponse[]> {
    const response = await this.client.fetch("v2/positions", "DELETE", { query: { cancel_orders } });
    if (response.status === 500) throw new Error("Close All Positions: Failed to liquedate");
    if (response.status !== 207)
      throw new Error(`Close All Positions: Undocumented response status: ${response.status} ${response.statusText}`);

    const parsed = CloseAllPositionsResponseSchema.parse(await response.json());

    const errors = parsed
      .filter(r => r.status !== 200)
      .map(r => new Error(`Close All Positions: Failed to close ${r.symbol}: ${r.status}`));
    if (errors.length) throw new AggregateError(errors);

    return parsed;
  }

  async get(symbol_or_asset_id: string): Promise<Position> {
    const response = await this.client.fetch(`v2/positions/${symbol_or_asset_id}`, "GET");
    if (response.status !== 200)
      throw new Error(`Get Position: Undocumented response status: ${response.status} ${response.statusText}`);

    return PositionSchema.parse(await response.json());
  }

  async close(symbol_or_asset_id: string, query: ClosePositionQuery): Promise<Order> {
    const response = await this.client.fetch(`v2/positions/${symbol_or_asset_id}`, "DELETE", { query });
    if (response.status !== 200)
      throw new Error(`Close Position: Undocumented response status: ${response.status} ${response.statusText}`);

    return OrderSchema.parse(await response.json());
  }

  async exercise(symbol_or_contract_id: string): Promise<void> {
    const response = await this.client.fetch(`v2/positions/${symbol_or_contract_id}/exercise`, "POST");
    if (response.status === 403)
      throw new Error(`Exercise Options Position: Available position quantity is not sufficient: ${response.status}`);
    if (response.status === 422)
      throw new Error(`Exercise Options Position: One or more parameters provided are invalid: ${response.status}`);
    if (response.status !== 200)
      throw new Error(
        `Exercise Options Position: Undocumented response status: ${response.status} ${response.statusText}`
      );
    // no response body
  }
}
