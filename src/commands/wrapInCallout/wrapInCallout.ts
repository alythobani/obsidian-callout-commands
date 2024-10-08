import { Command, Editor } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { toTitleCaseWord } from "../../utils/stringUtils";
import { getPartialWrapCalloutCommandID } from "../commandIDs";
import { wrapCurrentLineInCallout } from "./wrapCurrentLineInCallout";
import { wrapSelectedLinesInCallout } from "./wrapSelectedLinesInCallout";

export function makeWrapInCalloutCommand(calloutID: CalloutID): Command {
  const capitalizedKeyword = toTitleCaseWord(calloutID);
  return {
    id: getPartialWrapCalloutCommandID(calloutID),
    name: `Wrap Current Line or Selected Lines in ${capitalizedKeyword} Callout`,
    editorCallback: makeWrapCurrentLineOrSelectedLinesInCalloutEditorCallback(calloutID),
  };
}

function makeWrapCurrentLineOrSelectedLinesInCalloutEditorCallback(
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
