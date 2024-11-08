import { Command, Editor } from "obsidian";
import { CALLOUT_HEADER_WITH_ID_CAPTURE_REGEX } from "./calloutTitleUtils";
import { getSelectedLinesRangeAndText } from "./selectionUtils";

/**
 * See Obsidian docs for `editorCheckCallback` for more information:
 * https://docs.obsidian.md/Reference/TypeScript+API/Command/editorCheckCallback
 */
type EditorCheckCallback = Command["editorCheckCallback"];

/**
 * Creates an editor check callback for a command that should only be available when text is
 * currently selected in the editor.
 */
export function makeSelectionCheckCallback(
  editorAction: (editor: Editor) => void
): EditorCheckCallback {
  return (checking, editor, _ctx) => {
    if (!editor.somethingSelected()) return false; // Only show the command if text is selected
    return showOrRunCommand(editorAction, editor, checking);
  };
}

/**
 * Creates an editor check callback for a command that should only be available when the currently
 * selected lines begin with a callout.
 */
export function makeCalloutSelectionCheckCallback(
  editorAction: (editor: Editor) => void
): EditorCheckCallback {
  return (checking, editor, _ctx) => {
    if (!editor.somethingSelected()) return false; // Only show the command if text is selected
    if (!isFirstSelectedLineCalloutHeader(editor)) return false; // Only show the command if the selected lines begin with a callout
    return showOrRunCommand(editorAction, editor, checking);
  };
}

function isFirstSelectedLineCalloutHeader(editor: Editor): boolean {
  const { selectedLinesText } = getSelectedLinesRangeAndText(editor);
  return CALLOUT_HEADER_WITH_ID_CAPTURE_REGEX.test(selectedLinesText);
}

/**
 * Creates an editor check callback for a command that that runs on the current line of the cursor.
 * There should be no text currently selected in the editor, to avoid ambiguity in what will happen.
 */
export function makeCurrentLineCheckCallback(
  editorAction: (editor: Editor) => void
): EditorCheckCallback {
  return (checking, editor, _ctx) => {
    if (editor.somethingSelected()) return false; // Don't show the command if text is selected
    return showOrRunCommand(editorAction, editor, checking);
  };
}

/**
 * Shows or runs the given editor action depending on whether `checking` is true. Helper function
 * for creating editor check callbacks.
 */
function showOrRunCommand(
  editorAction: (editor: Editor) => void,
  editor: Editor,
  checking: boolean
): boolean {
  if (checking) return true;
  editorAction(editor);
  return true;
}
