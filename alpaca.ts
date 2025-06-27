import { APIMethod, BodyParams, QueryParams } from "./common.ts";
import BrokerClient from "./clients/broker.ts";
import MarketClient from "./clients/market.ts";
import TradingClient from "./clients/trading.ts";

interface AlpacaConfig {
  key: string;
  secret: string;
  paper: boolean;
}

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
