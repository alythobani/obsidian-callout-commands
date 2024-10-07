import { Editor, EditorPosition, EditorRange } from "obsidian";

export interface CursorPositions {
  anchor: EditorPosition;
  head: EditorPosition;
  from: EditorPosition;
  to: EditorPosition;
}

/**
 * Returns the range and text of the selected lines, from the start of the first
 * selected line to the end of the last selected line (regardless of where in
 * the line each selection boundary is).
 */
export function getSelectedLinesRangeAndText(editor: Editor): { range: EditorRange; text: string } {
  const { from, to } = getSelectedLinesRange(editor);
  const text = editor.getRange(from, to);
  return { range: { from, to }, text };
}

function getSelectedLinesRange(editor: Editor): EditorRange {
  const { from, to } = getSelectionRange(editor);
  const startOfFirstSelectedLine = { line: from.line, ch: 0 };
  const endOfLastSelectedLine = { line: to.line, ch: editor.getLine(to.line).length };
  return { from: startOfFirstSelectedLine, to: endOfLastSelectedLine };
}

export function getSelectionRange(editor: Editor): EditorRange {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  return { from, to };
}

export function getAnchorAndHead(editor: Editor): { anchor: EditorPosition; head: EditorPosition } {
  const anchor = editor.getCursor("anchor");
  const head = editor.getCursor("head");
  return { anchor, head };
}

export function getCursorPositions(editor: Editor): CursorPositions {
  const { anchor, head } = getAnchorAndHead(editor);
  const { from, to } = getSelectionRange(editor);
  return { anchor, head, from, to };
}

export function isHeadBeforeAnchor({
  anchor,
  head,
}: Pick<CursorPositions, "anchor" | "head">): boolean {
  return head.line < anchor.line || (head.line === anchor.line && head.ch < anchor.ch);
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
