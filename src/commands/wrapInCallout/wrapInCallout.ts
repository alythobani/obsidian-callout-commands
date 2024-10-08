import { Editor } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { wrapCurrentLineInCallout } from "./wrapCurrentLineInCallout";
import { wrapSelectedLinesInCallout } from "./wrapSelectedLinesInCallout";

export function makeWrapCurrentLineOrSelectedLinesInCalloutEditorCallback(
  calloutID: CalloutID
): (editor: Editor) => void {
  return (editor: Editor) => {
    wrapCurrentLineOrSelectedLinesInCallout(editor, calloutID);
  };
}

function wrapCurrentLineOrSelectedLinesInCallout(editor: Editor, calloutID: CalloutID): void {
  if (editor.somethingSelected()) {
    wrapSelectedLinesInCallout(editor, calloutID);
    return;
  }
  wrapCurrentLineInCallout(editor, calloutID);
}
