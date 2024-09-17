import { Command, Editor } from "obsidian";

type EditorCheckCallback = Command["editorCheckCallback"];

/**
 * Perform an action on the selected text if there is any, and return whether the action was performed.
 *
 * @param checking Whether we are checking or performing the action (see `editorCheckCallback`)
 * @param editor The editor instance
 * @param action The editor action to perform on the selected text
 */
function maybePerformActionOnSelectedText(
  checking: boolean,
  editor: Editor,
  action: (editor: Editor, selectedText: string) => void
): boolean {
  const selectedText = editor.getSelection();
  if (!selectedText) return false; // Don't show the command if no text is selected
  if (checking) return true;
  action(editor, selectedText);
  return true;
}

const maybeTurnSelectedLinesIntoQuoteCallout: EditorCheckCallback = (checking, editor, _ctx) => {
  return maybePerformActionOnSelectedText(checking, editor, (editor, selectedText) => {
    const replacedText = selectedText.replace(/^/gm, "> ");
    editor.replaceSelection(`\n\n> [!quote] Quote\n${replacedText}\n\n`);
  });
};

const maybeRemoveCalloutFromSelectedLines: EditorCheckCallback = (checking, editor, _ctx) => {
  return maybePerformActionOnSelectedText(checking, editor, (editor, selectedText) => {
    const removedCallout = selectedText.replace(/^> (\[!\w+\] )?/gm, "");
    editor.replaceSelection(removedCallout);
  });
};

export const allCommands: Command[] = [
  {
    id: "turn-selected-lines-into-quote-callout",
    name: "Turn Selected Lines into Quote Callout",
    editorCheckCallback: maybeTurnSelectedLinesIntoQuoteCallout,
  },
  {
    id: "remove-callout-from-selected-lines",
    name: "Remove Callout from Selected Lines",
    editorCheckCallback: maybeRemoveCalloutFromSelectedLines,
  },
];
