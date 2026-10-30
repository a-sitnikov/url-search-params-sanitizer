import type { UrlSearchParamValueFn } from "./types.js";

export const intParam =
  ({
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
  }: {
    min?: number;
    max?: number;
  } = {}): UrlSearchParamValueFn<number> =>
    (value) => {
      if (!/^\d{1,15}$/.test(value)) return undefined;

      const number = Number(value);
      if (number < min || number > max) return undefined;
      return number;
    };

export const stringParam =
  ({
    max,
    cut = false,
  }: {
    max: number;
    cut?: boolean;
  }): UrlSearchParamValueFn<string> =>
    (value) => {
      if (value.length <= max) return value;
      if (cut) return value.slice(0, max);
      return undefined;
    };
