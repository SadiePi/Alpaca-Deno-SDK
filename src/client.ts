import { APIMethod, BodyParams, QueryParams } from "./common.ts";
import Alpaca from "./mod.ts";

export interface AlpacaConfig {
  auth?: AlpacaAuth; // default read from env
  paper: boolean;
}

export interface AlpacaAuth {
  key: string;
  secret: string;
}

export abstract class ClientModule {
  constructor(protected client: AlpacaClient) {}
}

export abstract class AlpacaClient {
  constructor(protected alpaca: Alpaca) {}
  protected abstract getBaseAPI(): string;

  fetch(
    path: string,
    method: APIMethod,
    data?: {
      query?: QueryParams;
      body?: BodyParams;
    },
  ) {
    const base = `https://${this.getBaseAPI()}.alpaca.markets/`;
    const url = new URL(path, base);

    return this.alpaca.fetch(url, method, data);
  }
}
