import Alpaca from "../src/mod.ts";

const alpaca = new Alpaca({ paper: true });

Deno.test("Get Trading Account", async () => {
  const account = await alpaca.trading.account.get();
  console.log("Trading Account:", account);
});
