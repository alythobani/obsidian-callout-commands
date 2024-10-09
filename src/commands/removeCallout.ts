import { Command, Editor, EditorRange } from "obsidian";
import { isNonEmptyArray, NonEmptyStringArray } from "../utils/arrayUtils";
import {
  getCalloutIDAndEffectiveTitle,
  isCustomTitle,
  makeH6Line,
} from "../utils/calloutTitleUtils";
import { makeCalloutSelectionCheckCallback } from "../utils/editorCheckCallbackUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewFromPosition,
  getNewToPosition,
  getSelectedLinesRangeAndText,
  SelectedLinesDiff,
  setSelectionInCorrectDirection,
} from "../utils/selectionUtils";
import { getTextLines } from "../utils/stringUtils";

export const REMOVE_CALLOUT_FROM_SELECTED_LINES_COMMAND: Command = {
  id: "remove-callout-from-selected-lines",
  name: "Remove Callout from Selected Lines",
  editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
};

/**
 * Removes the callout from the selected lines. Retains the title if it's not the default header for
 * the given callout, else removes the entire header line.
 */
function removeCalloutFromSelectedLines(editor: Editor): void {
  const originalCursorPositions = getCursorPositions(editor);
  const { selectedLinesRange, selectedLinesText } = getSelectedLinesRangeAndText(editor); // Full selected lines range and text
  const selectedLines = getTextLines(selectedLinesText);
  const { calloutID, effectiveTitle } = getCalloutIDAndEffectiveTitle(selectedLinesText);
  const newLines = getNewLinesAfterRemovingCallout({ calloutID, effectiveTitle, selectedLines });
  const selectedLinesDiff = { oldLines: selectedLines, newLines };
  replaceCalloutLinesAndAdjustSelection({
    editor,
    selectedLinesDiff,
    originalCursorPositions,
    selectedLinesRange,
  });
}

/**
 * Gets the new lines after removing the callout from the selected lines.
 */
function getNewLinesAfterRemovingCallout({
  calloutID,
  effectiveTitle,
  selectedLines,
}: {
  calloutID: string;
  effectiveTitle: string;
  selectedLines: NonEmptyStringArray;
}): NonEmptyStringArray {
  if (isCustomTitle({ calloutID, title: effectiveTitle })) {
    return getNewLinesAfterRemovingCalloutWithCustomTitle(effectiveTitle, selectedLines);
  }
  return getNewLinesAfterRemovingCalloutWithDefaultTitle(selectedLines);
}

function getNewLinesAfterRemovingCalloutWithCustomTitle(
  customTitle: string,
  selectedLines: NonEmptyStringArray
): NonEmptyStringArray {
  const customTitleHeadingLine = makeH6Line(customTitle);
  const unquotedLines = selectedLines.slice(1).map((line) => line.replace(/^> /, ""));
  return [customTitleHeadingLine, ...unquotedLines];
}

function getNewLinesAfterRemovingCalloutWithDefaultTitle(
  selectedLines: NonEmptyStringArray
): NonEmptyStringArray {
  const linesWithoutHeader = selectedLines.slice(1);
  const unquotedLinesWithoutHeader = linesWithoutHeader.map((line) => line.replace(/^> /, ""));
  if (!isNonEmptyArray(unquotedLinesWithoutHeader)) {
    return [""];
  }
  return unquotedLinesWithoutHeader;
}

/**
 * Replaces the selected lines with the given text lines, adjusting the selection after to match the
 * original selection's relative position.
 */
function replaceCalloutLinesAndAdjustSelection({
  editor,
  selectedLinesDiff,
  originalCursorPositions,
  selectedLinesRange,
}: {
  editor: Editor;
  selectedLinesDiff: SelectedLinesDiff;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
}): void {
  const newText = selectedLinesDiff.newLines.join("\n");
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);
  adjustSelectionAfterReplacingCallout({ selectedLinesDiff, originalCursorPositions, editor });
}

/**
 * Sets the selection after removing the callout from the selected lines, back to the original
 * selection's relative position.
 */
function adjustSelectionAfterReplacingCallout({
  selectedLinesDiff,
  originalCursorPositions,
  editor,
}: {
  selectedLinesDiff: SelectedLinesDiff;
  originalCursorPositions: CursorPositions;
  editor: Editor;
}): void {
  const { from: oldFrom, to: oldTo } = originalCursorPositions;
  const newFrom = getNewFromPosition({ oldFrom, selectedLinesDiff });
  const newTo = getNewToPosition({ oldTo, selectedLinesDiff });
  const newRange = { from: newFrom, to: newTo };
  setSelectionInCorrectDirection(editor, originalCursorPositions, newRange);
}
