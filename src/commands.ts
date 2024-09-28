import { Command, Editor, EditorPosition } from "obsidian";
import { makeCurrentLineCheckCallback, makeSelectionCheckCallback } from "./editorCheckCallback";
import { getSelectedLinesRangeAndText } from "./selectionHelpers";

const QUOTE_CALLOUT_HEADER = "> [!quote] Quote";

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
    editorCheckCallback: makeSelectionCheckCallback(removeCalloutFromSelectedLines),
  },
];

/**
 * Wraps the selected lines in a quote callout. Note that we intentionally do not adjust the cursor
 * position after wrapping the text, since the full callout block will be selected after the wrapping,
 * which is convenient in case the user then wants to call another command (e.g. remove/change
 * callout) on the block.
 */
function wrapSelectedLinesInQuoteCallout(editor: Editor): void {
  const { range, text } = getSelectedLinesRangeAndText(editor);
  const prependedLines = text.replace(/^/gm, "> ");
  const newText = `${QUOTE_CALLOUT_HEADER}\n${prependedLines}`;
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
 * Removes the callout from the selected lines.
 *
 * TODO: Remove the full header line if it's the default header title.
 */
function removeCalloutFromSelectedLines(editor: Editor): void {
  const { range, text } = getSelectedLinesRangeAndText(editor);
  const removedCallout = text.replace(/^> (\[!\w+\] )?/gm, "");
  editor.replaceRange(removedCallout, range.from, range.to);
}
