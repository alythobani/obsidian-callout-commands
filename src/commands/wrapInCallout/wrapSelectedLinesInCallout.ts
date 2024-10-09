import { Editor, EditorRange } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { NonEmptyStringArray } from "../../utils/arrayUtils";
import {
  getCustomHeadingTitleIfExists,
  getDefaultCalloutTitle,
  makeCalloutHeader,
} from "../../utils/calloutTitleUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewFromPosition,
  getNewToPosition,
  getSelectedLinesRangeAndText,
  SelectedLinesDiff,
  setSelectionInCorrectDirection,
} from "../../utils/selectionUtils";
import { getTextLines } from "../../utils/stringUtils";

/**
 * Wraps the selected lines in a callout.
 */
export function wrapSelectedLinesInCallout(editor: Editor, calloutID: CalloutID): void {
  const originalCursorPositions = getCursorPositions(editor); // Save cursor positions before editing
  const { selectedLinesRange, selectedLinesText } = getSelectedLinesRangeAndText(editor);
  const selectedLines = getTextLines(selectedLinesText);
  const { title, rawBodyLines } = getCalloutTitleAndBodyFromSelectedLines(calloutID, selectedLines);
  const newCalloutLines = getNewCalloutLines({ calloutID, title, rawBodyLines });
  const selectedLinesDiff = { oldLines: selectedLines, newLines: newCalloutLines };
  replaceLinesWithCalloutAndSetSelection({
    editor,
    originalCursorPositions,
    selectedLinesDiff,
    selectedLinesRange,
  });
}

/**
 * Gets the callout title and raw (not yet prepended) body lines from the selected text lines. If
 * the first line is a heading, it is used as the callout title, and the rest of the lines are used
 * as the body. Otherwise, the default callout title is used, and all the selected lines are used as
 * the body.
 */
function getCalloutTitleAndBodyFromSelectedLines(
  calloutID: CalloutID,
  selectedLines: NonEmptyStringArray
): { title: string; rawBodyLines: string[] } {
  const [firstSelectedLine, ...restSelectedLines] = selectedLines;
  const maybeHeadingTitle = getCustomHeadingTitleIfExists({ firstSelectedLine });
  if (maybeHeadingTitle === undefined) {
    const defaultCalloutTitle = getDefaultCalloutTitle(calloutID);
    return { title: defaultCalloutTitle, rawBodyLines: selectedLines };
  }
  return { title: maybeHeadingTitle, rawBodyLines: restSelectedLines };
}

/**
 * Gets the new callout lines to replace the selected lines with.
 */
function getNewCalloutLines({
  calloutID,
  title,
  rawBodyLines,
}: {
  calloutID: CalloutID;
  title: string;
  rawBodyLines: string[];
}): NonEmptyStringArray {
  const calloutHeader = makeCalloutHeader({ calloutID, title });
  const calloutBodyLines = rawBodyLines.map((line) => `> ${line}`);
  return [calloutHeader, ...calloutBodyLines];
}

/**
 * Replaces the selected lines with the new callout lines and sets the selection to the appropriate
 * new range.
 */
function replaceLinesWithCalloutAndSetSelection({
  editor,
  originalCursorPositions,
  selectedLinesDiff,
  selectedLinesRange,
}: {
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLinesDiff: SelectedLinesDiff;
  selectedLinesRange: EditorRange;
}): void {
  const { newLines } = selectedLinesDiff;
  const newText = newLines.join("\n");
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);
  setSelectionAfterWrappingLinesInCallout({ editor, originalCursorPositions, selectedLinesDiff });
}

/**
 * Sets the selection after wrapping the selected lines in a callout.
 */
function setSelectionAfterWrappingLinesInCallout({
  editor,
  originalCursorPositions,
  selectedLinesDiff,
}: {
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLinesDiff: SelectedLinesDiff;
}): void {
  const newRange = getNewSelectionRangeAfterWrappingLinesInCallout({
    originalCursorPositions,
    selectedLinesDiff,
  });
  setSelectionInCorrectDirection(editor, originalCursorPositions, newRange);
}

/**
 * Gets the new selection range after wrapping the selected lines in a callout.
 */
function getNewSelectionRangeAfterWrappingLinesInCallout({
  originalCursorPositions,
  selectedLinesDiff,
}: {
  originalCursorPositions: CursorPositions;
  selectedLinesDiff: SelectedLinesDiff;
}): EditorRange {
  const { from: oldFrom, to: oldTo } = originalCursorPositions;

  const newFrom = getNewFromPosition({ oldFrom, selectedLinesDiff });
  const newTo = getNewToPosition({ oldTo, selectedLinesDiff });

  return { from: newFrom, to: newTo };
}
