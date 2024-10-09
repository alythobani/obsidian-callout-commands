import { Command, Editor } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { toTitleCaseWord } from "../../utils/stringUtils";
import { getPartialWrapLinesInCalloutCommandID } from "../commandIDs";
import { wrapCurrentLineInCallout } from "./wrapCurrentLineInCallout";
import { wrapSelectedLinesInCallout } from "./wrapSelectedLinesInCallout";

export function makeWrapLinesInCalloutCommand(calloutID: CalloutID): Command {
  const capitalizedKeyword = toTitleCaseWord(calloutID);
  return {
    id: getPartialWrapLinesInCalloutCommandID(calloutID),
    name: `Wrap Lines in ${capitalizedKeyword} Callout`,
    editorCallback: makeWrapLinesInCalloutEditorCallback(calloutID),
  };
}

function makeWrapLinesInCalloutEditorCallback(calloutID: CalloutID): (editor: Editor) => void {
  return (editor: Editor) => wrapLinesInCallout(editor, calloutID);
}

function wrapLinesInCallout(editor: Editor, calloutID: CalloutID): void {
  if (editor.somethingSelected()) {
    wrapSelectedLinesInCallout(editor, calloutID);
    return;
  }
  wrapCurrentLineInCallout(editor, calloutID);
}
