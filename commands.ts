import { Command } from "obsidian";

type EditorCheckCallback = Command["editorCheckCallback"];

export const turnSelectedLinesIntoQuoteCallout: EditorCheckCallback = (checking, editor, _ctx) => {
  const selectedText = editor.getSelection();
  if (!selectedText) return false; // Don't show the command if no text is selected
  if (checking) return true;
  const replacedText = selectedText.replace(/^/gm, "> ");
  editor.replaceSelection(`\n\n> [!quote] Quote\n${replacedText}\n\n`);
  return true;
};
