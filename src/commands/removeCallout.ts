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
  const { range: selectedLinesRange, text } = getSelectedLinesRangeAndText(editor); // Full selected lines range and text
  const textLines = getTextLines(text);
  const [oldFirstLine, oldLastLine] = [textLines[0], getLastElement(textLines)]; // Save now to compare with post-edit lines
  const { calloutID, effectiveTitle } = getCalloutIDAndEffectiveTitle(text);
  if (isCustomTitle({ calloutID, effectiveTitle })) {
    removeCalloutWithCustomTitle({
      oldFirstLine,
      textLines,
      editor,
      originalCursorPositions,
      selectedLinesRange,
      oldLastLine,
      customTitle: effectiveTitle,
    });
    return;
  }
  removeCalloutWithDefaultTitle({
    textLines,
    editor,
    originalCursorPositions,
    selectedLinesRange,
    oldFirstLine,
    oldLastLine,
  });
  return;
}

/**
 * Removes the callout from the selected lines, retaining the custom title if there is one.
 */
function removeCalloutWithCustomTitle({
  oldFirstLine,
  textLines,
  editor,
  originalCursorPositions,
  selectedLinesRange,
  oldLastLine,
  customTitle,
}: {
  oldFirstLine: string;
  textLines: [string, ...string[]];
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
  oldLastLine: string;
  customTitle: string;
}): void {
  const customTitleHeadingLine = makeH6Line(customTitle);
  const unquotedLines = textLines.slice(1).map((line) => line.replace(/^> /, ""));
  const adjustedTextLines = [customTitleHeadingLine, ...unquotedLines];
  replaceCalloutLinesAndAdjustSelection({
    editor,
    adjustedTextLines,
    didRemoveHeader: false,
    originalCursorPositions,
    selectedLinesRange,
    oldFirstLine,
    oldLastLine,
  });
}

function removeCalloutWithDefaultTitle({
  textLines,
  editor,
  originalCursorPositions,
  selectedLinesRange,
  oldFirstLine,
  oldLastLine,
}: {
  textLines: [string, ...string[]];
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
  oldFirstLine: string;
  oldLastLine: string;
}): void {
  const linesWithoutHeader = textLines.slice(1);
  const unquotedLines = linesWithoutHeader.map((line) => line.replace(/^> /, ""));
  replaceCalloutLinesAndAdjustSelection({
    editor,
    adjustedTextLines: unquotedLines,
    didRemoveHeader: true,
    originalCursorPositions,
    selectedLinesRange,
    oldFirstLine,
    oldLastLine,
  });
  return;
}

/**
 * Replaces the selected lines with the given text lines, adjusting the selection after to match the
 * original selection's relative position.
 */
function replaceCalloutLinesAndAdjustSelection({
  editor,
  adjustedTextLines,
  didRemoveHeader,
  originalCursorPositions,
  selectedLinesRange,
  oldFirstLine,
  oldLastLine,
}: {
  editor: Editor;
  adjustedTextLines: readonly string[];
  didRemoveHeader: boolean;
  originalCursorPositions: CursorPositions;
  selectedLinesRange: EditorRange;
  oldFirstLine: string;
  oldLastLine: string;
}): void {
  if (!isNonEmptyArray(adjustedTextLines)) {
    // Must have removed the header line completely (default title) and there are no other lines
    editor.replaceRange("", selectedLinesRange.from, selectedLinesRange.to);
    editor.setSelection(selectedLinesRange.from, selectedLinesRange.from);
    return;
  }

  const newText = adjustedTextLines.join("\n");

  // Replace the selected lines with the unquoted text
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);

  // Set the selection to the same relative position as before, but with the new text
  adjustSelectionAfterReplacingCallout({
    adjustedTextLines,
    originalCursorPositions,
    oldLastLine,
    didRemoveHeader,
    oldFirstLine,
    editor,
  });
}

/**
 * Sets the selection after removing the callout from the selected lines, back to the original
 * selection's relative position.
 */
function adjustSelectionAfterReplacingCallout({
  adjustedTextLines,
  originalCursorPositions,
  oldLastLine,
  didRemoveHeader,
  oldFirstLine,
  editor,
}: {
  adjustedTextLines: NonEmptyStringArray;
  originalCursorPositions: CursorPositions;
  oldLastLine: string;
  didRemoveHeader: boolean;
  oldFirstLine: string;
  editor: Editor;
}): void {
  const { from: originalFrom, to: originalTo } = originalCursorPositions;
  const newFrom = getNewFromPosition(
    didRemoveHeader,
    originalFrom,
    oldFirstLine,
    adjustedTextLines
  );
  const newTo = getNewToPosition(originalTo, oldLastLine, adjustedTextLines, didRemoveHeader);
  const newRange = { from: newFrom, to: newTo };
  setSelectionInCorrectDirection(editor, originalCursorPositions, newRange);
}

function getNewFromPosition(
  didRemoveHeader: boolean,
  originalFrom: EditorPosition,
  oldFirstLine: string,
  adjustedTextLines: NonEmptyStringArray
): EditorPosition {
  const { line, ch: oldCh } = originalFrom;
  if (didRemoveHeader) {
    return { line, ch: 0 };
  }
  const lineDiff = { oldLine: oldFirstLine, newLine: adjustedTextLines[0] };
  const newFromCh = getNewPositionWithinLine({ oldCh, lineDiff });
  return { line, ch: newFromCh };
}

function getNewToPosition(
  originalTo: EditorPosition,
  oldLastLine: string,
  adjustedTextLines: NonEmptyStringArray,
  didRemoveHeader: boolean
): EditorPosition {
  const newToCh = getNewPositionWithinLine({
    oldCh: originalTo.ch,
    lineDiff: { oldLine: oldLastLine, newLine: getLastElement(adjustedTextLines) },
  });
  const newTo = { line: originalTo.line - (didRemoveHeader ? 1 : 0), ch: newToCh };
  return newTo;
}
