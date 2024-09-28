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
 *
 * TODO: Actually, the behaviour post-wrapping is buggy if in visual mode instead of visual line
 * mode. Try setting the selection manually and see if that helps.
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
 * Removes the callout from the selected lines. Retains the title if it's not the default header for
 * the given callout, else removes the entire header line.
 */
function removeCalloutFromSelectedLines(editor: Editor): void {
  const { range, text } = getSelectedLinesRangeAndText(editor);
  const { from, to } = range;
  const firstLineText = editor.getLine(from.line);
  if (firstLineText === QUOTE_CALLOUT_HEADER) {
    const linesWithoutHeader = text.replace(/^.*\n/, "");
    const unIndentedLines = linesWithoutHeader.replace(/^> /gm, "");
    editor.replaceRange(unIndentedLines, from, to);
    return;
  }
  const removedCallout = text.replace(/^> (\[!\w+\] )?/gm, "");
  editor.replaceRange(removedCallout, from, to);
}
