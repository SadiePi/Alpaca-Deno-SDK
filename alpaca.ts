import { APIMethod, BodyParams, QueryParams } from "./common.ts";
import { AlpacaClient, type AlpacaConfig, AlpacaInstance } from "./client.ts";
import {
  TradingAccountModule,
  TradingAssetsModule,
  TradingCalendarModule,
  TradingClockModule,
  TradingCryptoModule,
  TradingHistoryModule,
  TradingOrdersModule,
  TradingPositionsModule,
  TradingWatchlistsModule,
} from "./trading/mod.ts";

export default class Alpaca implements AlpacaInstance {
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
    },
  ) {
    const requestInit: RequestInit = {
      method,
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": this.config.key,
        "APCA-API-SECRET-KEY": this.config.secret,
      },
    };

    if (data?.query) {
      const queryEntries = Object.entries(data.query);
      queryEntries.forEach(([key, value]) =>
        url.searchParams.set(key, String(value))
      );
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
  constructor(alpaca: Alpaca) {
    super(alpaca);
  }

  protected override getBaseAPI(): string {
    return this.alpaca.config.paper ? "paper-api" : "live";
  }

  public readonly account = new TradingAccountModule(this);
  public readonly assets = new TradingAssetsModule(this);
  public readonly orders = new TradingOrdersModule(this);
  public readonly positions = new TradingPositionsModule(this);
  public readonly history = new TradingHistoryModule(this);
  public readonly watchlists = new TradingWatchlistsModule(this);
  public readonly calendar = new TradingCalendarModule(this);
  public readonly clock = new TradingClockModule(this);
  public readonly crypto = new TradingCryptoModule(this);
}

export class MarketClient {
  constructor(private alpaca: Alpaca) {}

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

export class BrokerClient {
  constructor(private alpaca: Alpaca) {}

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
