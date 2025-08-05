import Alpaca from "../src/mod.ts";

const alpaca = new Alpaca({ paper: true });

Deno.test("Get Trading Account", async () => {
  const account = await alpaca.trading.account.get();
  console.log("Trading Account:", account);
});

Deno.test("Get Time Data", async () => {
  const calendar = await alpaca.trading.time.calendar({
    start: "2023-01-01",
    end: "2023-01-31",
  });
  console.log("Calendar:", calendar[0].open.toString());
});
