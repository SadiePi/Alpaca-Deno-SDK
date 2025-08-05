import { ClientModule } from "../client.ts";
import { AlpacaDate, AlpacaDateSchema } from "../common.ts";
import { Z } from "../external.ts";

export enum CalendarDateType {
  TRADING,
  SETTLEMENT,
}

export const CalendarDaySchema = Z.object({
  date: Z.string(),
  open: Z.string(),
  close: Z.string(),
  settlement_date: Z.string(),
});

export type RawCalendarDay = Z.input<typeof CalendarDaySchema>;
export type CalendarDay = Z.infer<typeof CalendarDaySchema>;

export const CalendarSchema = Z.array(CalendarDaySchema);

export type RawCalendar = Z.input<typeof CalendarSchema>;
export type Calendar = Z.infer<typeof CalendarSchema>;

export const ClockSchema = Z.object({
  timestamp: Z.string(),
  is_open: Z.boolean(),
  next_open: Z.string(),
  next_close: Z.string(),
});

export type RawClock = Z.input<typeof ClockSchema>;
export type Clock = Z.infer<typeof ClockSchema>;

const CalendarQuerySchema = Z.object({
  start: AlpacaDateSchema.optional(),
  end: AlpacaDateSchema.optional(),
  date_type: Z.enum(CalendarDateType).optional(),
});

type CalendarQueryInput = Z.input<typeof CalendarQuerySchema>;

export interface CalendarQuery {
  start?: AlpacaDate;
  end?: AlpacaDate;
  date_type?: CalendarDateType;
}

export default class TradingTimeModule extends ClientModule {
  async calendar(query?: CalendarQueryInput): Promise<Calendar> {
    const parsed = CalendarQuerySchema.parse(query ?? {});

    const response = await this.client.fetch("v2/calendar", "GET", { query: parsed });
    if (response.status !== 200)
      throw new Error(`Get Calendar: Undocumented response status: ${response.status} ${response.statusText}`);

    return CalendarSchema.parse(await response.json());
  }

  async clock(): Promise<Clock> {
    const response = await this.client.fetch("v2/clock", "GET");
    if (response.status !== 200)
      throw new Error(`Get Clock: Undocumented response status: ${response.status} ${response.statusText}`);

    return ClockSchema.parse(await response.json());
  }
}
