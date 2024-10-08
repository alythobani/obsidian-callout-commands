import { Command } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { makeCalloutSelectionCheckCallback } from "../utils/editorCheckCallbackUtils";
import { toTitleCaseWord } from "../utils/stringUtils";
import { removeCalloutFromSelectedLines } from "./removeCallout";
import { makeWrapCurrentLineOrSelectedLinesInCalloutCommand } from "./wrapLinesInCallout";

const removeCalloutFromSelectedLinesCommand: Command = {
  id: "remove-callout-from-selected-lines",
  name: "Remove Callout from Selected Lines",
  editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
};

export function makeWrapCalloutCommand(calloutID: CalloutID): Command {
  const capitalizedKeyword = toTitleCaseWord(calloutID);
  return {
    id: getPartialWrapCalloutCommandID(calloutID),
    name: `Wrap Current Line or Selected Lines in ${capitalizedKeyword} Callout`,
    editorCallback: makeWrapCurrentLineOrSelectedLinesInCalloutCommand(calloutID),
  };
}

/**
 * Returns the command ID for wrapping the current line or selected lines in a callout.
 *
 * This is a partial command ID, so it should be combined with the plugin ID to form the full
 * command ID, e.g. when removing the command from the app.
 */
export function getPartialWrapCalloutCommandID(calloutID: CalloutID): string {
  return `wrap-current-line-or-selected-lines-in-${calloutID}-callout`;
}

export function getAllCommands(calloutIDs: readonly CalloutID[]): Command[] {
  const wrapCommands = calloutIDs.map(makeWrapCalloutCommand);
  return [...wrapCommands, removeCalloutFromSelectedLinesCommand];
}
