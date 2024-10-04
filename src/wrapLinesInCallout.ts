import { Editor, EditorRange } from "obsidian";
import { DEFAULT_QUOTE_CALLOUT_HEADER } from "./calloutHeaders";
import { getSelectedLinesRangeAndText, getSelectionRange } from "./selectionHelpers";

/**
 * Wraps the selected lines in a quote callout.
 */
export function wrapSelectedLinesInQuoteCallout(editor: Editor): void {
  const selectionRange = getSelectionRange(editor);
  const { range: selectedLinesRange, text } = getSelectedLinesRangeAndText(editor);
  const prependedLines = text.replace(/^/gm, "> ");
  const newText = `${DEFAULT_QUOTE_CALLOUT_HEADER}\n${prependedLines}`;
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);
  setSelectionAfterWrappingLinesWithCallout(editor, selectionRange);
}

function setSelectionAfterWrappingLinesWithCallout(
  editor: Editor,
  originalSelectionRange: EditorRange
): void {
  const { from, to } = originalSelectionRange;
  const newFrom = { line: from.line, ch: 0 };
  const newTo = { line: to.line + 1, ch: to.ch + 2 };
  editor.setSelection(newFrom, newTo);
}

export function wrapCurrentLineInQuoteCallout(editor: Editor): void {
  const { line, ch } = editor.getCursor();
  const lineText = editor.getLine(line);
  const newText = `${DEFAULT_QUOTE_CALLOUT_HEADER}\n> ${lineText}`;
  editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });
  editor.setSelection({ line, ch: 0 }, { line: line + 1, ch: ch + 2 });
}
