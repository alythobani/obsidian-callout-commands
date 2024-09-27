import { Editor, EditorPosition } from "obsidian";

export function getSelectionRange(editor: Editor): { from: EditorPosition; to: EditorPosition } {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  return { from, to };
}
