import { ClientModule } from "../client.ts";
import { AlpacaDateSchema, AlpacaDateTimeSchema } from "../common.ts";
import { Z } from "../external.ts";

export const CalendarDateTypeSchema = Z.enum(["TRADING", "SETTLEMENT"]);
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
  timestamp: AlpacaDateTimeSchema,
  is_open: Z.boolean(),
  next_open: AlpacaDateTimeSchema,
  next_close: AlpacaDateTimeSchema,
});
export type Clock = Z.infer<typeof ClockSchema>;

const CalendarQuerySchema = Z.object({
  start: AlpacaDateSchema.optional(),
  end: AlpacaDateSchema.optional(),
  date_type: CalendarDateTypeSchema.optional(),
});
type CalendarQuery = Z.input<typeof CalendarQuerySchema>;

export default class TradingTimeModule extends ClientModule {
  calendar(query: CalendarQuery = {}): Promise<Calendar> {
    return this.client.fetch({
      name: "Get Market Calendar",
      endpoint: "v2/calendar",
      method: "GET",

      querySchema: CalendarQuerySchema,
      bodySchema: Z.never(),
      responseSchema: CalendarSchema,

      okStatus: 200,
      statusMessages: {},

      payload: { query },
    });
  }

  clock(): Promise<Clock> {
    return this.client.fetch({
      name: "Get Market Clock",
      endpoint: "v2/clock",
      method: "GET",

      querySchema: Z.never(),
      bodySchema: Z.never(),
      responseSchema: ClockSchema,

      okStatus: 200,
      statusMessages: {},

      payload: {},
    });
  }
}
