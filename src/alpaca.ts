import { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

import { AlpacaClient, AlpacaConfig } from "./client.ts";
import { APIMethod, BodyParams, QueryParams } from "./common.ts";
import {
  TradingAccountModule,
  TradingAssetsModule,
  TradingTimeModule,
  TradingCryptoModule,
  TradingHistoryModule,
  TradingOrdersModule,
  TradingPositionsModule,
  TradingWatchlistsModule,
} from "./trading/mod.ts";

export default class Alpaca {
  constructor(public config: AlpacaConfig) {}

  public readonly trading = new TradingClient(this);
  public readonly market = new MarketClient(this);
  public readonly broker = new BrokerClient(this);

  public fetch(
    url: URL,
    method: APIMethod,
    data?: {
      query?: QueryParams;
      body?: BodyParams;
    }
  ) {
    const auth = this.config.auth ?? loadSync();

    const requestInit: RequestInit = {
      method,
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": auth.key,
        "APCA-API-SECRET-KEY": auth.secret,
      },
    };

    if (data?.query) {
      const queryEntries = Object.entries(data.query);
      queryEntries.forEach(([key, value]) => url.searchParams.set(key, String(value)));
    }

    if (data?.body) {
      requestInit.headers = {
        ...requestInit.headers,
        "content-type": "application/json",
      };
      requestInit.body = JSON.stringify(data.body);
    }

    return fetch(url, requestInit);
  }
}

export class TradingClient extends AlpacaClient {
  protected override getBaseAPI(): string {
    return this.alpaca.config.paper ? "paper-api" : "live";
  }

  public readonly account = new TradingAccountModule(this);
  public readonly assets = new TradingAssetsModule(this);
  public readonly orders = new TradingOrdersModule(this);
  public readonly positions = new TradingPositionsModule(this);
  public readonly history = new TradingHistoryModule(this);
  public readonly watchlists = new TradingWatchlistsModule(this);
  public readonly time = new TradingTimeModule(this);
  public readonly crypto = new TradingCryptoModule(this);
}

export class MarketClient extends AlpacaClient {
  protected override getBaseAPI() {
    return "data";
  }

  // Stock
  // Option
  // Crypto
  // Fixed Income
  // Forex
  // Logos
  // Screener
  // News
  // Corporate Actions
}

export class BrokerClient extends AlpacaClient {
  protected override getBaseAPI(): string {
    return "broker-api.sandbox";
  }

  // Accounts
  // Documents
  // Trading
  // Assets
  // Calendar
  // Events
  // Funding
  // Funding Wallets
  // Instant Funding
  // OAuth
  // Clock
  // Journals
  // Corporate Actions
  // Watchlist
  // KYC
  // Rebalncing
  // Logos
  // Reporting
  // Country Info
  // Crypto Funding
  // IRA
  // Cash Interest
  // FPSL Program
}
