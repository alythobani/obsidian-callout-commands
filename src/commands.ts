import { Command } from "obsidian";
import { makeCalloutSelectionCheckCallback } from "./editorCheckCallback";
import { removeCalloutFromSelectedLines } from "./removeCallout";
import { wrapCurrentLineOrSelectedLinesInQuoteCallout } from "./wrapLinesInCallout";

export const allCommands: Command[] = [
  {
    id: "wrap-current-line-or-selected-lines-in-quote-callout",
    name: "Wrap Current Line or Selected Lines in Quote Callout",
    editorCallback: wrapCurrentLineOrSelectedLinesInQuoteCallout,
  },
  {
    id: "remove-callout-from-selected-lines",
    name: "Remove Callout from Selected Lines",
    editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
  },
];
