import {} from "obsidian";

declare module "obsidian" {
  export interface App {
    commands: {
      removeCommand: (commandID: string) => void;
    };
  }
}
