import { NonEmptyStringArray } from "./arrayUtils";

/**
 * Better-typed version of `text.split("\n")` where we know the result will always have at least one
 * element, since `String.prototype.split` only returns an empty array when the input string and
 * separator are both empty strings, and in this case the separator is "\n" which is not empty.
 */
export function getTextLines(text: string): NonEmptyStringArray {
  return text.split("\n") as NonEmptyStringArray;
}

export function toTitleCaseWord(word: string): string {
  const firstLetter = word.charAt(0).toUpperCase();
  const rest = word.slice(1).toLowerCase();
  return `${firstLetter}${rest}`;
}
