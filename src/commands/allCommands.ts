import { Command } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { makeCalloutSelectionCheckCallback } from "../utils/editorCheckCallbackUtils";
import { toTitleCaseWord } from "../utils/stringUtils";
import { getPartialWrapCalloutCommandID } from "./commandIDs";
import { removeCalloutFromSelectedLines } from "./removeCallout";
import { makeWrapCurrentLineOrSelectedLinesInCalloutEditorCallback } from "./wrapInCallout/wrapInCallout";

export const removeCalloutFromSelectedLinesCommand: Command = {
  id: "remove-callout-from-selected-lines",
  name: "Remove Callout from Selected Lines",
  editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
};

export function makeWrapInCalloutCommand(calloutID: CalloutID): Command {
  const capitalizedKeyword = toTitleCaseWord(calloutID);
  return {
    id: getPartialWrapCalloutCommandID(calloutID),
    name: `Wrap Current Line or Selected Lines in ${capitalizedKeyword} Callout`,
    editorCallback: makeWrapCurrentLineOrSelectedLinesInCalloutEditorCallback(calloutID),
  };
}

export function getAllCommands(calloutIDs: readonly CalloutID[]): Command[] {
  const wrapCommands = calloutIDs.map(makeWrapInCalloutCommand);
  return [...wrapCommands, removeCalloutFromSelectedLinesCommand];
}
