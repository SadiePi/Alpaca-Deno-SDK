import { ClientModule } from "../client.ts";
import { Currency } from "../common.ts";
import { Morph, Parsed, Raw } from "../morph.ts";

/**
 * The various possible account status values.
 *
 * Most likely, the account status is ACTIVE unless there is any problem. The account status may get in ACCOUNT_UPDATED when personal information is being updated from the dashboard, in which case you may not be allowed trading for a short period of time until the change is approved.
 *
 * - ONBOARDING: The account is onboarding
 * - SUBMISSION_FAILED: The account application submission failed for some reason
 * - SUBMITTED: The account application has been submitted for review
 * - ACCOUNT_UPDATED: The account information is being updated
 * - APPROVAL_PENDING: The final account approval is pending
 * - ACTIVE: The account is active for trading
 * - REJECTED: The account application has been rejected
 */
export enum AccountStatus {
  ONBOARDING = "ONBOARDING",
  SUBMISSION_FAILED = "SUBMISSION_FAILED",
  SUBMITTED = "SUBMITTED",
  ACCOUNT_UPDATED = "ACCOUNT_UPDATED",
  APPROVAL_PENDING = "APPROVAL_PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
}

/** Undocumented */
export type CryptoTier = 0 | 1 | 2 | 3;

/** The effective options trading level of the account */
export enum OptionsTradingLevel {
  /** Options trading is disabled */
  DISABLED = 0,
  /** Covered Call/Cash-Secured Put */
  COVERED_CALL_CASH_SECURED_PUT = 1,
  /** Long Call/Put */
  LONG_CALL_PUT = 2,
  /** Spreads/Straddles */
  SPREADS_STRADDLES = 3,
}

const ParseAccount = Morph.object.parse({
  id: Morph.string.tagged.uuid,
  buying_power: Morph.string.float,
  regt_buying_power: Morph.string.float,
  daytrading_buying_power: Morph.string.float,
  options_buying_power: Morph.string.float,
  non_marginable_buying_power: Morph.string.float,
  cash: Morph.string.float,
  accrued_fees: Morph.string.float,
  pending_transfer_in: Morph.string.float,
  multiplier: Morph.string.int,
  equity: Morph.string.float,
  last_equity: Morph.string.float,
  long_market_value: Morph.string.float,
  short_market_value: Morph.string.float,
  initial_margin: Morph.string.float,
  maintenance_margin: Morph.string.float,
  last_maintenance_margin: Morph.string.float,
  sma: Morph.string.float,
  intraday_adjustments: Morph.string.int,
  pending_reg_taf_fees: Morph.string.float,

  portfolio_value: Morph.string.float, // deprecated, see `equity`

  // created_at: Temporal.PlainDateTime; // unused?
  // pending_transfer_out: number; // unused?
  // balance_asof: Temporal.PlainDate; // unused?

  effective_buying_power: Morph.string.float, // undocumented
  position_market_value: Morph.string.float, // undocumented
  bod_dtbp: Morph.string.float, // undocumented

  status: Morph.string.enum(AccountStatus),
  currency: Morph.string.enum(Currency),
  account_number: Morph.I<string>(),

  pattern_day_trader: Morph.I<boolean>(),
  // crypto_tier: CryptoTier;
  trading_blocked: Morph.I<boolean>(),
  transfers_blocked: Morph.I<boolean>(),
  options_trading_level: Morph.string.enum(OptionsTradingLevel),
  account_blocked: Morph.I<boolean>(),
  trade_suspended_by_user: Morph.I<boolean>(),
  shorting_enabled: Morph.I<boolean>(),
  daytrade_count: Morph.I<number>(),
  // admin_configuration: unknown; // undocumented
  // user_configurations: unknown; // undocumented
  // crypto_status: unknown; // undocumented
});

export type RawAccount = Raw<typeof ParseAccount>;
export type Account = Parsed<typeof ParseAccount>;

export default class TradingAccountModule extends ClientModule {
  async get(): Promise<Account> {
    const response = await this.client.fetch("v2/account", "GET");
    if (response.status !== 200)
      throw new Error(`Get Account: Undocumented response status ${response.status} ${response.statusText}`);

    return ParseAccount(await response.json());
  }

  _configs() {}
  _config() {}
  _activities() {}
}
