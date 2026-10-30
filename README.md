# url-search-params-sanitizer

Keep only the URL search params you declared, and turn the rest into typed values.

Unknown keys are dropped. Values that fail a rule are dropped. Repeated keys stay only when the rule sets `multiple: true`. The first matching rule wins.

## Install

```sh
npm install url-search-params-sanitizer
```

The package is ESM-only.

## Sanitize a query string

`sanitizeSearchParams` returns `URLSearchParams`. If every value is already allowed, it returns the same instance.

```ts
import {
  compileUrlSearchParamRules,
  intParam,
  sanitizeSearchParams,
  stringParam,
} from "url-search-params-sanitizer";

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

sanitizeSearchParams(input, rules).toString();
// "page=2&q=hell&status=live&sort=name&utm_source=email&tag=red&tag=blue"
```

What that input loses:

| Param | Result |
| --- | --- |
| `page=9` | Dropped. `page` is not `multiple`, so only the first value stays. |
| `q=hello` | Cut to `hell` because `stringParam` has `cut: true`. |
| `status=nope` | Dropped. Not one of the enum values. |
| `utm_bad=1` | Dropped. The key matches `/^utm_/`, but `1` fails `/^[a-z]+$/`. |
| `tag=green` | Dropped. `tag` allows `red` and `blue` only. |
| `extra=1` | Dropped. No rule matches the key. |

A parser that changes the text rewrites the param. `intParam` returns a number, so a leading zero is removed:

```ts
sanitizeSearchParams(new URLSearchParams("page=01"), rules).toString();
// "page=1"
```

## Parse into an object

`parseSearchParams` applies the same rules and returns an object. Numbers stay numbers. Repeated `multiple` keys become an array.

```ts
import { parseSearchParams } from "url-search-params-sanitizer";

parseSearchParams(input, rules);
// {
//   page: 2,
//   q: "hell",
//   status: "live",
//   sort: "name",
//   utm_source: "email",
//   tag: ["red", "blue"],
// }
```

The result type follows the compiled rules. With the rules above, `page` is `number | undefined`, `tag` is `"red" | "blue" | ("red" | "blue")[] | undefined`, and a key matched only by a `RegExp` is omitted from the type.

## Rules

Compile rules once and reuse them.

```ts
const rules = compileUrlSearchParamRules([
  { key: "id" },
]);
```

Each rule has a `key`, an optional `value`, and an optional `multiple` flag. `multiple` defaults to `false`.

### Keys

| `key` | Matches |
| --- | --- |
| `"page"` | That exact name. |
| `["sort", "order"]` | Either name. Both appear in the parsed type. |
| `/^utm_/` | Any key the expression matches. |

`g` and `y` flags are removed from a `RegExp` so a later param can still match.

### Values

| `value` | Keeps |
| --- | --- |
| omitted | Any string. |
| `"live"` | That exact string. |
| `["red", "blue"]` | One of those strings. |
| `{ live: "live", draft: "draft" }` | A string value of the object. Numeric enum members are ignored. |
| `/^[a-z]+$/` | A string the expression matches. |
| `(raw) => ...` | Whatever the function returns. `undefined` drops the param. |

```ts
const rules = compileUrlSearchParamRules([
  {
    key: "theme",
    value: (raw) => (raw === "dark" || raw === "light" ? raw : undefined),
  },
]);
```

## Helpers

`intParam` accepts an integer written as 1–15 digits. The default range is `0` through `Number.MAX_SAFE_INTEGER`. A value outside `min` or `max` is dropped. The parsed value is a `number`.

```ts
intParam({ min: 1, max: 10 })("01"); // 1
intParam({ min: 1, max: 10 })("11"); // undefined
intParam({ min: 1, max: 10 })("-1"); // undefined
```

`stringParam` requires `max`. A longer string is dropped unless `cut` is `true`, in which case it is sliced to `max`.

```ts
stringParam({ max: 3 })("abcd"); // undefined
stringParam({ max: 3, cut: true })("abcd"); // "abc"
```

## License

MIT
