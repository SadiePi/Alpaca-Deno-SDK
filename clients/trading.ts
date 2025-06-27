import Alpaca from "../alpaca.ts";
import TradingAccountModule from "../trading/accounts.ts";
import TradingAssetsModule from "../trading/assets.ts";
import TradingCalendarModule from "../trading/calendar.ts";
import TradingClockModule from "../trading/clock.ts";
import TradingOrdersModule from "../trading/orders.ts";
import TradingPositionsModule from "../trading/positions.ts";
import TradingWatchlistsModule from "../trading/watchlists.ts";
import AlpacaClient from "./base.ts";

export default class TradingClient extends AlpacaClient {
  constructor(alpaca: Alpaca) {
    super(alpaca);
  }

  protected override getBaseAPI(): string {
    return this.alpaca.config.paper ? "paper-api" : "live";
  }

  public account = new TradingAccountModule(this);
  public assets = new TradingAssetsModule(this);
  public orders = new TradingOrdersModule(this);
  public positions = new TradingPositionsModule(this);
  // Portfolio History
  public watchlists = new TradingWatchlistsModule(this);
  // Account Configurations ???
  // Account Activities ???
  public calendar = new TradingCalendarModule(this);
  public clock = new TradingClockModule(this);
  // Crypto Funding
}
