import { expect, it } from "vitest";

import { stringParam } from "../src/value-helpers.js";

it("keeps a string within max and drops a longer one", () => {
  const parse = stringParam({ max: 3 });

  expect(parse("ab")).toBe("ab");
  expect(parse("abcd")).toBeUndefined();
});

it("cuts a longer string to max when cut is enabled", () => {
  const parse = stringParam({ max: 3, cut: true });

  expect(parse("abcd")).toBe("abc");
  expect(parse("ab")).toBe("ab");
});
