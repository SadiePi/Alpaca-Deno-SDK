import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";

export default class TradingHistoryModule extends ClientModule<TradingClient> {
  _get() {}
}
