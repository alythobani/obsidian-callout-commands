export type NonEmptyArray<T> = [T, ...T[]];
export type NonEmptyStringArray = NonEmptyArray<string>;

export function getLastElement<T>(arr: readonly [T, ...T[]]): T {
  return arr[arr.length - 1]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
}

export function isNonEmptyArray<T>(arr: readonly T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}
