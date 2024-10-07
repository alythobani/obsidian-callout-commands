import { getTrimmedFirstCapturingGroupIfExists } from "./regexUtils";
import { toTitleCaseWord } from "./stringUtils";

const CALLOUT_KEYWORD_REGEX = /^> \[!(\w+)\]/;
const CALLOUT_TITLE_REGEX = /^> \[!\w+\] (.+)/;
const HEADING_TITLE_REGEX = /^#+ (.+)/;

export function makeCalloutHeader({
  calloutKeyword,
  title,
}: {
  calloutKeyword: string;
  title: string;
}): string {
  const baseCalloutHeader = makeBaseCalloutHeader(calloutKeyword);
  return `${baseCalloutHeader} ${title}`;
}

function makeBaseCalloutHeader(calloutKeyword: string): string {
  return `> [!${calloutKeyword}]`;
}

export function getDefaultCalloutTitle(calloutKeyword: string): string {
  return toTitleCaseWord(calloutKeyword);
}

export function makeDefaultCalloutHeader(calloutKeyword: string): string {
  const defaultTitle = getDefaultCalloutTitle(calloutKeyword);
  return makeCalloutHeader({ calloutKeyword, title: defaultTitle });
}

export function makeH6Line(title: string): string {
  return `###### ${title}`;
}

/**
 * Parses the callout keyword and effective title from the full text of a callout.
 *
 * @param fullCalloutText The full text of the callout (both the header and the body).
 */
export function getCalloutKeywordAndEffectiveTitle(fullCalloutText: string): {
  calloutKeyword: string;
  effectiveTitle: string;
} {
  const calloutKeyword = getCalloutKeyword(fullCalloutText);
  const effectiveTitle = getCalloutEffectiveTitle(calloutKeyword, fullCalloutText);
  return { calloutKeyword, effectiveTitle };
}

function getCalloutKeyword(fullCalloutText: string): string {
  const maybeCalloutKeyword = getTrimmedCalloutKeywordIfExists(fullCalloutText);
  if (maybeCalloutKeyword === undefined) {
    throw new Error("Callout keyword not found in callout text.");
  }
  return maybeCalloutKeyword;
}

function getTrimmedCalloutKeywordIfExists(fullCalloutText: string): string | undefined {
  return getTrimmedFirstCapturingGroupIfExists(CALLOUT_KEYWORD_REGEX, fullCalloutText);
}

/**
 * Gets the effective title of a callout, which may either be an explicitly set non-empty (and not
 * only whitespace) title, or otherwise inferred as the default title.
 */
function getCalloutEffectiveTitle(calloutKeyword: string, fullCalloutText: string): string {
  const maybeExplicitTitle = getTrimmedCalloutTitleIfExists(fullCalloutText);
  if (maybeExplicitTitle === "" || maybeExplicitTitle === undefined) {
    return getDefaultCalloutTitle(calloutKeyword);
  }
  return maybeExplicitTitle;
}

/**
 * Gets the explicit title (trimmed of surrounding whitespace) of a callout, if one is present.
 *
 * @param fullCalloutText The full text of the callout (both the header and the body).
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
 * Determines whether the effective title of a callout is a custom title or the default title.
 *
 * @param effectiveTitle The effective title of the callout.
 */
export function isCustomTitle({
  calloutKeyword,
  effectiveTitle,
}: {
  calloutKeyword: string;
  effectiveTitle: string;
}): boolean {
  const defaultTitle = getDefaultCalloutTitle(calloutKeyword);
  return effectiveTitle !== defaultTitle;
}
