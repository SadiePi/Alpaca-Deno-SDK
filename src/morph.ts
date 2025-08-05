// deno-lint-ignore-file no-explicit-any

export type Parser<Raw, Parsed> = (raw: Raw) => Parsed;
export type Raw<P extends Parser<any, unknown>> = P extends Parser<infer R, any> ? R : never;
export type Parsed<P extends Parser<any, unknown>> = P extends Parser<any, infer _P> ? _P : never;

type ObjectSchema = Record<string, Parser<any, unknown>>;
type RawObject<OS extends ObjectSchema> = { [key in keyof OS]: Raw<OS[key]> };
type ParsedObject<OS extends ObjectSchema> = { [key in keyof OS]: Parsed<OS[key]> };
type ObjectParser<Schema extends ObjectSchema> = Parser<RawObject<Schema>, ParsedObject<Schema>>;

export type TaggedString<Tag extends string | StringTagger<string>> = string & {
  tag: Tag extends StringTagger<infer T> ? T : Tag;
};
export type UUID = TaggedString<"UUID">;
export type StringTagger<Tag extends string> = (input: string) => TaggedString<Tag>;
const stringTagger =
  <Tag extends string>(tag: Tag, validator: (input: string) => boolean): StringTagger<Tag> =>
  input => {
    if (!validator(input)) throw new Error(`Morph: Can't tag "${input}" as "${tag}"`);
    return Object.assign(input, { tag }) as TaggedString<Tag>;
  };

export const Morph = {
  I:
    <T>() =>
    (_: T) =>
      _,
  string: {
    tagged: {
      custom: stringTagger,
      uuid: stringTagger("UUID", uuid => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)),
      date: stringTagger("date", () => true),
      time: stringTagger("time", () => true),
      dateTime: stringTagger("dateTime", () => true),
    },
    float: parseFloat,
    int: parseInt, // this is beautiful and disgusting
    enum:
      <Enum extends object>(_enum: Enum) =>
      (input: string): Enum | Error =>
        Object.values(_enum).includes(input as any)
          ? (_enum[input as keyof Enum] as Enum)
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
    map:
      <Raw, Parsed>(parser: Parser<Raw, Parsed>) =>
      (input: Raw[]): Parsed[] =>
        input.map(parser),
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
  maybe:
    <Raw, Parsed>(parser: Parser<Raw, Parsed>): MaybeParser<Raw, Parsed> =>
    input =>
      input === undefined ? undefined : parser(input),
} as const;

export default Morph;
