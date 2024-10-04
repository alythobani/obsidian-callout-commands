import { Editor, EditorRange } from "obsidian";

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
