import { Editor } from "obsidian";
import { DEFAULT_QUOTE_CALLOUT_HEADER } from "./calloutHeaders";
import {
  CursorPositions,
  getCursorPositions,
  getNewAnchorAndHead,
  getSelectedLinesRangeAndText,
} from "./selectionHelpers";

export function wrapCurrentLineOrSelectedLinesInQuoteCallout(editor: Editor): void {
  if (editor.somethingSelected()) {
    wrapSelectedLinesInQuoteCallout(editor);
    return;
  }
  wrapCurrentLineInQuoteCallout(editor);
}

/**
 * Wraps the selected lines in a quote callout.
 */
function wrapSelectedLinesInQuoteCallout(editor: Editor): void {
  const originalCursorPositions = getCursorPositions(editor);
  const { range: selectedLinesRange, text } = getSelectedLinesRangeAndText(editor);
  const prependedLines = text.replace(/^/gm, "> ");
  const newText = `${DEFAULT_QUOTE_CALLOUT_HEADER}\n${prependedLines}`;
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);
  setSelectionAfterWrappingLinesInCallout(editor, originalCursorPositions);
}

/**
 * Sets the selection after wrapping the selected lines in a callout.
 */
function setSelectionAfterWrappingLinesInCallout(
  editor: Editor,
  originalCursorPositions: CursorPositions
): void {
  const { from: originalFrom, to: originalTo } = originalCursorPositions;
  const newFrom = { line: originalFrom.line, ch: 0 };
  const newTo = { line: originalTo.line + 1, ch: originalTo.ch + 2 };
  const { newAnchor, newHead } = getNewAnchorAndHead(originalCursorPositions, newFrom, newTo);
  editor.setSelection(newAnchor, newHead);
}

/**
 * Wraps the cursor's current line in a quote callout.
 */
function wrapCurrentLineInQuoteCallout(editor: Editor): void {
  const { line, ch } = editor.getCursor();
  const lineText = editor.getLine(line);
  const newText = `${DEFAULT_QUOTE_CALLOUT_HEADER}\n> ${lineText}`;
  editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });
  editor.setSelection({ line, ch: 0 }, { line: line + 1, ch: ch + 3 });
}
