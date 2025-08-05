import { ClientModule } from "../client.ts";
import { Currency } from "../common.ts";
import { Z } from "../external.ts";

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

const AccountSchema = Z.object({
  id: Z.uuid(),
  buying_power: Z.coerce.number(),
  regt_buying_power: Z.coerce.number(),
  daytrading_buying_power: Z.coerce.number(),
  options_buying_power: Z.coerce.number(),
  non_marginable_buying_power: Z.coerce.number(),
  cash: Z.coerce.number(),
  accrued_fees: Z.coerce.number(),
  pending_transfer_in: Z.coerce.number(),
  multiplier: Z.coerce.number(),
  equity: Z.coerce.number(),
  last_equity: Z.coerce.number(),
  long_market_value: Z.coerce.number(),
  short_market_value: Z.coerce.number(),
  initial_margin: Z.coerce.number(),
  maintenance_margin: Z.coerce.number(),
  last_maintenance_margin: Z.coerce.number(),
  sma: Z.coerce.number(),
  intraday_adjustments: Z.coerce.number(),
  pending_reg_taf_fees: Z.coerce.number(),

  portfolio_value: Z.coerce.number(), // deprecated, see `equity`

  // created_at: Temporal.PlainDateTime; // unused?
  // pending_transfer_out: number; // unused?
  // balance_asof: Temporal.PlainDate; // unused?

  effective_buying_power: Z.coerce.number(), // undocumented
  position_market_value: Z.coerce.number(), // undocumented
  bod_dtbp: Z.coerce.number(), // undocumented

  status: Z.enum(AccountStatus),
  currency: Z.enum(Currency),
  account_number: Z.string(),

  pattern_day_trader: Z.boolean(),
  // crypto_tier: CryptoTier;
  trading_blocked: Z.boolean(),
  transfers_blocked: Z.boolean(),
  options_trading_level: Z.enum(OptionsTradingLevel),
  account_blocked: Z.boolean(),
  trade_suspended_by_user: Z.boolean(),
  shorting_enabled: Z.boolean(),
  daytrade_count: Z.number(),
  // admin_configuration: unknown; // undocumented
  // user_configurations: unknown; // undocumented
  // crypto_status: unknown; // undocumented
});

export type RawAccount = Z.input<typeof AccountSchema>;
export type Account = Z.infer<typeof AccountSchema>;

export default class TradingAccountModule extends ClientModule {
  async get(): Promise<Account> {
    const response = await this.client.fetch("v2/account", "GET");
    if (response.status !== 200)
      throw new Error(`Get Account: Undocumented response status ${response.status} ${response.statusText}`);

    return AccountSchema.parse(await response.json());
  }

  _configs() {}
  _config() {}
  _activities() {}
}
