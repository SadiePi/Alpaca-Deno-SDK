import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";

export default class TradingClockModule extends ClientModule<TradingClient> {
  _get() {}
}
