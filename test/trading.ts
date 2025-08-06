import { altesta } from "./common.ts";

Deno.test("Account Module", async () => {
  const account = await altesta.trading.account.get();
  console.log(account);
});

Deno.test.ignore("Assets Module", () => {
  // TODO: Implement assets module tests
});

Deno.test.ignore("Crypto Module", () => {
  // TODO: Implement crypto at all
});

Deno.test.ignore("History Module", () => {
  // TODO: Implement history module at all
});

Deno.test.ignore("Orders Module", () => {
  // TODO: Implement orders module tests
});

Deno.test.ignore("Positions Module", () => {
  // TODO: Implement positions module tests
});

Deno.test.ignore("Time Module", () => {
  // TODO: Implement time module tests
});

Deno.test.ignore("Watchlists Module", () => {
  // TODO: Implement watchlists module at all
});
