import { Editor, EditorPosition } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { PluginSettingsManager } from "../../pluginSettingsManager";
import { makeDefaultCalloutHeader } from "../../utils/calloutTitleUtils";

/**
 * Wraps the cursor's current line in a callout.
 */
export function wrapCurrentLineInCallout(
  editor: Editor,
  calloutID: CalloutID,
  pluginSettingsManager: PluginSettingsManager
): void {
  const cursor = editor.getCursor();
  const { line } = cursor;
  const lineText = editor.getLine(line);
  const calloutHeader = makeDefaultCalloutHeader(calloutID);
  const prependedLine = `> ${lineText}`;
  const newText = `${calloutHeader}\n${prependedLine}`;
  editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });

  setSelectionOrCursor({ editor, cursor, lineText, pluginSettingsManager });
}

/**
 * Adjusts the selection or cursor (depending on user setting) after wrapping the current line in a
 * callout.
 */
function setSelectionOrCursor({
  editor,
  cursor,
  lineText,
  pluginSettingsManager,
}: {
  editor: Editor;
  cursor: EditorPosition;
  lineText: string;
  pluginSettingsManager: PluginSettingsManager;
}): void {
  const shouldSelect = pluginSettingsManager.getSetting("shouldSetSelectionAfterCurrentLineWrap");
  if (shouldSelect) {
    setSelection({ editor, cursor, lineText });
    return;
  }
  setCursor(editor, cursor);
}

function setSelection({
  cursor,
  lineText,
  editor,
}: {
  cursor: EditorPosition;
  lineText: string;
  editor: Editor;
}): void {
  const newFrom = { line: cursor.line, ch: 0 };
  const newToCh = Math.min(cursor.ch + 3, lineText.length + 2);
  const newTo = { line: cursor.line + 1, ch: newToCh };
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
