import { expect, it } from "vitest";

import { intParam, stringParam } from "../src/value-helpers.js";

it("uses the default integer range when called with no options", () => {
  const parse = intParam();

  expect(parse("0")).toBe(0);
  expect(parse("15")).toBe(15);
  expect(parse("-1")).toBeUndefined();
});

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
