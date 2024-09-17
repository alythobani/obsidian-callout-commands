import { Command } from "obsidian";

type EditorCheckCallback = Command["editorCheckCallback"];

const turnSelectedLinesIntoQuoteCallout: EditorCheckCallback = (checking, editor, _ctx) => {
  const selectedText = editor.getSelection();
  if (!selectedText) return false; // Don't show the command if no text is selected
  if (checking) return true;
  const replacedText = selectedText.replace(/^/gm, "> ");
  editor.replaceSelection(`\n\n> [!quote] Quote\n${replacedText}\n\n`);
  return true;
};

const removeCalloutFromSelectedLines: EditorCheckCallback = (checking, editor, _ctx) => {
  const selectedText = editor.getSelection();
  if (!selectedText) return false; // Don't show the command if no text is selected
  if (checking) return true;
  const removedCallout = selectedText.replace(/^> (\[!\w+\] )?/gm, "");
  editor.replaceSelection(removedCallout);
  return true;
};

export const allCommands: Command[] = [
  {
    id: "turn-selected-lines-into-quote-callout",
    name: "Turn Selected Lines into Quote Callout",
    editorCheckCallback: turnSelectedLinesIntoQuoteCallout,
  },
  {
    id: "remove-callout-from-selected-lines",
    name: "Remove Callout from Selected Lines",
    editorCheckCallback: removeCalloutFromSelectedLines,
  },
];
