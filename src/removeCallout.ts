import { Editor, EditorRange } from "obsidian";
import { getLastElement, isNonEmptyArray } from "./arrayUtils";
import { BASE_QUOTE_CALLOUT_HEADER, DEFAULT_QUOTE_CALLOUT_HEADER } from "./calloutHeaders";
import { getSelectedLinesRangeAndText, getSelectionRange } from "./selectionHelpers";

/**
 * Removes the callout from the selected lines. Retains the title if it's not the default header for
 * the given callout, else removes the entire header line.
 *
 * TODO: if there's a custom title, make it a heading when retaining it. This will make it easier to
 * convert the text back to a callout with the custom title if desired.
 */
export function removeCalloutFromSelectedLines(editor: Editor): void {
  const selectionRange = getSelectionRange(editor); // Actual selection range
  const { range: selectedLinesRange, text } = getSelectedLinesRangeAndText(editor); // Full selected lines range and text
  const textLines = text.split("\n") as [string, ...string[]]; // `split` is guaranteed to return at least one element
  const [oldFirstLine, oldLastLine] = [textLines[0], getLastElement(textLines)]; // Save now to compare with post-edit lines
  if ([BASE_QUOTE_CALLOUT_HEADER, DEFAULT_QUOTE_CALLOUT_HEADER].includes(oldFirstLine)) {
    const linesWithoutHeader = textLines.slice(1);
    const unquotedLines = linesWithoutHeader.map((line) => line.replace(/^> /, ""));
    removeCallout({
      editor,
      adjustedTextLines: unquotedLines,
      didRemoveHeader: true,
      selectionRange,
      selectedLinesRange,
      oldFirstLine,
      oldLastLine,
    });
    return;
  }
  const customCalloutTitle = oldFirstLine.replace(/^> \[!\w+\] /, "");
  const unquotedLines = textLines.slice(1).map((line) => line.replace(/^> /, ""));
  const adjustedTextLines = [customCalloutTitle, ...unquotedLines];
  removeCallout({
    editor,
    adjustedTextLines,
    didRemoveHeader: false,
    selectionRange,
    selectedLinesRange,
    oldFirstLine,
    oldLastLine,
  });
}

function removeCallout({
  editor,
  adjustedTextLines,
  didRemoveHeader,
  selectionRange,
  selectedLinesRange,
  oldFirstLine,
  oldLastLine,
}: {
  editor: Editor;
  adjustedTextLines: readonly string[];
  didRemoveHeader: boolean;
  selectionRange: EditorRange;
  selectedLinesRange: EditorRange;
  oldFirstLine: string;
  oldLastLine: string;
}): void {
  if (!isNonEmptyArray(adjustedTextLines)) {
    // Must have removed the header line completely and there are no other lines
    editor.replaceRange("", selectedLinesRange.from, selectedLinesRange.to);
    editor.setSelection(selectedLinesRange.from, selectedLinesRange.from);
    return;
  }

  const newText = adjustedTextLines.join("\n");

  // Replace the selected lines with the unquoted text
  editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);

  // Set the selection to the same relative position as before, but with the new text
  setSelectionAfterRemovingCallout({
    adjustedTextLines,
    selectionRange,
    oldLastLine,
    didRemoveHeader,
    oldFirstLine,
    editor,
  });
}

/**
 * Sets the selection after removing a callout from the selected lines. This function is necessary
 * because the length and content of the lines may have changed, so the selection must be adjusted
 * accordingly.
 *
 * TODO: correctly set anchor vs head based on the direction of the selection
 */
function setSelectionAfterRemovingCallout({
  adjustedTextLines,
  selectionRange,
  oldLastLine,
  didRemoveHeader,
  oldFirstLine,
  editor,
}: {
  adjustedTextLines: [string, ...string[]];
  selectionRange: EditorRange;
  oldLastLine: string;
  didRemoveHeader: boolean;
  oldFirstLine: string;
  editor: Editor;
}): void {
  const newFirstLine = adjustedTextLines[0];
  const newLastLine = getLastElement(adjustedTextLines);
  const newToCh = selectionRange.to.ch - (oldLastLine.length - newLastLine.length);
  const newTo = { line: selectionRange.to.line - (didRemoveHeader ? 1 : 0), ch: newToCh };
  const newFromCh = didRemoveHeader
    ? 0
    : selectionRange.from.ch - (oldFirstLine.length - newFirstLine.length);
  const newFrom = { line: selectionRange.from.line, ch: newFromCh };
  editor.setSelection(newFrom, newTo);
}
