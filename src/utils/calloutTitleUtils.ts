import { PluginSettingsManager } from "../pluginSettingsManager";
import { throwNever } from "./errorUtils";
import { getTrimmedFirstCapturingGroupIfExists } from "./regexUtils";
import { toSentenceCase } from "./stringUtils";

export const CALLOUT_HEADER_WITH_ID_CAPTURE_REGEX = /^> \[!(.+)\]/;
const CALLOUT_TITLE_REGEX = /^> \[!.+\][+-]? (.+)/;
const HEADING_TITLE_REGEX = /^#+ (.+)/;

export function makeCalloutHeader({
  calloutID,
  maybeExplicitTitle,
  pluginSettingsManager,
}: {
  calloutID: string;
  maybeExplicitTitle: string | null;
  pluginSettingsManager: PluginSettingsManager;
}): string {
  const baseCalloutHeader = makeBaseCalloutHeader(calloutID, pluginSettingsManager);
  const foldableSuffix = makeFoldableSuffix(pluginSettingsManager);
  const titlePart = maybeExplicitTitle !== null ? ` ${maybeExplicitTitle}` : "";
  return `${baseCalloutHeader}${foldableSuffix}${titlePart}`;
}

function makeBaseCalloutHeader(
  calloutID: string,
  pluginSettingsManager: PluginSettingsManager
): string {
  const capitalizedCalloutID = makeCapitalizedCalloutID(calloutID, pluginSettingsManager);
  return `> [!${capitalizedCalloutID}]`;
}

function makeCapitalizedCalloutID(
  calloutID: string,
  pluginSettingsManager: PluginSettingsManager
): string {
  const calloutIDCapitalization = pluginSettingsManager.getSetting("calloutIDCapitalization");
  switch (calloutIDCapitalization) {
    case "lower":
      return calloutID.toLowerCase();
    case "upper":
      return calloutID.toUpperCase();
    case "sentence":
      return toSentenceCase(calloutID);
    case "title":
      return calloutID
        .split("-")
        .map((word) => toSentenceCase(word))
        .join("-");
    default:
      throwNever(calloutIDCapitalization);
  }
}

function makeFoldableSuffix(pluginSettingsManager: PluginSettingsManager): string {
  const defaultFoldableState = pluginSettingsManager.getSetting("defaultFoldableState");
  switch (defaultFoldableState) {
    case "unfoldable":
      return "";
    case "foldable-expanded":
      return "+";
    case "foldable-collapsed":
      return "-";
    default:
      throwNever(defaultFoldableState);
  }
}

/**
 * Returns an explicit default title for the callout, if one should be used (depending on the user's
 * settings), else null.
 */
export function maybeMakeExplicitTitle(
  calloutID: string,
  pluginSettingsManager: PluginSettingsManager
): string | null {
  const shouldUseExplicitTitle = pluginSettingsManager.getSetting("shouldUseExplicitTitle");
  if (!shouldUseExplicitTitle) {
    return null;
  }
  return getDefaultCalloutTitle(calloutID);
}

export function makeNewCalloutHeader(
  calloutID: string,
  pluginSettingsManager: PluginSettingsManager
): string {
  const shouldUseExplicitTitle = pluginSettingsManager.getSetting("shouldUseExplicitTitle");
  const maybeExplicitTitle = shouldUseExplicitTitle ? getDefaultCalloutTitle(calloutID) : null;
  return makeCalloutHeader({ calloutID, maybeExplicitTitle, pluginSettingsManager });
}

export function makeH6Line(title: string): string {
  return `###### ${title}`;
}

/**
 * Parses the callout ID and explicit title (if present) from the full text of a callout.
 *
 * @param fullCalloutText The full text of the callout (both the header and the body).
 */
export function getCalloutIDAndExplicitTitle(fullCalloutText: string): {
  calloutID: string;
  maybeExplicitTitle: string | undefined;
} {
  const calloutID = getCalloutID(fullCalloutText);
  return { calloutID, maybeExplicitTitle: getTrimmedCalloutTitleIfExists(fullCalloutText) };
}

function getCalloutID(fullCalloutText: string): string {
  const maybeCalloutID = getTrimmedCalloutIDIfExists(fullCalloutText);
  if (maybeCalloutID === undefined) {
    throw new Error("Callout ID not found in callout text.");
  }
  return maybeCalloutID;
}

function getTrimmedCalloutIDIfExists(fullCalloutText: string): string | undefined {
  return getTrimmedFirstCapturingGroupIfExists(
    CALLOUT_HEADER_WITH_ID_CAPTURE_REGEX,
    fullCalloutText
  );
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
 * Determines whether the given explicit title, if it even exists, is a custom title or the same as
 * the default title for the given callout.
 */
export function isCustomTitle({ calloutID, title }: { calloutID: string; title: string }): boolean {
  return title !== getDefaultCalloutTitle(calloutID);
}

function getDefaultCalloutTitle(calloutID: string): string {
  return toSentenceCase(calloutID).replace(/-/g, " ");
}
