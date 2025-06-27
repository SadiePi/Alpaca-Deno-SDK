import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";

export default class TradingCalendarModule extends ClientModule<TradingClient> {
  _get() {}
}
