import { Editor } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { makeDefaultCalloutHeader } from "../../utils/calloutTitleUtils";

/**
 * Wraps the cursor's current line in a callout.
 */
export function wrapCurrentLineInCallout(editor: Editor, calloutID: CalloutID): void {
  const { line, ch } = editor.getCursor();
  const lineText = editor.getLine(line);
  const calloutHeader = makeDefaultCalloutHeader(calloutID);
  const prependedLine = `> ${lineText}`;
  const newText = `${calloutHeader}\n${prependedLine}`;
  editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });
  const newFrom = { line, ch: 0 };
  const newToCh = Math.min(ch + 3, lineText.length + 2);
  const newTo = { line: line + 1, ch: newToCh };
  editor.setSelection(newFrom, newTo);
}
