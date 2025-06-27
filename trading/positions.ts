import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";

export default class TradingPositionsModule extends ClientModule<TradingClient> {
  _all() {}
  _closeAll() {}
  _get() {}
  _close() {}
  _exercise() {} // ???
}
