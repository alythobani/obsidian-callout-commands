import { Notice, Plugin } from "obsidian";
import { turnSelectedLinesIntoQuoteCallout } from "./commands";

export default class CalloutCommands extends Plugin {
  onload() {
    console.log("Callout Commands loaded.");

    // 1. Turn selected lines into a callout
    this.addCommand({
      id: "turn-selected-lines-into-quote-callout",
      name: "Turn Selected Lines into Quote Callout",
      editorCheckCallback: turnSelectedLinesIntoQuoteCallout,
    });

    // 2. Remove callout from selected lines
    this.addCommand({
      id: "remove-callout",
      name: "Remove Callout from Selected Lines",
      editorCallback: (editor, _ctx) => {
        const selectedText = editor.getSelection();
        const removedCallout = selectedText.replace(/^> \[!\w+\] \n/, ""); // Remove callout syntax
        editor.replaceSelection(removedCallout);
        new Notice("Callout removed from selected lines.");
      },
    });

    // 3. Change current callout type
    this.addCommand({
      id: "change-callout",
      name: "Change Current Callout Type",
      editorCallback: (editor, _ctx) => {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const newCalloutType = "info"; // New callout type, e.g., "info"

        if (/^> \[!\w+\]/.exec(line)) {
          const updatedLine = line.replace(/^> \[!\w+\]/, `> [!${newCalloutType}]`);
          editor.setLine(cursor.line, updatedLine);
          new Notice(`Callout type changed to ${newCalloutType}.`);
        } else {
          new Notice("No callout found on the current line.");
        }
      },
    });
  }

  onunload() {
    console.log("Callout Commands unloaded.");
  }
}
