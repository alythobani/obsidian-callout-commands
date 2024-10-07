import { Editor, EditorRange } from "obsidian";
import { getLastElement, isNonEmptyArray } from "../utils/arrayUtils";
import {
  getEffectiveQuoteCalloutTitle,
  isCustomTitle,
  makeH6Line,
} from "../utils/calloutTitleUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewAnchorAndHead,
  getSelectedLinesRangeAndText,
} from "../utils/selectionUtils";
import { getTextLines } from "../utils/stringUtils";

/**
 * Removes the callout from the selected lines. Retains the title if it's not the default header for
 * the given callout, else removes the entire header line.
 */
export function removeCalloutFromSelectedLines(editor: Editor): void {
  const originalCursorPositions = getCursorPositions(editor);
  const { range: selectedLinesRange, text } = getSelectedLinesRangeAndText(editor); // Full selected lines range and text
  const textLines = getTextLines(text);
  const [oldFirstLine, oldLastLine] = [textLines[0], getLastElement(textLines)]; // Save now to compare with post-edit lines
  const effectiveCalloutTitle = getEffectiveQuoteCalloutTitle(text);
  if (isCustomTitle(effectiveCalloutTitle)) {
    removeCalloutWithCustomTitle({
      oldFirstLine,
      textLines,
      editor,
      originalCursorPositions,
      selectedLinesRange,
      oldLastLine,
      customTitle: effectiveCalloutTitle,
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
  adjustedTextLines: [string, ...string[]];
  originalCursorPositions: CursorPositions;
  oldLastLine: string;
  didRemoveHeader: boolean;
  oldFirstLine: string;
  editor: Editor;
}): void {
  const { from: originalFrom, to: originalTo } = originalCursorPositions;
  const newFirstLine = adjustedTextLines[0];
  const newLastLine = getLastElement(adjustedTextLines);
  const newToCh = originalTo.ch - (oldLastLine.length - newLastLine.length);
  const newTo = { line: originalTo.line - (didRemoveHeader ? 1 : 0), ch: newToCh };
  const newFromCh = didRemoveHeader
    ? 0
    : originalFrom.ch - (oldFirstLine.length - newFirstLine.length);
  const newFrom = { line: originalFrom.line, ch: newFromCh };
  const newRange = { from: newFrom, to: newTo };
  const { newAnchor, newHead } = getNewAnchorAndHead(originalCursorPositions, newRange);
  editor.setSelection(newAnchor, newHead);
}
