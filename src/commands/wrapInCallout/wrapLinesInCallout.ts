import { Command, Editor } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { PluginSettingsManager } from "../../pluginSettingsManager";
import { toTitleCaseWord } from "../../utils/stringUtils";
import { getPartialWrapLinesInCalloutCommandID } from "../commandIDs";
import { wrapCurrentLineInCallout } from "./wrapCurrentLineInCallout";
import { wrapSelectedLinesInCallout } from "./wrapSelectedLinesInCallout";

/**
 * Makes a command that wraps the current line, or selected lines if there are any, in the given
 * callout.
 */
export function makeWrapLinesInCalloutCommand(
  calloutID: CalloutID,
  pluginSettingsManager: PluginSettingsManager
): Command {
  const capitalizedKeyword = toTitleCaseWord(calloutID);
  return {
    id: getPartialWrapLinesInCalloutCommandID(calloutID),
    name: `Wrap Lines in ${capitalizedKeyword} Callout`,
    editorCallback: (editor) => wrapLinesInCallout(editor, calloutID, pluginSettingsManager),
  };
}

function wrapLinesInCallout(
  editor: Editor,
  calloutID: CalloutID,
  pluginSettingsManager: PluginSettingsManager
): void {
  if (editor.somethingSelected()) {
    wrapSelectedLinesInCallout(editor, calloutID);
    return;
  }
  wrapCurrentLineInCallout(editor, calloutID, pluginSettingsManager);
}
