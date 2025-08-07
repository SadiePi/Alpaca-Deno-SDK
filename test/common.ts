// Simple assertion functions for testing
export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg ?? "Assertion failed");
  }
}

export class AssertionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "AssertionError";
  }
}

import Alpaca from "../src/mod.ts";

export const altesta = new Alpaca({ paper: true });
