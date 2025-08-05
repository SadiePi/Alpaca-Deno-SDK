import { ClientModule } from "../client.ts";
import { AssetClass, Exchange } from "../common.ts";
import { Morph, Parsed, Raw, UUID } from "../morph.ts";
import { Order, OrderSide, ParseOrder } from "./orders.ts";

export const ParsePosition = Morph.object.parse({
  asset_id: Morph.string.tagged.uuid,
  symbol: Morph.I<string>(),
  exchange: Morph.string.enum(Exchange),
  asset_class: Morph.string.enum(AssetClass),
  avg_entry_price: Morph.string.float,
  qty: Morph.string.int,
  qty_available: Morph.string.int,
  side: Morph.string.enum(OrderSide),
  market_value: Morph.string.float,
  cost_basis: Morph.string.float,
  unrealized_pl: Morph.string.float,
  unrealized_plpc: Morph.string.float,
  unrealized_intraday_pl: Morph.string.float,
  unrealized_intraday_plpc: Morph.string.float,
  current_price: Morph.string.float,
  lastday_price: Morph.string.float,
  change_today: Morph.string.float,
  asset_marginable: Morph.I<boolean>(),
});

export type RawPosition = Raw<typeof ParsePosition>;
export type Position = Parsed<typeof ParsePosition>;

export type ClosePositionQuery = { qty: number } | { percentage: number };
export type CloseAllPositionsQuery = { cancel_orders: boolean };

export const ParseClosePositionResponse = Morph.object.parse({
  symbol: Morph.I<string>(),
  status: Morph.string.int,
  body: ParseOrder,
});

export type RawClosePositionResponse = Raw<typeof ParseClosePositionResponse>;
export type ClosePositionResponse = Parsed<typeof ParseClosePositionResponse>;

export default class TradingPositionsModule extends ClientModule {
  async all(): Promise<Position[]> {
    const response = await this.client.fetch("v2/positions", "GET");
    if (response.status !== 200)
      throw new Error(`Get All Positions: Undocumented response status: ${response.status} ${response.statusText}`);

    return ((await response.json()) as RawPosition[]).map(ParsePosition);
  }

  async closeAll(query: CloseAllPositionsQuery): Promise<ClosePositionResponse[]> {
    const response = await this.client.fetch("v2/positions", "DELETE", { query });
    if (response.status === 500) throw new Error("Close All Positions: Failed to liquedate");
    if (response.status !== 207)
      throw new Error(`Close All Positions: Undocumented response status: ${response.status} ${response.statusText}`);

    const parsed = ((await response.json()) as RawClosePositionResponse[]).map(ParseClosePositionResponse);
    const errors = parsed
      .filter(r => r.status !== 200)
      .map(r => new Error(`Close All Positions: Failed to close ${r.symbol}: ${r.status}`));
    if (errors) throw errors;

    return parsed;
  }

  async get(symbol_or_asset_id: string): Promise<Position> {
    const response = await this.client.fetch(`v2/positions/${symbol_or_asset_id}`, "GET");
    if (response.status !== 200)
      throw new Error(`Get Position: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParsePosition(await response.json());
  }

  async close(symbol_or_asset_id: string, query: ClosePositionQuery): Promise<Order> {
    const response = await this.client.fetch(`v2/positions/${symbol_or_asset_id}`, "DELETE", { query });
    if (response.status !== 200)
      throw new Error(`Close Position: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseOrder(await response.json());
  }

  async exercise(symbol_or_contract_id: UUID): Promise<void> {
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
