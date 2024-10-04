import { Command, Editor, EditorPosition, EditorRange } from "obsidian";
import { getLastElement, isNonEmptyArray } from "./arrayUtils";
import {
  makeCalloutSelectionCheckCallback,
  makeCurrentLineCheckCallback,
  makeSelectionCheckCallback,
} from "./editorCheckCallback";
import { getSelectedLinesRangeAndText, getSelectionRange } from "./selectionHelpers";

const BASE_QUOTE_CALLOUT_HEADER = "> [!quote]";
const DEFAULT_QUOTE_CALLOUT_HEADER = `${BASE_QUOTE_CALLOUT_HEADER} Quote`;

export const allCommands: Command[] = [
  {
    id: "wrap-selected-lines-in-quote-callout",
    name: "Wrap Selected Lines in Quote Callout",
    editorCheckCallback: makeSelectionCheckCallback(wrapSelectedLinesInQuoteCallout),
  },
  {
    id: "wrap-current-line-in-quote-callout",
    name: "Wrap Current Line in Quote Callout",
    editorCheckCallback: makeCurrentLineCheckCallback(wrapCurrentLineInQuoteCallout),
  },
  {
    id: "remove-callout-from-selected-lines",
    name: "Remove Callout from Selected Lines",
    editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
  },
];

/**
 * Wraps the selected lines in a quote callout. Note that we intentionally do not adjust the cursor
 * position after wrapping the text, since the full callout block will be selected after the wrapping,
 * which is convenient in case the user then wants to call another command (e.g. remove/change
 * callout) on the block.
 *
 * TODO: Actually, the behaviour post-wrapping is buggy if in visual mode instead of visual line
 * mode. Try setting the selection manually and see if that helps.
 */
function wrapSelectedLinesInQuoteCallout(editor: Editor): void {
  const { range, text } = getSelectedLinesRangeAndText(editor);
  const prependedLines = text.replace(/^/gm, "> ");
  const newText = `${DEFAULT_QUOTE_CALLOUT_HEADER}\n${prependedLines}`;
  editor.replaceRange(newText, range.from, range.to);
}

/**
 * Moves the cursor one line down (for the added callout header) and two characters to the right
 * (for the prepended `> `).
 *
 * @param editor The editor to move the cursor in.
 * @param originalCursor The cursor position before the callout was added.
 */
function setCursorPositionAfterWrappingWithCallout(
  editor: Editor,
  originalCursor: EditorPosition
): void {
  const { line, ch } = originalCursor;
  editor.setCursor({ line: line + 1, ch: ch + 2 });
}

function wrapCurrentLineInQuoteCallout(editor: Editor): void {
  // Save the cursor position before editing the text
  const originalCursor = editor.getCursor();
  // We can actually just call `wrapSelectedLinesInQuoteCallout` here, since the selected lines
  // range will be the current line if nothing is selected.
  wrapSelectedLinesInQuoteCallout(editor);
  setCursorPositionAfterWrappingWithCallout(editor, originalCursor);
}

/**
 * Removes the callout from the selected lines. Retains the title if it's not the default header for
 * the given callout, else removes the entire header line.
 */
function removeCalloutFromSelectedLines(editor: Editor): void {
  const selectionRange = getSelectionRange(editor); // Actual selection range
  const { range: selectedLinesRange, text } = getSelectedLinesRangeAndText(editor); // Full selected lines range and text
  const textLines = text.split("\n") as [string, ...string[]]; // `split` is guaranteed to return at least one element
  const [oldFirstLine, oldLastLine] = [textLines[0], getLastElement(textLines)]; // Save now to compare with post-edit lines
  if ([BASE_QUOTE_CALLOUT_HEADER, DEFAULT_QUOTE_CALLOUT_HEADER].includes(oldFirstLine)) {
    const linesWithoutHeader = textLines.slice(1);
    const unquotedLines = linesWithoutHeader.map((line) => line.replace(/^> /, ""));
    removeCallout({
      editor,
      adjustedTextLines: unquotedLines,
      didRemoveHeader: true,
      selectionRange,
      selectedLinesRange,
      oldFirstLine,
      oldLastLine,
    });
    return;
  }
  const customCalloutTitle = oldFirstLine.replace(/^> \[!\w+\] /, "");
  const unquotedLines = textLines.slice(1).map((line) => line.replace(/^> /, ""));
  const adjustedTextLines = [customCalloutTitle, ...unquotedLines];
  removeCallout({
    editor,
    adjustedTextLines,
    didRemoveHeader: false,
    selectionRange,
    selectedLinesRange,
    oldFirstLine,
    oldLastLine,
  });
}

function removeCallout({
  editor,
  adjustedTextLines,
  didRemoveHeader,
  selectionRange,
  selectedLinesRange,
  oldFirstLine,
  oldLastLine,
}: {
  editor: Editor;
  adjustedTextLines: readonly string[];
  didRemoveHeader: boolean;
  selectionRange: EditorRange;
  selectedLinesRange: EditorRange;
  oldFirstLine: string;
  oldLastLine: string;
}): void {
  if (!isNonEmptyArray(adjustedTextLines)) {
    // Must have removed the header line completely and there are no other lines
    editor.replaceRange("", selectedLinesRange.from, selectedLinesRange.to);
    editor.setSelection(selectedLinesRange.from, selectedLinesRange.from);
    return;
  }

  const newText = adjustedTextLines.join("\n");

  // Replace the selected lines with the unquoted text
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);

  // Set the selection to the same relative position as before, but with the new text
  setSelectionAfterRemovingCallout({
    adjustedTextLines,
    selectionRange,
    oldLastLine,
    didRemoveHeader,
    oldFirstLine,
    editor,
  });
}

function setSelectionAfterRemovingCallout({
  adjustedTextLines,
  selectionRange,
  oldLastLine,
  didRemoveHeader,
  oldFirstLine,
  editor,
}: {
  adjustedTextLines: [string, ...string[]];
  selectionRange: EditorRange;
  oldLastLine: string;
  didRemoveHeader: boolean;
  oldFirstLine: string;
  editor: Editor;
}): void {
  const newFirstLine = adjustedTextLines[0];
  const newLastLine = getLastElement(adjustedTextLines);
  const newToCh = selectionRange.to.ch - (oldLastLine.length - newLastLine.length);
  const newTo = { line: selectionRange.to.line - (didRemoveHeader ? 1 : 0), ch: newToCh };
  const newFromCh = didRemoveHeader
    ? 0
    : selectionRange.from.ch - (oldFirstLine.length - newFirstLine.length);
  const newFrom = { line: selectionRange.from.line, ch: newFromCh };
  editor.setSelection(newFrom, newTo);
}
