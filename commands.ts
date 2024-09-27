import { Command, Editor } from "obsidian";

const QUOTE_CALLOUT_HEADER = "> [!quote] Quote";

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

function wrapCurrentLineInQuoteCallout(editor: Editor) {
  const cursor = editor.getCursor();
  const { line, ch } = cursor;
  const lineText = editor.getLine(line);
  const newText = `${QUOTE_CALLOUT_HEADER}\n> ${lineText}`;
  editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });
  editor.setCursor({ line: line + 1, ch: ch + 2 }); // Keep cursor where it was relative to the original line
}

const maybeTurnSelectedLinesIntoQuoteCallout: EditorCheckCallback = (checking, editor, _ctx) => {
  return maybePerformActionOnSelectedText(checking, editor, (editor, selectedText) => {
    const replacedText = selectedText.replace(/^/gm, "> ");
    editor.replaceSelection(`\n\n${QUOTE_CALLOUT_HEADER}\n${replacedText}\n\n`, selectedText);
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
    id: "wrap-current-line-in-quote-callout",
    name: "Wrap Current Line in Quote Callout",
    editorCheckCallback: (checking, editor, _ctx) => {
      const selectedText = editor.getSelection();
      if (selectedText) return false; // Don't show the command if text is selected
      if (checking) return true;
      wrapCurrentLineInQuoteCallout(editor);
      return true;
    },
  },
  {
    id: "remove-callout-from-selected-lines",
    name: "Remove Callout from Selected Lines",
    editorCheckCallback: maybeRemoveCalloutFromSelectedLines,
  },
];
