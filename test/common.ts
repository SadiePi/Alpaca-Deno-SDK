export { assert, AssertionError } from "jsr:@std/assert";

import Alpaca from "../src/mod.ts";

export const altesta = new Alpaca({ paper: true });
