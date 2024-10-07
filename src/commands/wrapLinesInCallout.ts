import { Editor, EditorRange } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { NonEmptyStringArray } from "../utils/arrayUtils";
import {
  getCustomHeadingTitleIfExists,
  getDefaultCalloutTitle,
  makeCalloutHeader,
  makeDefaultCalloutHeader,
} from "../utils/calloutTitleUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewAnchorAndHead,
  getSelectedLinesRangeAndText,
} from "../utils/selectionUtils";
import { getTextLines } from "../utils/stringUtils";

export function makeWrapCurrentLineOrSelectedLinesInCalloutCommand(
  calloutID: CalloutID
): (editor: Editor) => void {
  return (editor: Editor) => {
    wrapCurrentLineOrSelectedLinesInCallout(editor, calloutID);
  };
}

function wrapCurrentLineOrSelectedLinesInCallout(editor: Editor, calloutID: CalloutID): void {
  if (editor.somethingSelected()) {
    wrapSelectedLinesInCallout(editor, calloutID);
    return;
  }
  wrapCurrentLineInCallout(editor, calloutID);
}

/**
 * Wraps the selected lines in a callout.
 */
function wrapSelectedLinesInCallout(editor: Editor, calloutID: CalloutID): void {
  const originalCursorPositions = getCursorPositions(editor); // Save cursor positions before editing
  const { range: selectedLinesRange, text: selectedText } = getSelectedLinesRangeAndText(editor);
  const selectedLines = getTextLines(selectedText);
  const { title, rawBodyLines } = getCalloutTitleAndRawBodyLines(selectedLines, calloutID);
  wrapLinesInCallout({
    editor,
    calloutID,
    originalCursorPositions,
    selectedLines,
    selectedLinesRange,
    title,
    rawBodyLines,
  });
}

/**
 * Gets the callout title and raw (not yet prepended) body lines from the selected text lines. If
 * the first line is a heading, it is used as the callout title, and the rest of the lines are used
 * as the body. Otherwise, the default callout title is used, and all the selected lines are used as
 * the body.
 */
function getCalloutTitleAndRawBodyLines(
  selectedLines: NonEmptyStringArray,
  calloutID: CalloutID
): { title: string; rawBodyLines: string[] } {
  const [firstSelectedLine, ...restSelectedLines] = selectedLines;
  const maybeHeadingTitle = getCustomHeadingTitleIfExists({ firstSelectedLine });
  if (maybeHeadingTitle === undefined) {
    const defaultCalloutTitle = getDefaultCalloutTitle(calloutID);
    return { title: defaultCalloutTitle, rawBodyLines: selectedLines };
  }
  return { title: maybeHeadingTitle, rawBodyLines: restSelectedLines };
}

/**
 * Wraps the selected lines in a callout.
 */
function wrapLinesInCallout({
  editor,
  calloutID,
  originalCursorPositions,
  selectedLines,
  selectedLinesRange,
  title,
  rawBodyLines,
}: {
  editor: Editor;
  calloutID: CalloutID;
  originalCursorPositions: CursorPositions;
  selectedLines: NonEmptyStringArray;
  selectedLinesRange: EditorRange;
  title: string;
  rawBodyLines: string[];
}): void {
  const calloutBodyLines = rawBodyLines.map((line) => `> ${line}`);
  const calloutBody = calloutBodyLines.join("\n");
  const calloutHeader = makeCalloutHeader({ calloutID, title });
  const newText = `${calloutHeader}\n${calloutBody}`;
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);

  setSelectionAfterWrappingLinesInCallout({
    editor,
    originalCursorPositions,
    originalSelectedLines: selectedLines,
    calloutHeader,
    calloutBodyLines,
  });
}

/**
 * Sets the selection after wrapping the selected lines in a callout.
 */
function setSelectionAfterWrappingLinesInCallout({
  editor,
  originalCursorPositions,
  originalSelectedLines,
  calloutHeader,
  calloutBodyLines,
}: {
  editor: Editor;
  originalCursorPositions: CursorPositions;
  originalSelectedLines: NonEmptyStringArray;
  calloutHeader: string;
  calloutBodyLines: string[];
}): void {
  const newRange = getNewSelectionRangeAfterWrappingLinesInCallout({
    originalCursorPositions,
    originalSelectedLines,
    calloutHeader,
    calloutBodyLines,
  });
  setSelectionInCorrectDirection(editor, originalCursorPositions, newRange);
}

function getNewSelectionRangeAfterWrappingLinesInCallout({
  originalCursorPositions,
  originalSelectedLines,
  calloutHeader,
  calloutBodyLines,
}: {
  originalCursorPositions: CursorPositions;
  originalSelectedLines: NonEmptyStringArray;
  calloutHeader: string;
  calloutBodyLines: string[];
}): EditorRange {
  const { from: originalFrom, to: originalTo } = originalCursorPositions;

  // Add 2 characters for the "> " prefix
  const lastBodyLineLength = calloutBodyLines[calloutBodyLines.length - 1]?.length ?? 0;
  const newToCh = Math.min(originalTo.ch + 2, lastBodyLineLength - 1);

  const didAddHeaderLine = originalSelectedLines.length === calloutBodyLines.length;
  if (didAddHeaderLine) {
    const newFrom = { line: originalFrom.line, ch: 0 };
    const newTo = { line: originalTo.line + 1, ch: newToCh };
    return { from: newFrom, to: newTo };
  }

  // We turned the existing first line from a heading into a callout header
  const originalFirstLine = originalSelectedLines[0];
  const rawNewFromCh = originalFrom.ch - (originalFirstLine.length - calloutHeader.length);
  const newFromCh = Math.clamp(rawNewFromCh, 0, calloutHeader.length);
  const newFrom = { line: originalFrom.line, ch: newFromCh };
  const newTo = { line: originalTo.line, ch: newToCh };
  return { from: newFrom, to: newTo };
}

function setSelectionInCorrectDirection(
  editor: Editor,
  originalCursorPositions: CursorPositions,
  newRange: EditorRange
): void {
  const { newAnchor, newHead } = getNewAnchorAndHead(originalCursorPositions, newRange);
  editor.setSelection(newAnchor, newHead);
}

/**
 * Wraps the cursor's current line in a callout.
 */
function wrapCurrentLineInCallout(editor: Editor, calloutID: CalloutID): void {
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
