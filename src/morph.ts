// deno-lint-ignore-file no-explicit-any
import { UUID, validateUUID } from "./common.ts";

export type Parser<Raw, Parsed> = (raw: Raw) => Parsed;
export type Raw<P extends Parser<any, unknown>> = P extends Parser<infer R, any> ? R : never;
export type Parsed<P extends Parser<any, unknown>> = P extends Parser<any, infer _P> ? _P : never;

type ObjectSchema = Record<string, Parser<any, unknown>>;
type RawObject<OS extends ObjectSchema> = { [key in keyof OS]: Raw<OS[key]> };
type ParsedObject<OS extends ObjectSchema> = { [key in keyof OS]: Parsed<OS[key]> };
type ObjectParser<Schema extends ObjectSchema> = Parser<RawObject<Schema>, ParsedObject<Schema>>;

export const Morph = {
  I:
    <T>() =>
    (_: T) =>
      _,
  string: {
    float: parseFloat,
    int: parseInt,
    uuid: (input: string): UUID | Error =>
      validateUUID(input) ? (input as UUID) : new Error(`Invalid UUID: ${input}`),
    // this is beautiful and disgusting
    enum:
      <Enum extends object>(_enum: Enum) =>
      (input: string): Enum | Error =>
        Object.values(_enum).includes(input as any)
          ? (input as unknown as Enum)
          : new Error(`Invalid enum value: ${input}`),
    temporal: {
      date: () => {},
      time: () => {},
      dateTime: () => {},
    },
  },
  number: {
    int: parseInt,
    boolean: (input: number): boolean => !!input,
  },
  boolean: { number: (input: boolean): number => +input },
  array: {
    string: (input: unknown[]): string => input.map(entry => String(entry)).join(", "),
    // each:
  },
  object: {
    string: (input: Record<string, unknown>): string => JSON.stringify(input),
    parse:
      <Schema extends ObjectSchema>(schema: Schema): ObjectParser<Schema> =>
      (raw: RawObject<Schema>): ParsedObject<Schema> =>
        Object.assign(Object.fromEntries(Object.entries(schema).map(([key, parser]) => [key, parser(raw[key])])), {
          _raw: raw,
        }) as ParsedObject<Schema>,
  },
} as const;

export default Morph;
