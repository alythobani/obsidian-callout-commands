import { Editor, EditorRange } from "obsidian";
import { NonEmptyStringArray } from "../utils/arrayUtils";
import {
  DEFAULT_QUOTE_CALLOUT_HEADER,
  DEFAULT_QUOTE_CALLOUT_TITLE,
  getCustomHeadingTitleIfExists,
  makeQuoteCalloutHeader,
} from "../utils/calloutTitleUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewAnchorAndHead,
  getSelectedLinesRangeAndText,
} from "../utils/selectionUtils";
import { getTextLines } from "../utils/stringUtils";

export function wrapCurrentLineOrSelectedLinesInQuoteCallout(editor: Editor): void {
  if (editor.somethingSelected()) {
    wrapSelectedLinesInQuoteCallout(editor);
    return;
  }
  wrapCurrentLineInQuoteCallout(editor);
}

/**
 * Wraps the selected lines in a quote callout.
 */
function wrapSelectedLinesInQuoteCallout(editor: Editor): void {
  const originalCursorPositions = getCursorPositions(editor); // Save cursor positions before editing
  const { range: selectedLinesRange, text: selectedText } = getSelectedLinesRangeAndText(editor);
  const selectedLines = getTextLines(selectedText);
  const { title, rawBodyLines } = getCalloutTitleAndRawBodyLines(selectedLines);
  wrapLinesInQuoteCallout({
    editor,
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
function getCalloutTitleAndRawBodyLines(selectedLines: NonEmptyStringArray): {
  title: string;
  rawBodyLines: string[];
} {
  const [firstSelectedLine, ...restSelectedLines] = selectedLines;
  const maybeHeadingTitle = getCustomHeadingTitleIfExists({ firstSelectedLine });
  if (maybeHeadingTitle === undefined) {
    return { title: DEFAULT_QUOTE_CALLOUT_TITLE, rawBodyLines: selectedLines };
  }
  return { title: maybeHeadingTitle, rawBodyLines: restSelectedLines };
}

function wrapLinesInQuoteCallout({
  editor,
  originalCursorPositions,
  selectedLines,
  selectedLinesRange,
  title,
  rawBodyLines,
}: {
  editor: Editor;
  originalCursorPositions: CursorPositions;
  selectedLines: NonEmptyStringArray;
  selectedLinesRange: EditorRange;
  title: string;
  rawBodyLines: string[];
}): void {
  const calloutBodyLines = rawBodyLines.map((line) => `> ${line}`);
  const calloutBody = calloutBodyLines.join("\n");
  const calloutHeader = makeQuoteCalloutHeader(title);
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
  const { from: originalFrom, to: originalTo } = originalCursorPositions;
  const newToCh = originalTo.ch + 2; // Add 2 for the "> " prefix
  const didAddHeaderLine = originalSelectedLines.length === calloutBodyLines.length;
  if (didAddHeaderLine) {
    const newFrom = { line: originalFrom.line, ch: 0 };
    const newTo = { line: originalTo.line + 1, ch: originalTo.ch + 2 };
    setSelection(editor, originalCursorPositions, { from: newFrom, to: newTo });
    return;
  }
  // We turned the existing first line from a heading into a callout header
  const originalFirstLine = originalSelectedLines[0];
  const rawNewFromCh = originalFrom.ch - (originalFirstLine.length - calloutHeader.length);
  const newFromCh = Math.clamp(rawNewFromCh, 0, calloutHeader.length);
  const newFrom = { line: originalFrom.line, ch: newFromCh };
  const newTo = { line: originalTo.line, ch: newToCh };
  const { newAnchor, newHead } = getNewAnchorAndHead(originalCursorPositions, {
    from: newFrom,
    to: newTo,
  });
  editor.setSelection(newAnchor, newHead);
}

function setSelection(
  editor: Editor,
  originalCursorPositions: CursorPositions,
  newRange: EditorRange
): void {
  const { newAnchor, newHead } = getNewAnchorAndHead(originalCursorPositions, newRange);
  editor.setSelection(newAnchor, newHead);
}

/**
 * Wraps the cursor's current line in a quote callout.
 */
function wrapCurrentLineInQuoteCallout(editor: Editor): void {
  const { line, ch } = editor.getCursor();
  const lineText = editor.getLine(line);
  const newText = `${DEFAULT_QUOTE_CALLOUT_HEADER}\n> ${lineText}`;
  editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });
  editor.setSelection({ line, ch: 0 }, { line: line + 1, ch: ch + 3 });
}
