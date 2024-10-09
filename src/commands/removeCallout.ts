import { Command, Editor } from "obsidian";
import { isNonEmptyArray, NonEmptyStringArray } from "../utils/arrayUtils";
import {
  getCalloutIDAndEffectiveTitle,
  isCustomTitle,
  makeH6Line,
} from "../utils/calloutTitleUtils";
import { makeCalloutSelectionCheckCallback } from "../utils/editorCheckCallbackUtils";
import {
  getCursorPositions,
  getSelectedLinesRangeAndText,
  replaceLinesAndAdjustSelection,
} from "../utils/selectionUtils";
import { getTextLines } from "../utils/stringUtils";

export const REMOVE_CALLOUT_FROM_SELECTED_LINES_COMMAND: Command = {
  id: "remove-callout-from-selected-lines",
  name: "Remove callout from selected lines",
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
  replaceLinesAndAdjustSelection({
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
