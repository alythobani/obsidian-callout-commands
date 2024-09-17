import { Plugin } from "obsidian";
import { allCommands } from "./commands";

export default class CalloutCommands extends Plugin {
  onload() {
    console.log("Callout Commands loaded.");

    for (const command of allCommands) {
      this.addCommand(command);
    }
  }

  onunload() {
    console.log("Callout Commands unloaded.");
  }
}
