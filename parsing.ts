// deno-lint-ignore-file no-explicit-any
import { UUID, validateUUID } from "./common.ts";

export type ParsingSchema = Record<
  string,
  Parser<any, unknown>
>;

export type Raw<Schema extends ParsingSchema> = {
  [key in keyof Schema]: Schema[key] extends Parser<infer In, unknown> ? In
    : never;
};

export type Parsed<Schema extends ParsingSchema> =
  & { _raw: Raw<Schema> }
  & {
    [key in keyof Schema]: Schema[key] extends Parser<any, infer Out> ? Out
      : never;
  };

export type Parser<In, Out> = (
  input: In,
) => Out | Error;

const fromString = {
  float: parseFloat,
  int: parseInt,
  uuid: (input: string): UUID | Error =>
    validateUUID(input) ? input as UUID : new Error(`Invalid UUID: ${input}`),
  // this is beautiful and disgusting
  enum: <Enum extends object>(_enum: Enum) => (input: string): Enum | Error =>
    Object.values(_enum).includes(input as any)
      ? input as unknown as Enum
      : new Error(`Invalid enum value: ${input}`),
  // temporal date
  // temporal time
} as const;

const fromNumber = {
  int: (input: number) => {
    if (!Number.isInteger(input)) {
      return new Error(`Expected integer, got: ${input}`);
    }
    return input;
  },
  boolean: (input: number): boolean => !!input,
} as const;

const fromBoolean = {
  number: (input: boolean): number => input ? 1 : 0,
} as const;

const fromArray = {
  string: (input: unknown[]): string => input.join(", "),
  // each:
} as const;

const fromObject = {
  string: (input: Record<string, unknown>): string => JSON.stringify(input),
} as const;

export function parse<Schema extends ParsingSchema>(
  schema: Schema,
  input: Raw<Schema>,
): Parsed<Schema> | never {
  const errors: Error[] = [];

  const result = Object.fromEntries(
    Object.entries(schema).map(([key, parser]) => {
      const value = input[key];
      if (value === undefined) {
        errors.push(new Error(`Missing key: ${key}`));
        return [key, undefined];
      }

      const parsed = parser(value);
      if (parsed instanceof Error) errors.push(parsed);
      return [key, parsed];
    }),
  );

  if (errors.length > 0) errors;
  result["_raw"] = input;

  return result as Parsed<Schema>;
}

export const From = {
  I: <T>() => (_: T) => _,
  string: fromString,
  number: fromNumber,
  boolean: fromBoolean,
  array: fromArray,
  object: fromObject,
} as const;
