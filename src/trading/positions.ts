import { ClientModule } from "../client.ts";
import { AssetClass, Exchange } from "../common.ts";
import { Z } from "../external.ts";
import { Order, OrderSchema, OrderSide } from "./orders.ts";

export const PositionSchema = Z.object({
  asset_id: Z.uuid(),
  symbol: Z.string(),
  exchange: Z.enum(Exchange),
  asset_class: Z.enum(AssetClass),
  avg_entry_price: Z.coerce.number(),
  qty: Z.coerce.number(),
  qty_available: Z.coerce.number(),
  side: Z.enum(OrderSide),
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

export type RawPosition = Z.input<typeof PositionSchema>;
export type Position = Z.infer<typeof PositionSchema>;

export type ClosePositionQuery = { qty: number } | { percentage: number };
export type CloseAllPositionsQuery = { cancel_orders: boolean };

export const ClosePositionResponseSchema = Z.object({
  symbol: Z.string(),
  status: Z.number(),
  body: OrderSchema,
});

export type RawClosePositionResponse = Z.input<typeof ClosePositionResponseSchema>;
export type ClosePositionResponse = Z.infer<typeof ClosePositionResponseSchema>;

export default class TradingPositionsModule extends ClientModule {
  async all(): Promise<Position[]> {
    const response = await this.client.fetch("v2/positions", "GET");
    if (response.status !== 200)
      throw new Error(`Get All Positions: Undocumented response status: ${response.status} ${response.statusText}`);

    return PositionSchema.array().parse(await response.json());
  }

  async closeAll(query: CloseAllPositionsQuery): Promise<ClosePositionResponse[]> {
    const response = await this.client.fetch("v2/positions", "DELETE", { query });
    if (response.status === 500) throw new Error("Close All Positions: Failed to liquedate");
    if (response.status !== 207)
      throw new Error(`Close All Positions: Undocumented response status: ${response.status} ${response.statusText}`);

    const parsed = ClosePositionResponseSchema.array().parse(await response.json());
    const errors = parsed
      .filter(r => r.status !== 200)
      .map(r => new Error(`Close All Positions: Failed to close ${r.symbol}: ${r.status}`));
    if (errors.length > 0) throw new AggregateError(errors);

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
