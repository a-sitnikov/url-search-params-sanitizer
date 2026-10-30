import { expect, it } from "vitest";

import {
  boolParam,
  compileUrlSearchParamRules,
  intParam,
  parseSearchParams,
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

it("returns coerced values and omits anything the rules reject", () => {
  expect(parseSearchParams(input, rules)).toEqual({
    page: 2,
    q: "hell",
    status: "live",
    sort: "name",
    utm_source: "email",
    tag: ["red", "blue"],
  });
});

it("keeps only the first value when multiple is not set", () => {
  const params = new URLSearchParams("sort=name&sort=date");

  expect(parseSearchParams(params, rules)).toEqual({ sort: "name" });
});

it("uses the first matching rule", () => {
  const compiled = compileUrlSearchParamRules([
    { key: "page", value: intParam({ min: 1, max: 5 }) },
    { key: "page" },
  ]);

  expect(parseSearchParams(new URLSearchParams("page=2"), compiled)).toEqual({
    page: 2,
  });
});

it("parses boolean tokens as booleans", () => {
  const compiled = compileUrlSearchParamRules([
    { key: "flag", value: boolParam({ true: "1", false: "0" }) },
  ]);

  expect(parseSearchParams(new URLSearchParams("flag=0"), compiled)).toEqual({
    flag: false,
  });
  expect(parseSearchParams(new URLSearchParams("flag=1"), compiled)).toEqual({
    flag: true,
  });
  expect(parseSearchParams(new URLSearchParams("flag=true"), compiled)).toEqual(
    {},
  );
});

it("drops a number outside the allowed range", () => {
  expect(parseSearchParams(new URLSearchParams("page=11"), rules)).toEqual({});
});
