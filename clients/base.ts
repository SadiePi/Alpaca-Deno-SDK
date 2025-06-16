import Alpaca from "../alpaca.ts";
import { APIMethod, BodyParams, QueryParams } from "../common.ts";

export default abstract class AlpacaClient {
  constructor(protected alpaca: Alpaca) {}
  protected abstract getBaseURL(): string;

  protected fetch(
    path: string,
    method: APIMethod,
    data?: {
      query?: QueryParams;
      body?: BodyParams;
    },
  ) {
    const base = this.getBaseURL();
    const url = new URL(path, base);

    return this.alpaca.fetch(url, method, data);
  }
}
