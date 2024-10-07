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

function makeWrapCalloutCommand() {
  return (calloutID: CalloutID): Command => {
    const capitalizedKeyword = toTitleCaseWord(calloutID);
    return {
      id: `wrap-current-line-or-selected-lines-in-${calloutID}-callout`,
      name: `Wrap Current Line or Selected Lines in ${capitalizedKeyword} Callout`,
      editorCallback: makeWrapCurrentLineOrSelectedLinesInCalloutCommand(calloutID),
    } as const;
  };
}

export function getAllCommands(calloutIDs: readonly CalloutID[]): Command[] {
  const wrapCommands = calloutIDs.map(makeWrapCalloutCommand());
  return [...wrapCommands, removeCalloutFromSelectedLinesCommand];
}
