import { Command, Editor, EditorPosition, EditorRange } from "obsidian";
import { getLastElement, isNonEmptyArray, NonEmptyStringArray } from "../utils/arrayUtils";
import {
  getCalloutIDAndEffectiveTitle,
  isCustomTitle,
  makeH6Line,
} from "../utils/calloutTitleUtils";
import { makeCalloutSelectionCheckCallback } from "../utils/editorCheckCallbackUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewPositionWithinLine,
  getSelectedLinesRangeAndText,
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
  const selectedTextLines = getTextLines(selectedLinesText);
  const { calloutID, effectiveTitle } = getCalloutIDAndEffectiveTitle(selectedLinesText);
  if (isCustomTitle({ calloutID, effectiveTitle })) {
    removeCalloutWithCustomTitle({
      selectedTextLines,
      editor,
      originalCursorPositions,
      selectedLinesRange,
      customTitle: effectiveTitle,
    });
    return;
  }
  removeCalloutWithDefaultTitle({
    selectedTextLines,
    editor,
    originalCursorPositions,
    selectedLinesRange,
  });
  return;
}

/**
 * Removes the callout from the selected lines, retaining the custom title if there is one.
 */
function removeCalloutWithCustomTitle({
  selectedTextLines,
  editor,
  originalCursorPositions,
  selectedLinesRange,
  customTitle,
}: {
  selectedTextLines: [string, ...string[]];
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
  customTitle: string;
}): void {
  const customTitleHeadingLine = makeH6Line(customTitle);
  const unquotedLines = selectedTextLines.slice(1).map((line) => line.replace(/^> /, ""));
  const newTextLines = [customTitleHeadingLine, ...unquotedLines];
  replaceCalloutLinesAndAdjustSelection({
    editor,
    selectedTextLines,
    newTextLines,
    didRemoveHeader: false,
    originalCursorPositions,
    selectedLinesRange,
  });
}

function removeCalloutWithDefaultTitle({
  selectedTextLines,
  editor,
  originalCursorPositions,
  selectedLinesRange,
}: {
  selectedTextLines: NonEmptyStringArray;
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
}): void {
  const linesWithoutHeader = selectedTextLines.slice(1);
  const unquotedLinesWithoutHeader = linesWithoutHeader.map((line) => line.replace(/^> /, ""));
  replaceCalloutLinesAndAdjustSelection({
    editor,
    selectedTextLines,
    newTextLines: unquotedLinesWithoutHeader,
    didRemoveHeader: true,
    originalCursorPositions,
    selectedLinesRange,
  });
  return;
}

/**
 * Replaces the selected lines with the given text lines, adjusting the selection after to match the
 * original selection's relative position.
 */
function replaceCalloutLinesAndAdjustSelection({
  editor,
  selectedTextLines,
  newTextLines,
  didRemoveHeader,
  originalCursorPositions,
  selectedLinesRange,
}: {
  editor: Editor;
  selectedTextLines: NonEmptyStringArray;
  newTextLines: readonly string[];
  didRemoveHeader: boolean;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
}): void {
  if (!isNonEmptyArray(newTextLines)) {
    // Must have removed the header line completely (default title) and there are no other lines
    editor.replaceRange("", selectedLinesRange.from, selectedLinesRange.to);
    editor.setSelection(selectedLinesRange.from, selectedLinesRange.from);
    return;
  }

  const newText = newTextLines.join("\n");

  // Replace the selected lines with the unquoted text
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);

  // Set the selection to the same relative position as before, but with the new text
  adjustSelectionAfterReplacingCallout({
    selectedTextLines,
    newTextLines,
    originalCursorPositions,
    didRemoveHeader,
    editor,
  });
}

/**
 * Sets the selection after removing the callout from the selected lines, back to the original
 * selection's relative position.
 */
function adjustSelectionAfterReplacingCallout({
  selectedTextLines,
  newTextLines,
  originalCursorPositions,
  didRemoveHeader,
  editor,
}: {
  selectedTextLines: NonEmptyStringArray;
  newTextLines: NonEmptyStringArray;
  originalCursorPositions: CursorPositions;
  didRemoveHeader: boolean;
  editor: Editor;
}): void {
  const { from: originalFrom, to: originalTo } = originalCursorPositions;
  const newFrom = getNewFromPosition({
    didRemoveHeader,
    originalFrom,
    selectedTextLines,
    newTextLines,
  });
  const newTo = getNewToPosition(originalTo, selectedTextLines, newTextLines, didRemoveHeader);
  const newRange = { from: newFrom, to: newTo };
  setSelectionInCorrectDirection(editor, originalCursorPositions, newRange);
}

function getNewFromPosition({
  didRemoveHeader,
  originalFrom,
  selectedTextLines,
  newTextLines,
}: {
  didRemoveHeader: boolean;
  originalFrom: EditorPosition;
  selectedTextLines: NonEmptyStringArray;
  newTextLines: NonEmptyStringArray;
}): EditorPosition {
  const { line, ch: oldCh } = originalFrom;
  if (didRemoveHeader) {
    return { line, ch: 0 };
  }
  const lineDiff = { oldLine: selectedTextLines[0], newLine: newTextLines[0] };
  const newFromCh = getNewPositionWithinLine({ oldCh, lineDiff });
  return { line, ch: newFromCh };
}

function getNewToPosition(
  originalTo: EditorPosition,
  selectedTextLines: NonEmptyStringArray,
  newTextLines: NonEmptyStringArray,
  didRemoveHeader: boolean
): EditorPosition {
  const oldLine = getLastElement(selectedTextLines);
  const newToCh = getNewPositionWithinLine({
    oldCh: originalTo.ch,
    lineDiff: { oldLine, newLine: getLastElement(newTextLines) },
  });
  const newTo = { line: originalTo.line - (didRemoveHeader ? 1 : 0), ch: newToCh };
  return newTo;
}
