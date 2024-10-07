import { Command } from "obsidian";
import { BUILTIN_CALLOUT_KEYWORDS } from "../callouts/builtinCallouts";
import { makeCalloutSelectionCheckCallback } from "../utils/editorCheckCallbackUtils";
import { toTitleCaseWord } from "../utils/stringUtils";
import { removeCalloutFromSelectedLines } from "./removeCallout";
import { makeWrapCurrentLineOrSelectedLinesInCalloutCommand } from "./wrapLinesInCallout";

const allBuiltinWrapCommands = BUILTIN_CALLOUT_KEYWORDS.map((calloutKeyword) => {
  const capitalizedKeyword = toTitleCaseWord(calloutKeyword);
  return {
    id: `wrap-current-line-or-selected-lines-in-${calloutKeyword}-callout`,
    name: `Wrap Current Line or Selected Lines in ${capitalizedKeyword} Callout`,
    editorCallback: makeWrapCurrentLineOrSelectedLinesInCalloutCommand(calloutKeyword),
  } as const;
});

const removeCalloutFromSelectedLinesCommand: Command = {
  id: "remove-callout-from-selected-lines",
  name: "Remove Callout from Selected Lines",
  editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
};

export const allCommands: Command[] = [
  ...allBuiltinWrapCommands,
  removeCalloutFromSelectedLinesCommand,
];
