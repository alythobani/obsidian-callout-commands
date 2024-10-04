import { Command } from "obsidian";
import {
  makeCalloutSelectionCheckCallback,
  makeCurrentLineCheckCallback,
  makeSelectionCheckCallback,
} from "./editorCheckCallback";
import { removeCalloutFromSelectedLines } from "./removeCallout";
import {
  wrapCurrentLineInQuoteCallout,
  wrapSelectedLinesInQuoteCallout,
} from "./wrapLinesInCallout";

export const allCommands: Command[] = [
  {
    id: "wrap-selected-lines-in-quote-callout",
    name: "Wrap Selected Lines in Quote Callout",
    editorCheckCallback: makeSelectionCheckCallback(wrapSelectedLinesInQuoteCallout),
  },
  {
    id: "wrap-current-line-in-quote-callout",
    name: "Wrap Current Line in Quote Callout",
    editorCheckCallback: makeCurrentLineCheckCallback(wrapCurrentLineInQuoteCallout),
  },
  {
    id: "remove-callout-from-selected-lines",
    name: "Remove Callout from Selected Lines",
    editorCheckCallback: makeCalloutSelectionCheckCallback(removeCalloutFromSelectedLines),
  },
];
