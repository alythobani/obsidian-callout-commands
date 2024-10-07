import { Plugin } from "obsidian";
import { allCommands } from "./commands/allCommands";

export default class CalloutCommands extends Plugin {
  onload(): void {
    console.log("Callout Commands loaded.");
    this.addAllCommands();
  }

  addAllCommands(): void {
    for (const command of allCommands) {
      this.addCommand(command);
    }
  }

  onunload(): void {
    console.log("Callout Commands unloaded.");
  }
}
