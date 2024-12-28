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
import {
  type ClearSelectionAction,
  type CursorOrSelectionAction,
  runCursorOrSelectionAction,
  type SetSelectionAction,
} from "../../utils/selectionUtils";

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
  const cursorOrSelectionAction = getCursorOrSelectionActionAfterWrappingCurrentLine({
    oldCursor,
    oldLineText,
    pluginSettingsManager,
    calloutHeaderParts,
  });
  runCursorOrSelectionAction({ editor, action: cursorOrSelectionAction });
}

function getCursorOrSelectionActionAfterWrappingCurrentLine({
  oldCursor,
  oldLineText,
  pluginSettingsManager,
  calloutHeaderParts,
}: {
  oldCursor: EditorPosition;
  oldLineText: string;
  pluginSettingsManager: PluginSettingsManager;
  calloutHeaderParts: CalloutHeaderParts;
}): CursorOrSelectionAction {
  const autoSelectionModes = pluginSettingsManager.getSetting("autoSelectionModes");
  switch (autoSelectionModes.whenNothingSelected) {
    case "selectHeaderToCursor": {
      return getSelectHeaderToCursorAction({ oldCursor, oldLineText });
    }
    case "selectFull": {
      return getSelectFullCalloutAction({ oldCursor, oldLineText });
    }
    case "selectTitle": {
      return getSelectTitleAction({ oldCursor, calloutHeaderParts });
    }
    case "originalCursor": {
      return getCursorToOriginalRelativePositionAction({ oldCursor });
    }
    case "cursorEnd": {
      return getCursorToEndOfLineAction({ oldCursor, oldLineText });
    }
    default:
      throwNever(autoSelectionModes.whenNothingSelected);
  }
}

/**
 * Selects the full callout after wrapping the current line in a callout.
 */
function getSelectFullCalloutAction({
  oldCursor,
  oldLineText,
}: {
  oldCursor: EditorPosition;
  oldLineText: string;
}): SetSelectionAction {
  const newFrom = { line: oldCursor.line, ch: 0 };
  const newTo = { line: oldCursor.line + 1, ch: oldLineText.length + 2 };
  return { type: "setSelection", newRange: { from: newFrom, to: newTo } };
}

/**
 * Selects from the start of the callout header to the cursor's original relative position within
 * the text.
 */
function getSelectHeaderToCursorAction({
  oldCursor,
  oldLineText,
}: {
  oldCursor: EditorPosition;
  oldLineText: string;
}): SetSelectionAction {
  const newFrom = { line: oldCursor.line, ch: 0 };
  const newToCh = Math.min(oldCursor.ch + 3, oldLineText.length + 2);
  const newTo = { line: oldCursor.line + 1, ch: newToCh };
  return { type: "setSelection", newRange: { from: newFrom, to: newTo } };
}

function getSelectTitleAction({
  oldCursor,
  calloutHeaderParts,
}: {
  oldCursor: EditorPosition;
  calloutHeaderParts: CalloutHeaderParts;
}): SetSelectionAction {
  const titleRange = getTitleRange({ calloutHeaderParts, line: oldCursor.line });
  return { type: "setSelection", newRange: titleRange };
}

function getCursorToOriginalRelativePositionAction({
  oldCursor,
}: {
  oldCursor: EditorPosition;
}): ClearSelectionAction {
  const { line, ch } = oldCursor;
  return { type: "clearSelection", newCursor: { line: line + 1, ch: ch + 2 } };
}

function getCursorToEndOfLineAction({
  oldCursor,
  oldLineText,
}: {
  oldCursor: EditorPosition;
  oldLineText: string;
}): ClearSelectionAction {
  const { line } = oldCursor;
  return { type: "clearSelection", newCursor: { line, ch: oldLineText.length + 2 } };
}
