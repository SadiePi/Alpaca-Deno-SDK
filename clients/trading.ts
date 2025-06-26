import Alpaca from "../alpaca.ts";
import { baseURLs, QueryParams, UUID } from "../common.ts";
import { parseAccount, RawAccount } from "../trading/accounts.ts";
import {
  AssetsQuery,
  OptionContractsQuery,
  parseAsset,
  parseOptionContract,
  parseTreasury,
  RawAsset,
  RawOptionContract,
  RawTreasury,
  TreasuriesQuery,
} from "../trading/assets.ts";
import { Order, OrderBody, OrdersQuery } from "../trading/orders.ts";
import AlpacaClient from "./base.ts";

export default class AlpacaTradingClient extends AlpacaClient {
  constructor(alpaca: Alpaca) {
    super(alpaca);
  }

  protected override getBaseAPI(): string {
    return this.alpaca.config.paper ? "paper-api" : "live";
  }

  // Accounts
  async getAccount() {
    const response = await this.fetch("v2/account", "GET");

    if (response.status !== 200) {
      throw new Error(
        `Get Account: Unexpected response status ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json();
    // TODO validate
    return parseAccount(json as RawAccount);
  }

  // Assets
  async getAssets(query: AssetsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.attributes) {
      preparedQuery.attributes = query.attributes.join(",");
    }

    const response = await this.fetch("v2/assets", "GET", {
      query: preparedQuery,
    });

    if (response.status !== 200) {
      throw new Error(
        `Get Assets: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json() as RawAsset[];
    // TODO validate
    return json.map(parseAsset);
  }

  async getAsset(symbol_or_asset_id: string) {
    const response = await this.fetch(`v2/assets/${symbol_or_asset_id}`, "GET");

    if (response.status === 404) {
      throw new Error(`Get Asset: 404 Not Found: ${symbol_or_asset_id}`);
    }

    if (response.status !== 200) {
      throw new Error(
        `Get Asset: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json() as RawAsset;
    // TODO validate
    return parseAsset(json);
  }

  async getOptionContracts(query: OptionContractsQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.underlying_symbols) {
      preparedQuery.underlying_symbols = query.underlying_symbols.join(",");
    }

    const response = await this.fetch("v2/options/contracts", "GET", {
      query: preparedQuery,
    });

    if (response.status !== 200) {
      throw new Error(
        `Get Option Contracts: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json() as RawOptionContract[];
    // TODO validate
    return json.map(parseOptionContract);
  }
  async getOptionContract(_symbol_or_id: string) {
    const response = await this.fetch(
      `v2/options/contracts/${_symbol_or_id}`,
      "GET",
    );

    if (response.status === 404) {
      throw new Error(`Get Option Contract: 404 Not Found: ${_symbol_or_id}`);
    }

    if (response.status !== 200) {
      throw new Error(
        `Get Option Contract: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json() as RawOptionContract;
    // TODO validate
    return parseOptionContract(json);
  }

  async getTreasuries(query: TreasuriesQuery) {
    const preparedQuery = { ...query } as QueryParams;
    if (query.cusips) preparedQuery.cusips = query.cusips.join(",");
    if (query.isins) preparedQuery.isins = query.isins.join(",");

    const response = await this.fetch("v2/treasuries", "GET", {
      query: preparedQuery,
    });

    switch (response.status) {
      case 400:
        throw new Error(
          `Get Treasuries: 400 Bad Request: ${response.statusText}`,
        );
      case 403:
        throw new Error(
          `Get Treasuries: 403 Forbidden: ${response.statusText}`,
        );
      case 429:
        throw new Error(
          `Get Treasuries: 429 Too Many Requests: ${response.statusText}`,
        );
      case 500:
        throw new Error(
          `Get Treasuries: 500 Internal Server Error: ${response.statusText}`,
        );
      case 200:
        break;
      default:
        throw new Error(
          `Get Treasuries: Unexpected response status: ${response.status} ${response.statusText}`,
        );
    }

    const json = await response.json() as RawTreasury[];
    // TODO validate
    return json.map(parseTreasury);
  }

  // Orders
  async createOrder(_body: OrderBody) {}

  async getOrders(query: OrdersQuery) {
    const preparedQuery = { ...query } as QueryParams;
    // if(query.after) preparedQuery.after = converted
    // if(query.until) preparedQuery.until = converted
    if (query.symbols) preparedQuery.symbols = query.symbols.join(",");

    const response = await this.fetch("v2/orders", "GET", {
      query: preparedQuery,
    });

    if (response.status !== 200) {
      throw new Error(
        `Get Orders: Unexpected response status: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json() as Order[];

    return json.map(parseOrder);
  }

  async deleteAllOrders() {}
  async getOrderByClientID(_query: unknown) {}
  async getOrder(_order_id: UUID, _query: OrdersQuery) {}
  async replaceOrder(_order_id: UUID, _body: OrderBody) {}
  async deleteOrder(_order_id: UUID) {}

  // Positions
  // Portfolio History
  // Watchlists
  // Account Configurations ???
  // Account Activities ???
  // Calendar
  // Clock
  // Crypto Funding
}
