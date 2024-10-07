import { getTrimmedFirstCapturingGroupIfExists } from "./regexUtils";

export const BASE_QUOTE_CALLOUT_HEADER = "> [!quote]";
export const DEFAULT_QUOTE_CALLOUT_TITLE = "Quote";
export const DEFAULT_QUOTE_CALLOUT_HEADER = `${BASE_QUOTE_CALLOUT_HEADER} ${DEFAULT_QUOTE_CALLOUT_TITLE}`;

const CALLOUT_TITLE_REGEX = /^> \[!\w+\] (.+)/;
const HEADING_TITLE_REGEX = /^#+ (.+)/;

export function makeQuoteCalloutHeader(title: string): string {
  return `${BASE_QUOTE_CALLOUT_HEADER} ${title}`;
}

export function makeH6Line(title: string): string {
  return `###### ${title}`;
}

/**
 * Gets the effective title of a quote callout, which may either be explicitly set, or otherwise
 * inferred as the default title. Also returns the default title if the explicit title is an empty
 * or whitespace-only string.
 *
 * @param fullCalloutText The full text of the quote callout (both the header and the body).
 */
export function getEffectiveQuoteCalloutTitle(fullCalloutText: string): string {
  const maybeExplicitTitle = getTrimmedCalloutTitleIfExists(fullCalloutText);
  if (maybeExplicitTitle === "" || maybeExplicitTitle === undefined) {
    return DEFAULT_QUOTE_CALLOUT_TITLE;
  }
  return maybeExplicitTitle;
}

/**
 * Gets the explicit title (trimmed of surrounding whitespace) of a quote callout, if one is
 * present.
 *
 * @param fullCalloutText The full text of the quote callout (both the header and the body).
 */
function getTrimmedCalloutTitleIfExists(fullCalloutText: string): string | undefined {
  return getTrimmedFirstCapturingGroupIfExists(CALLOUT_TITLE_REGEX, fullCalloutText);
}

/**
 * Gets the heading title text (trimmed of surrounding whitespace) from the first line of selected
 * text to be wrapped in a callout, if such a heading text exists. If none is found or the trimmed
 * string is empty, returns undefined.
 *
 * @param firstSelectedLine The first line of the text to be wrapped in a callout.
 * @returns The trimmed heading text if it exists and is non-empty, otherwise undefined.
 */
export function getCustomHeadingTitleIfExists({
  firstSelectedLine,
}: {
  firstSelectedLine: string;
}): string | undefined {
  const maybeHeadingTitle = getTrimmedHeadingTitleIfExists(firstSelectedLine);
  if (maybeHeadingTitle === "" || maybeHeadingTitle === undefined) {
    return undefined;
  }
  return maybeHeadingTitle;
}

function getTrimmedHeadingTitleIfExists(firstSelectedLine: string): string | undefined {
  return getTrimmedFirstCapturingGroupIfExists(HEADING_TITLE_REGEX, firstSelectedLine);
}

/**
 * Determines whether the effective title of a quote callout is a custom title or the default title.
 *
 * @param effectiveTitle The effective title of the quote callout.
 */
export function isCustomTitle(effectiveTitle: string): boolean {
  return effectiveTitle !== DEFAULT_QUOTE_CALLOUT_TITLE;
}
