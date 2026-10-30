import { expect, it } from "vitest";

import {
  boolParam,
  compileUrlSearchParamRules,
  intParam,
  sanitizeSearchParams,
  stringParam,
} from "../src/index.js";

const rules = compileUrlSearchParamRules([
  { key: "page", value: intParam({ min: 1, max: 10 }) },
  { key: "q", value: stringParam({ max: 4, cut: true }) },
  { key: "status", value: { live: "live", draft: "draft" } },
  { key: ["sort", "order"] },
  { key: /^utm_/, value: /^[a-z]+$/ },
  { key: "tag", value: ["red", "blue"], multiple: true },
]);

const input = new URLSearchParams(
  "page=2&page=9&q=hello&status=live&status=nope&sort=name&utm_source=email&utm_bad=1&tag=red&tag=green&tag=blue&extra=1",
);

it("returns the same params when every value is already allowed", () => {
  const params = new URLSearchParams("sort=name&status=live");

  expect(sanitizeSearchParams(params, rules)).toBe(params);
});

it("drops unknown keys, rejected values, and repeats that are not multiple", () => {
  expect(sanitizeSearchParams(input, rules).toString()).toBe(
    "page=2&q=hell&status=live&sort=name&utm_source=email&tag=red&tag=blue",
  );
});

it("keeps boolean tokens and drops any other text", () => {
  const compiled = compileUrlSearchParamRules([
    { key: "flag", value: boolParam({ true: "1", false: "0" }) },
  ]);
  const params = new URLSearchParams("flag=1&flag=true&flag=0");

  expect(sanitizeSearchParams(params, compiled).toString()).toBe("flag=1");
});

it("rewrites a value when the parser changes its text", () => {
  const params = new URLSearchParams("page=01");

  expect(sanitizeSearchParams(params, rules).toString()).toBe("page=1");
});

it("matches a repeated key when the pattern had the global flag", () => {
  const compiled = compileUrlSearchParamRules([
    { key: /id/g, multiple: true },
  ]);
  const params = new URLSearchParams("id=1&id=2");

  expect(sanitizeSearchParams(params, compiled).toString()).toBe("id=1&id=2");
});
