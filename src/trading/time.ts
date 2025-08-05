import { ClientModule } from "../client.ts";
import { QueryParams } from "../common.ts";
import { Morph, Parsed, Raw } from "../morph.ts";

export enum CalendarDateType {
  TRADING,
  SETTLEMENT,
}

export const ParseCalendar = Morph.object.parse({
  date: Morph.string.temporal.date,
  open: Morph.string.temporal.time,
  close: Morph.string.temporal.time,
  settlement_date: Morph.string.temporal.date,
});

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
  async calendar(query?: CalendarQuery): Promise<Calendar[]> {
    const preparedQuery: QueryParams = {};
    if (query?.start) preparedQuery.start = query.start.toString();
    if (query?.end) preparedQuery.end = query.end.toString();
    if (query?.date_type) preparedQuery.date_type = query.date_type;

    const response = await this.client.fetch("v2/calendar", "GET", { query: preparedQuery });
    if (response.status !== 200)
      throw new Error(`Get Calendar: Undocumented response status: ${response.status} ${response.statusText}`);

    return ((await response.json()) as RawCalendar[]).map(ParseCalendar);
  }

  async clock(): Promise<Clock> {
    const response = await this.client.fetch("v2/clock", "GET");
    if (response.status !== 200)
      throw new Error(`Get Clock: Undocumented response status: ${response.status} ${response.statusText}`);

    return ParseClock(await response.json());
  }
}
