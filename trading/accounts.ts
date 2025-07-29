import { ClientModule } from "../client.ts";
import { Currency } from "../common.ts";
import { From, parse, Parsed, ParsingSchema, Raw } from "../parsing.ts";

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

const AccountSchema = {
  id: From.string.uuid,
  buying_power: From.string.float,
  regt_buying_power: From.string.float,
  daytrading_buying_power: From.string.float,
  options_buying_power: From.string.float,
  non_marginable_buying_power: From.string.float,
  cash: From.string.float,
  accrued_fees: From.string.float,
  pending_transfer_in: From.string.float,
  multiplier: From.string.int,
  equity: From.string.float,
  last_equity: From.string.float,
  long_market_value: From.string.float,
  short_market_value: From.string.float,
  initial_margin: From.string.float,
  maintenance_margin: From.string.float,
  last_maintenance_margin: From.string.float,
  sma: From.string.float,
  intraday_adjustments: From.string.int,
  pending_reg_taf_fees: From.string.float,

  portfolio_value: From.string.float, // deprecated, see `equity`

  // created_at: Temporal.PlainDateTime; // unused?
  // pending_transfer_out: number; // unused?
  // balance_asof: Temporal.PlainDate; // unused?

  effective_buying_power: From.string.float, // undocumented
  position_market_value: From.string.float, // undocumented
  bod_dtbp: From.string.float, // undocumented

  status: From.string.enum(AccountStatus),
  currency: From.string.enum(Currency),
  account_number: From.I<string>(),

  pattern_day_trader: From.I<boolean>(),
  // crypto_tier: CryptoTier;
  trading_blocked: From.I<boolean>(),
  transfers_blocked: From.I<boolean>(),
  options_trading_level: From.string.enum(OptionsTradingLevel),
  account_blocked: From.I<boolean>(),
  trade_suspended_by_user: From.I<boolean>(),
  shorting_enabled: From.I<boolean>(),
  daytrade_count: From.I<number>(),
  // admin_configuration: unknown; // undocumented
  // user_configurations: unknown; // undocumented
  // crypto_status: unknown; // undocumented
} as const satisfies ParsingSchema;

export type RawAccount = Raw<typeof AccountSchema>;
export type Account = Parsed<typeof AccountSchema>;

export default class TradingAccountModule extends ClientModule {
  async get(): Promise<Account> {
    const response = await this.client.fetch("v2/account", "GET");
    if (response.status !== 200) {
      throw new Error(
        `Get Account: Unexpected ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json();
    // TODO validate
    return parse(AccountSchema, json as RawAccount);
  }

  _configs() {}
  _config() {}
  _activities() {}
}
