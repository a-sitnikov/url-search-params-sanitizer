export type UrlSearchParamMatcher = string | readonly string[] | RegExp;

export type UrlSearchParamScalar = string | number | boolean;

export type UrlSearchParamValueCheck = (value: string) => boolean;

export type UrlSearchParamValueFn<
  TValue extends UrlSearchParamScalar = UrlSearchParamScalar,
> = (value: string) => TValue | undefined;

export interface IUrlSearchParamRule {
  key: UrlSearchParamMatcher;
  value?:
    | UrlSearchParamMatcher
    | UrlSearchParamValueFn<UrlSearchParamScalar>
    | object;
  multiple?: boolean;
}

export interface ICompiledUrlSearchParamRule<
  _TKey extends string = string,
  TValue extends UrlSearchParamScalar = UrlSearchParamScalar,
  TMultiple extends boolean = boolean,
> {
  key: UrlSearchParamValueCheck;
  value: UrlSearchParamValueFn<TValue>;
  multiple: TMultiple;
}

type TRuleOutput<TRule> = TRule extends { value: infer TValue }
  ? TParamValue<TValue>
  : string;

type TParamValue<TValue> = TValue extends (value: string) => infer TReturn
  ? Exclude<TReturn, undefined>
  : TValue extends string
    ? TValue
    : TValue extends RegExp
      ? string
      : TValue extends readonly (infer TItem)[]
        ? Extract<TItem, string>
        : TValue extends object
          ? Extract<TValue[keyof TValue], string>
          : string;

type TRuleKey<TRule> = TRule extends { key: infer TKey }
  ? TKey extends string
    ? TKey
    : TKey extends readonly (infer TItem)[]
      ? Extract<TItem, string>
      : never
  : never;

type TRuleMultiple<TRule> = TRule extends { multiple: true } ? true : false;

type TCompiledRule<TRule> = ICompiledUrlSearchParamRule<
  TRuleKey<TRule>,
  TRuleOutput<TRule>,
  TRuleMultiple<TRule>
>;

export type TCompileRules<TRules extends readonly IUrlSearchParamRule[]> = {
  [TIndex in keyof TRules]: TCompiledRule<TRules[TIndex]>;
};

type TParamEntry<TRule> = TRule extends ICompiledUrlSearchParamRule<
  infer TKey,
  infer TValue,
  infer TMultiple
>
  ? {
      key: TKey;
      value: TMultiple extends true ? TValue | TValue[] : TValue;
    }
  : never;

export type TSanitizedSearchParamsOf<
  TRules extends readonly ICompiledUrlSearchParamRule[],
> = {
  [TEntry in TParamEntry<TRules[number]> as TEntry["key"]]?: TEntry["value"];
};
