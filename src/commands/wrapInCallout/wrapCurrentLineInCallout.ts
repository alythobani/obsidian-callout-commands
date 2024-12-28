import { type Editor, type EditorPosition } from "obsidian";
import { type CalloutID } from "obsidian-callout-manager";
import { type PluginSettingsManager } from "../../pluginSettingsManager";
import {
  type CalloutHeaderParts,
  constructCalloutHeaderFromParts,
  getNewCalloutHeaderParts,
  getTitleRange,
} from "../../utils/calloutTitleUtils";
import { throwNever } from "../../utils/errorUtils";

/**
 * Wraps the cursor's current line in a callout.
 */
export function wrapCurrentLineInCallout({
  editor,
  calloutID,
  pluginSettingsManager,
}: {
  editor: Editor;
  calloutID: CalloutID;
  pluginSettingsManager: PluginSettingsManager;
}): void {
  const oldCursor = editor.getCursor();
  const { line } = oldCursor;
  const oldLineText = editor.getLine(line);
  const calloutHeaderParts = getNewCalloutHeaderParts({
    calloutID,
    maybeTitleFromHeading: null,
    pluginSettingsManager,
  });
  const calloutHeader = constructCalloutHeaderFromParts(calloutHeaderParts);
  const newCalloutText = getNewCalloutText({ calloutHeader, oldLineText });
  editor.replaceRange(newCalloutText, { line, ch: 0 }, { line, ch: oldLineText.length });
  setSelectionOrCursorAfterWrappingCurrentLine({
    editor,
    oldCursor,
    oldLineText,
    pluginSettingsManager,
    calloutHeaderParts,
  });
}

function getNewCalloutText({
  calloutHeader,
  oldLineText,
}: {
  calloutHeader: string;
  oldLineText: string;
}): string {
  const prependedLine = `> ${oldLineText}`;
  const newCalloutText = `${calloutHeader}\n${prependedLine}`;
  return newCalloutText;
}

/**
 * Sets the selection or cursor (depending on user setting) after wrapping the current line in a
 * callout.
 */
function setSelectionOrCursorAfterWrappingCurrentLine({
  editor,
  oldCursor,
  oldLineText,
  pluginSettingsManager,
  calloutHeaderParts,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  oldLineText: string;
  pluginSettingsManager: PluginSettingsManager;
  calloutHeaderParts: CalloutHeaderParts;
}): void {
  const autoSelectionModes = pluginSettingsManager.getSetting("autoSelectionModes");
  switch (autoSelectionModes.whenNothingSelected) {
    case "selectHeaderToCursor": {
      selectHeaderToCursor({ editor, oldCursor, oldLineText });
      return;
    }
    case "selectFull": {
      selectFullCallout({ editor, oldCursor, oldLineText });
      return;
    }
    case "selectTitle": {
      selectTitle({ editor, oldCursor, calloutHeaderParts });
      return;
    }
    case "originalCursor": {
      setCursorToOriginalRelativePosition({ editor, oldCursor });
      break;
    }
    case "cursorEnd": {
      setCursorToEndOfLine({ editor, oldCursor, oldLineText });
      break;
    }
    default:
      throwNever(autoSelectionModes.whenNothingSelected);
  }
}

/**
 * Selects the full callout after wrapping the current line in a callout.
 */
function selectFullCallout({
  editor,
  oldCursor,
  oldLineText,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  oldLineText: string;
}): void {
  const newFrom = { line: oldCursor.line, ch: 0 };
  const newTo = { line: oldCursor.line + 1, ch: oldLineText.length + 2 };
  editor.setSelection(newFrom, newTo);
}

/**
 * Selects from the start of the callout header to the cursor's original relative position within
 * the text.
 */
function selectHeaderToCursor({
  editor,
  oldCursor,
  oldLineText,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  oldLineText: string;
}): void {
  const newFrom = { line: oldCursor.line, ch: 0 };
  const newToCh = Math.min(oldCursor.ch + 3, oldLineText.length + 2);
  const newTo = { line: oldCursor.line + 1, ch: newToCh };
  editor.setSelection(newFrom, newTo);
}

function selectTitle({
  editor,
  oldCursor,
  calloutHeaderParts,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  calloutHeaderParts: CalloutHeaderParts;
}): void {
  const titleRange = getTitleRange({ calloutHeaderParts, line: oldCursor.line });
  editor.setSelection(titleRange.from, titleRange.to);
}

/**
 * Moves the cursor one line down (for the added callout header) and two characters to the right
 * (for the prepended `> `).
 *
 * @param editor The editor to move the cursor in.
 * @param originalCursor The cursor position before the callout was added.
 */
function setCursorToOriginalRelativePosition({
  editor,
  oldCursor,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
}): void {
  const { line, ch } = oldCursor;
  editor.setCursor({ line: line + 1, ch: ch + 2 });
}

/**
 * Moves the cursor to the end of the line after wrapping the current line in a callout.
 */
function setCursorToEndOfLine({
  editor,
  oldCursor,
  oldLineText,
}: {
  editor: Editor;
  oldCursor: EditorPosition;
  oldLineText: string;
}): void {
  const { line } = oldCursor;
  editor.setCursor({ line, ch: oldLineText.length + 2 });
}
