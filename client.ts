import { APIMethod, BodyParams, QueryParams } from "./common.ts";

interface AlpacaConfig {
  key: string;
  secret: string;
  paper: boolean;
}

export abstract class ClientModule {
  constructor(protected client: AlpacaClient) {}
}

export abstract class AlpacaClient {
  constructor(protected alpaca: AlpacaInstance) {}
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

export interface AlpacaInstance {
  config: AlpacaConfig;
  fetch(
    url: URL,
    method: APIMethod,
    data?: {
      query?: QueryParams;
      body?: BodyParams;
    },
  ): Promise<Response>;
}

export { type AlpacaConfig };
