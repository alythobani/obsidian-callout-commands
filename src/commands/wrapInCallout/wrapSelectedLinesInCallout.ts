import { Editor, EditorRange } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { getLastElement, isNonEmptyArray, NonEmptyStringArray } from "../../utils/arrayUtils";
import {
  getCustomHeadingTitleIfExists,
  getDefaultCalloutTitle,
  makeCalloutHeader,
} from "../../utils/calloutTitleUtils";
import {
  CursorPositions,
  getCursorPositions,
  getNewPositionWithinLine,
  getSelectedLinesRangeAndText,
  LineDiff,
  setSelectionInCorrectDirection,
} from "../../utils/selectionUtils";
import { getTextLines } from "../../utils/stringUtils";

/**
 * Wraps the selected lines in a callout.
 */
export function wrapSelectedLinesInCallout(editor: Editor, calloutID: CalloutID): void {
  const originalCursorPositions = getCursorPositions(editor); // Save cursor positions before editing
  const { range: selectedLinesRange, text: selectedText } = getSelectedLinesRangeAndText(editor);
  const selectedLines = getTextLines(selectedText);
  const { title, rawBodyLines } = getCalloutTitleAndRawBodyLinesFromSelectedLines(
    selectedLines,
    calloutID
  );
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
function getCalloutTitleAndRawBodyLinesFromSelectedLines(
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

/**
 * Gets the new selection range after wrapping the selected lines in a callout.
 */
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

  const lastLineDiff = getLastLineDiff(originalSelectedLines, calloutHeader, calloutBodyLines);
  const newToCh = getNewPositionWithinLine({ oldCh: originalTo.ch, lineDiff: lastLineDiff });

  // If all selected lines were used as the callout body, we added a new header line above them
  const didAddHeaderLine = originalSelectedLines.length === calloutBodyLines.length;

  const newToLine = originalTo.line + (didAddHeaderLine ? 1 : 0);
  const newTo = { line: newToLine, ch: newToCh };

  const newFrom = getNewFromPosition({
    didAddHeaderLine,
    originalFrom,
    originalSelectedLines,
    calloutHeader,
  });

  return { from: newFrom, to: newTo };
}

function getLastLineDiff(
  originalSelectedLines: NonEmptyStringArray,
  calloutHeader: string,
  calloutBodyLines: string[]
): LineDiff {
  const oldLine = getLastElement(originalSelectedLines);
  const newLine = isNonEmptyArray(calloutBodyLines)
    ? getLastElement(calloutBodyLines)
    : // The header line is the only (and thus last) line in the callout
      calloutHeader;
  return { oldLine, newLine };
}

function getNewFromPosition({
  didAddHeaderLine,
  originalFrom,
  originalSelectedLines,
  calloutHeader,
}: {
  didAddHeaderLine: boolean;
  originalFrom: { line: number; ch: number };
  originalSelectedLines: NonEmptyStringArray;
  calloutHeader: string;
}): { line: number; ch: number } {
  if (didAddHeaderLine) {
    // Select from the start of the header line if we added a new header line
    return { line: originalFrom.line, ch: 0 };
  }
  const newFromCh = getNewPositionWithinLine({
    oldCh: originalFrom.ch,
    lineDiff: { oldLine: originalSelectedLines[0], newLine: calloutHeader },
  });
  return { line: originalFrom.line, ch: newFromCh };
}
