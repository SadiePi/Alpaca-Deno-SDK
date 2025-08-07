import Alpaca from "./alpaca.ts";
import { APIMethod, BodyParams, QueryParams } from "./common.ts";
import { Z } from "./external.ts";

export interface AlpacaAuth {
  key: string;
  secret: string;
}

export interface AlpacaConfig {
  auth?: AlpacaAuth;
  paper: boolean;
}

export abstract class ClientModule {
  constructor(protected client: AlpacaClient) {}
}

export interface FetchPayload {
  query?: QueryParams;
  body?: BodyParams;
}

export abstract class AlpacaClient {
  constructor(protected alpaca: Alpaca) {}
  protected abstract getBaseAPI(): string;

  async fetch<
    ZQuery extends Z.ZodType<QueryParams>,
    ZBody extends Z.ZodType<BodyParams>,
    ZResponse extends Z.ZodType
  >(params: {
    name: string;
    endpoint: string;
    method: APIMethod;

    querySchema: ZQuery;
    bodySchema: ZBody;
    responseSchema: ZResponse;

    okStatus: number;
    statusMessages: Record<number, string>;

    payload: {
      query?: Z.input<ZQuery>;
      body?: Z.input<ZBody>;
    };
  }) {
    const prepared: FetchPayload = {};
    if (params.payload.query) prepared.query = params.querySchema.parse(params.payload.query) as QueryParams;
    if (params.payload.body) prepared.body = params.bodySchema.parse(params.payload.body) as BodyParams;

    const base = `https://${this.getBaseAPI()}.alpaca.markets/`;
    const url = new URL(params.endpoint, base);
    const response = await this.alpaca.fetch(url, params.method, prepared);
    if (response.status === params.okStatus) return params.responseSchema.parse(await response.json());

    throw new Error(
      params.statusMessages[response.status] ??
        `${params.name}: Undocumented response ${response.status}: ${response.statusText}`
    );
  }
}
