import { Currency, UUID } from "../common.ts";

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
export type AccountStatus =
  | "ONBOARDING"
  | "SUBMISSION_FAILED"
  | "SUBMITTED"
  | "ACCOUNT_UPDATED"
  | "APPROVAL_PENDING"
  | "ACTIVE"
  | "REJECTED";

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

/** Base account properties shared between raw and parsed account interfaces */
export interface BaseAccount {
  id: UUID;
  status: AccountStatus;
  currency: Currency;
  account_number: string;
  pattern_day_trader: boolean;
  crypto_tier: CryptoTier;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  options_trading_level: OptionsTradingLevel;
  account_blocked: boolean;
  trade_suspended_by_user: boolean;
  shorting_enabled: boolean;
  daytrade_count: number;

  admin_configuration: unknown; // undocumented
  user_configurations: unknown; // undocumented
  crypto_status: unknown; // undocumented
}

export interface RawAccount extends BaseAccount {
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  options_buying_power: string;
  non_marginable_buying_power: string;
  cash: string;
  accrued_fees: string;
  pending_transfer_in: string;
  multiplier: string;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  intraday_adjustments: string;
  pending_reg_taf_fees: string;
  initial_margin: string;

  portfolio_value: string; // deprecated, see `equity`

  // created_at: string; // unused?
  // pending_transfer_out: string; // unused?
  // balance_asof: string; // unused?

  position_market_value: string; // undocumented
  effective_buying_power: string; // undocumented
  bod_dtbp: string; // undocumented
}

export interface Account extends BaseAccount {
  raw: RawAccount;
  buying_power: number;
  regt_buying_power: number;
  daytrading_buying_power: number;
  options_buying_power: number;
  non_marginable_buying_power: number;
  cash: number;
  accrued_fees: number;
  pending_transfer_in: number;
  multiplier: number;
  equity: number;
  last_equity: number;
  long_market_value: number;
  short_market_value: number;
  initial_margin: number;
  maintenance_margin: number;
  last_maintenance_margin: number;
  sma: number;
  intraday_adjustments: number;
  pending_reg_taf_fees: number;

  portfolio_value: number; // deprecated, see `equity`

  // created_at: Temporal.PlainDateTime; // unused?
  // pending_transfer_out: number; // unused?
  // balance_asof: Temporal.PlainDate; // unused?

  effective_buying_power: number; // undocumented
  position_market_value: number; // undocumented
  bod_dtbp: number; // undocumented
}

export function parseAccount(account: RawAccount): Account {
  return {
    ...account,
    raw: account,

    buying_power: parseFloat(account.buying_power),
    regt_buying_power: parseFloat(account.regt_buying_power),
    daytrading_buying_power: parseFloat(account.daytrading_buying_power),
    options_buying_power: parseFloat(account.options_buying_power),
    non_marginable_buying_power: parseFloat(
      account.non_marginable_buying_power,
    ),
    cash: parseFloat(account.cash),
    accrued_fees: parseFloat(account.accrued_fees),
    pending_transfer_in: parseFloat(account.pending_transfer_in ?? 0),
    multiplier: parseFloat(account.multiplier),
    equity: parseFloat(account.equity),
    last_equity: parseFloat(account.last_equity),
    long_market_value: parseFloat(account.long_market_value),
    short_market_value: parseFloat(account.short_market_value),
    initial_margin: parseFloat(account.initial_margin),
    maintenance_margin: parseFloat(account.maintenance_margin),
    last_maintenance_margin: parseFloat(account.last_maintenance_margin),
    sma: parseFloat(account.sma),
    intraday_adjustments: parseFloat(account.intraday_adjustments),
    pending_reg_taf_fees: parseFloat(account.pending_reg_taf_fees),

    portfolio_value: parseFloat(account.portfolio_value), // deprecated

    // created_at: Temporal.PlainDateTime.from(account.created_at), // unused?
    // balance_asof: Temporal.PlainDate.from(account.balance_asof), // unused?
    // pending_transfer_out: parseFloat(account.pending_transfer_out), // unused?

    effective_buying_power: parseFloat(account.effective_buying_power), // undocumented
    position_market_value: parseFloat(account.position_market_value), // undocumented
    bod_dtbp: parseInt(account.bod_dtbp), // undocumented
  };
}
