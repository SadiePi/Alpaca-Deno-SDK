import { ClientModule } from "../client.ts";
import { AlpacaDateSchema } from "../common.ts";
import { Z } from "../external.ts";

export const CalendarDateTypeSchema = Z.union([Z.literal("TRADING"), Z.literal("SETTLEMENT")]);
export type CalendarDateType = Z.infer<typeof CalendarDateTypeSchema>;

export const CalendarDaySchema = Z.object({
  date: Z.string(),
  open: Z.string(),
  close: Z.string(),
  settlement_date: Z.string(),
});
export type CalendarDay = Z.infer<typeof CalendarDaySchema>;

export const CalendarSchema = Z.array(CalendarDaySchema);
export type Calendar = Z.infer<typeof CalendarSchema>;

export const ClockSchema = Z.object({
  timestamp: Z.string(),
  is_open: Z.boolean(),
  next_open: Z.string(),
  next_close: Z.string(),
});
export type Clock = Z.infer<typeof ClockSchema>;

const CalendarQuerySchema = Z.object({
  start: AlpacaDateSchema.optional(),
  end: AlpacaDateSchema.optional(),
  date_type: CalendarDateTypeSchema.optional(),
});
type CalendarQuery = Z.input<typeof CalendarQuerySchema>;

export default class TradingTimeModule extends ClientModule {
  async calendar(query?: CalendarQuery): Promise<Calendar> {
    const preparedQuery = CalendarQuerySchema.parse(query ?? {});

    const response = await this.client.fetch("v2/calendar", "GET", { query: preparedQuery });
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
