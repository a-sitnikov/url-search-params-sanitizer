import { expectTypeOf, it } from "vitest";

import {
  boolParam,
  compileUrlSearchParamRules,
  intParam,
  parseSearchParams,
  stringParam,
} from "../src/index.js";

const rules = compileUrlSearchParamRules([
  { key: "page", value: intParam({ min: 1, max: 10 }) },
  { key: "q", value: stringParam({ max: 4 }) },
  { key: "tag", multiple: true },
]);

it("infers keys and value types from the rules", () => {
  const parsed = parseSearchParams(
    new URLSearchParams("page=2&tag=a&tag=b"),
    rules,
  );

  expectTypeOf(parsed).toEqualTypeOf<{
    page?: number;
    q?: string;
    tag?: string | string[];
  }>();
});

enum Status {
  Live = "live",
  Draft = "draft",
}

it("infers an enum rule as its members", () => {
  const compiled = compileUrlSearchParamRules([
    { key: "status", value: Status },
  ]);
  const parsed = parseSearchParams(new URLSearchParams("status=live"), compiled);

  expectTypeOf(parsed).toEqualTypeOf<{
    status?: Status;
  }>();
});

it("infers a boolean param as boolean", () => {
  const compiled = compileUrlSearchParamRules([
    { key: "flag", value: boolParam({ true: "1", false: "0" }) },
  ]);
  const parsed = parseSearchParams(new URLSearchParams("flag=1"), compiled);

  expectTypeOf(parsed).toEqualTypeOf<{
    flag?: boolean;
  }>();
});

it("infers a dynamic key as a string property", () => {
  const key: string = "page";
  const compiled = compileUrlSearchParamRules([
    { key, value: intParam({ min: 1, max: 10 }) },
  ]);
  const parsed = parseSearchParams(new URLSearchParams("page=2"), compiled);

  expectTypeOf(parsed).toEqualTypeOf<{
    [key: string]: number | undefined;
  }>();
});
