import { altesta, AssertionError } from "./common.ts";

Deno.test("Account Module", async () => {
  const account = await altesta.trading.account.get();
});

Deno.test("Assets Module", () => {
  throw new AssertionError("Not implemented");
});

Deno.test("Crypto Module", () => {
  throw new AssertionError("Not implemented");
});

Deno.test("History Module", () => {
  throw new AssertionError("Not implemented");
});

Deno.test("Orders Module", () => {
  throw new AssertionError("Not implemented");
});

Deno.test("Positions Module", () => {
  throw new AssertionError("Not implemented");
});

Deno.test("Time Module", () => {
  throw new AssertionError("Not implemented");
});

Deno.test("Watchlists Module", () => {
  throw new AssertionError("Not implemented");
});
