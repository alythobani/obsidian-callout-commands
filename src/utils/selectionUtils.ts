import { Editor, EditorPosition, EditorRange } from "obsidian";
import { NonEmptyStringArray } from "./arrayUtils";

export interface CursorPositions {
  anchor: EditorPosition;
  head: EditorPosition;
  from: EditorPosition;
  to: EditorPosition;
}

export interface SelectedLinesDiff {
  oldLines: NonEmptyStringArray;
  newLines: NonEmptyStringArray;
}

export interface LineDiff {
  oldLine: string;
  newLine: string;
}

/**
 * Gets the new cursor `ch` position within a given line after it's been altered, while keeping the
 * cursor's relative position in the line the same.
 */
export function getNewPositionWithinLine({
  oldCh,
  lineDiff,
}: {
  oldCh: number;
  lineDiff: LineDiff;
}): number {
  const { oldLine, newLine } = lineDiff;
  const lineLengthDiff = oldLine.length - newLine.length;
  const newCh = Math.clamp(oldCh - lineLengthDiff, 0, newLine.length);
  return newCh;
}

/**
 * Returns the range and text of the selected lines, from the start of the first
 * selected line to the end of the last selected line (regardless of where in
 * the line each selection boundary is).
 */
export function getSelectedLinesRangeAndText(editor: Editor): {
  selectedLinesRange: EditorRange;
  selectedLinesText: string;
} {
  const { from, to } = getSelectedLinesRange(editor);
  const text = editor.getRange(from, to);
  return { selectedLinesRange: { from, to }, selectedLinesText: text };
}

function getSelectedLinesRange(editor: Editor): EditorRange {
  const { from, to } = getSelectionRange(editor);
  const startOfFirstSelectedLine = { line: from.line, ch: 0 };
  const endOfLastSelectedLine = { line: to.line, ch: editor.getLine(to.line).length };
  return { from: startOfFirstSelectedLine, to: endOfLastSelectedLine };
}

export function getCursorPositions(editor: Editor): CursorPositions {
  const { anchor, head } = getAnchorAndHead(editor);
  const { from, to } = getSelectionRange(editor);
  return { anchor, head, from, to };
}

export function getAnchorAndHead(editor: Editor): { anchor: EditorPosition; head: EditorPosition } {
  const anchor = editor.getCursor("anchor");
  const head = editor.getCursor("head");
  return { anchor, head };
}

export function getSelectionRange(editor: Editor): EditorRange {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  return { from, to };
}

export function setSelectionInCorrectDirection(
  editor: Editor,
  originalCursorPositions: CursorPositions,
  newRange: EditorRange
): void {
  const { newAnchor, newHead } = getNewAnchorAndHead(originalCursorPositions, newRange);
  editor.setSelection(newAnchor, newHead);
}

export function getNewAnchorAndHead(
  originalCursorPositions: CursorPositions,
  newRange: EditorRange
): { newAnchor: EditorPosition; newHead: EditorPosition } {
  const { from: newFrom, to: newTo } = newRange;
  return isHeadBeforeAnchor(originalCursorPositions)
    ? { newAnchor: newTo, newHead: newFrom }
    : { newAnchor: newFrom, newHead: newTo };
}

export function isHeadBeforeAnchor({
  anchor,
  head,
}: Pick<CursorPositions, "anchor" | "head">): boolean {
  return head.line < anchor.line || (head.line === anchor.line && head.ch < anchor.ch);
}
