export const isArray = (value: unknown): value is Array<unknown> =>
  Array.isArray(value);

export const isFunction = (value: unknown): value is Function =>
  typeof value === "function";

export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;
