import {
  isArray,
  isFunction,
  isPlainObject,
  isString,
  isUndefined,
} from "./type-guard.js";
import type {
  ICompiledUrlSearchParamRule,
  IUrlSearchParamRule,
  TCompileRules,
  TSanitizedSearchParamsOf,
  UrlSearchParamMatcher,
  UrlSearchParamScalar,
  UrlSearchParamValueCheck,
  UrlSearchParamValueFn,
} from "./types.js";

export { boolParam, intParam, stringParam } from "./value-helpers.js";

export type {
  ICompiledUrlSearchParamRule,
  IUrlSearchParamRule,
  TSanitizedSearchParamsOf,
  UrlSearchParamMatcher,
  UrlSearchParamScalar,
  UrlSearchParamValueCheck,
  UrlSearchParamValueFn,
} from "./types.js";

const enumValues = (enumeration: Record<string, unknown>) => {
  const allowed = new Set<string>();
  Object.values(enumeration).forEach((item) => {
    if (isString(item)) allowed.add(item);
  });
  return allowed;
};

const matcherCheck = (
  matcher: UrlSearchParamMatcher | object,
): UrlSearchParamValueCheck => {
  if (isString(matcher)) {
    return (value) => value === matcher;
  }

  if (isArray(matcher)) {
    const allowed = new Set<string>(matcher as readonly string[]);
    return (value) => allowed.has(value);
  }

  if (isPlainObject(matcher)) {
    const allowed = enumValues(matcher);
    return (value) => allowed.has(value);
  }

  if (!(matcher instanceof RegExp)) return () => false;

  const flags = matcher.flags.replace(/[gy]/g, "");
  const expression = new RegExp(matcher.source, flags);
  return (value) => expression.test(value);
};

const ruleValue = (
  value: IUrlSearchParamRule["value"],
): UrlSearchParamValueFn => {
  if (isUndefined(value)) return (raw) => raw;
  if (isFunction(value)) return value as UrlSearchParamValueFn;

  const check = matcherCheck(value);
  return (raw) => {
    if (check(raw)) return raw;
    return undefined;
  };
};

const searchParamText = (value: UrlSearchParamScalar, raw: string) => {
  if (typeof value === "boolean") return raw;
  if (isString(value)) return value;
  return String(value);
};

export const compileUrlSearchParamRules = <
  const TRules extends readonly IUrlSearchParamRule[],
>(
  rules: TRules,
): TCompileRules<TRules> =>
  rules.map((rule) => ({
    key: matcherCheck(rule.key),
    value: ruleValue(rule.value),
    multiple: rule.multiple ?? false,
  })) as TCompileRules<TRules>;

const calcValue = (
  key: string,
  value: string,
  rules: readonly ICompiledUrlSearchParamRule[],
  seen: Set<string>,
) => {
  const rule = rules.find((candidate) => candidate.key(key));
  if (isUndefined(rule)) return undefined;

  const next = rule.value(value);
  if (isUndefined(next)) return undefined;
  if (!rule.multiple && seen.has(key)) return undefined;
  return next;
};

export const sanitizeSearchParams = (
  input: URLSearchParams,
  rules: readonly ICompiledUrlSearchParamRule[],
): URLSearchParams => {
  const accepted = new URLSearchParams();
  const seen = new Set<string>();
  let changed = false;

  for (const [key, raw] of input) {
    const value = calcValue(key, raw, rules, seen);
    if (isUndefined(value)) {
      changed = true;
      continue;
    }

    const text = searchParamText(value, raw);
    if (text !== raw) changed = true;
    seen.add(key);
    accepted.append(key, text);
  }

  if (!changed) return input;
  return accepted;
};

export const parseSearchParams = <
  const TRules extends readonly ICompiledUrlSearchParamRule[],
>(
  input: URLSearchParams,
  rules: TRules,
): TSanitizedSearchParamsOf<TRules> => {
  const result: Record<string, UrlSearchParamScalar | UrlSearchParamScalar[]> =
    {};
  const seen = new Set<string>();

  for (const [key, raw] of input) {
    const value = calcValue(key, raw, rules, seen);
    if (isUndefined(value)) continue;

    seen.add(key);
    const current = result[key];
    if (isUndefined(current)) {
      result[key] = value;
      continue;
    }

    if (isArray(current)) {
      current.push(value);
      continue;
    }

    result[key] = [current, value];
  }

  return result as TSanitizedSearchParamsOf<TRules>;
};
