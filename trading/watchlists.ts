import { ClientModule } from "../clients/base.ts";
import TradingClient from "../clients/trading.ts";

export default class TradingWatchlistsModule extends ClientModule<TradingClient> {
  _all() {}
  _create() {}
  _get(_by: "id" | "name") {}
  _update(_by: "id" | "name") {}
  _add(_by: "id" | "name") {}
  _delete(_by: "id" | "name") {}
  _remove(_by: "id") {}
}
