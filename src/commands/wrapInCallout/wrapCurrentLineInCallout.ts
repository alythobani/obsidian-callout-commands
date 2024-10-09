import { Editor, EditorPosition } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { makeDefaultCalloutHeader } from "../../utils/calloutTitleUtils";

/**
 * Wraps the cursor's current line in a callout.
 */
export function wrapCurrentLineInCallout({
  editor,
  calloutID,
  shouldSetSelection,
}: {
  editor: Editor;
  calloutID: CalloutID;
  shouldSetSelection: boolean;
}): void {
  const cursor = editor.getCursor();
  const { line } = cursor;
  const lineText = editor.getLine(line);
  const newCalloutText = getNewCalloutText(calloutID, lineText);
  editor.replaceRange(newCalloutText, { line, ch: 0 }, { line, ch: lineText.length });
  setSelectionOrCursor({ editor, oldCursor: cursor, lineText, shouldSetSelection });
}

function getNewCalloutText(calloutID: string, lineText: string): string {
  const calloutHeader = makeDefaultCalloutHeader(calloutID);
  const prependedLine = `> ${lineText}`;
  const newCalloutText = `${calloutHeader}\n${prependedLine}`;
  return newCalloutText;
}

/**
 * Adjusts the selection or cursor (depending on user setting) after wrapping the current line in a
 * callout.
 */
function setSelectionOrCursor({
  editor,
  oldCursor,
  lineText,
  shouldSetSelection,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  lineText: string;
  shouldSetSelection: boolean;
}): void {
  if (shouldSetSelection) {
    setSelection({ editor, oldCursor, lineText });
    return;
  }
  setCursor(editor, oldCursor);
}

/**
 * Sets the selection from the start of the callout header to the cursor's original relative
 * position within the text.
 */
function setSelection({
  editor,
  oldCursor: { line: oldLine, ch: oldCh },
  lineText,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  lineText: string;
}): void {
  const newFrom = { line: oldLine, ch: 0 };
  const newLineLength = lineText.length + 2;
  const newToCh = Math.min(oldCh + 3, newLineLength);
  const newTo = { line: oldLine + 1, ch: newToCh };
  editor.setSelection(newFrom, newTo);
}

/**
 * Moves the cursor one line down (for the added callout header) and two characters to the right
 * (for the prepended `> `).
 *
 * @param editor The editor to move the cursor in.
 * @param originalCursor The cursor position before the callout was added.
 */
function setCursor(editor: Editor, originalCursor: EditorPosition): void {
  const { line, ch } = originalCursor;
  editor.setCursor({ line: line + 1, ch: ch + 2 });
}
