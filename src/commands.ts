import { Command, Editor, EditorPosition } from "obsidian";
import { DEFAULT_QUOTE_CALLOUT_HEADER } from "./calloutHeaders";
import {
  makeCalloutSelectionCheckCallback,
  makeCurrentLineCheckCallback,
  makeSelectionCheckCallback,
} from "./editorCheckCallback";
import { removeCalloutFromSelectedLines } from "./removeCallout";
import { getSelectedLinesRangeAndText } from "./selectionHelpers";

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
