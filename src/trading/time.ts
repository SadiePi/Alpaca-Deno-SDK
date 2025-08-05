import { ClientModule } from "../client.ts";
import { QueryParams } from "../common.ts";
import { Morph, Parsed, Raw } from "../morph.ts";

export enum CalendarDateType {
  TRADING,
  SETTLEMENT,
}

// const AlpacaDate = Morph.string.tagged.custom("alpaca-date", date => {)

export const ParseCalendarDay = Morph.object.parse({
  date: Morph.string.tagged.date,
  open: Morph.string.tagged.time,
  close: Morph.string.tagged.time,
  settlement_date: Morph.string.tagged.date,
});

export type RawCalendarDay = Raw<typeof ParseCalendarDay>;
export type CalendarDay = Parsed<typeof ParseCalendarDay>;

export const ParseCalendar = Morph.array.map(ParseCalendarDay);

export type RawCalendar = Raw<typeof ParseCalendar>;
export type Calendar = Parsed<typeof ParseCalendar>;

export const ParseClock = Morph.object.parse({
  timestamp: Morph.string.temporal.time,
  is_open: Morph.I<boolean>(),
  next_open: Morph.string.temporal.time,
  next_close: Morph.string.temporal.time,
});

export type RawClock = Raw<typeof ParseClock>;
export type Clock = Parsed<typeof ParseClock>;

export interface CalendarQuery {
  start?: Temporal.PlainDate;
  end?: Temporal.PlainDate;
  date_type?: CalendarDateType;
}

export default class TradingTimeModule extends ClientModule {
  async calendar(query?: CalendarQuery): Promise<Calendar> {
    const preparedQuery: QueryParams = {};
    if (query?.start) preparedQuery.start = query.start.toString();
    if (query?.end) preparedQuery.end = query.end.toString();
    if (query?.date_type) preparedQuery.date_type = query.date_type;

    const response = await this.client.fetch("v2/calendar", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Calendar: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseCalendar(await response.json());
  }

  async clock(): Promise<Clock> {
    const response = await this.client.fetch("v2/clock", "GET");
    if (response.status !== 200)
      throw new Error(`Get Clock: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseClock(await response.json());
  }
}
