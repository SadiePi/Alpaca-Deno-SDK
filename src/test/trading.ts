import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import Alpaca from "../mod.ts";
import config from "../../config.ts";

const env = await load();

const alpaca = new Alpaca({
  key: env.key,
  secret: env.secret,
  paper: config.paper,
});

Deno.test("Accounts", () => {
  const account = alpaca.trading.account.get();
  console.log(account);
});
Deno.test("Assets", () => {});
Deno.test("Crypto", () => {});
Deno.test("Orders", () => {});
Deno.test("Positions", () => {});
Deno.test("History", () => {});
Deno.test("Watchlists", () => {});
Deno.test("Time", () => {});
