import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";

export default class TradingCryptoModule extends ClientModule<TradingClient> {
  _foo() {}
}
