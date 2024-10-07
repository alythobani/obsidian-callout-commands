import { Plugin } from "obsidian";
import {
  CalloutID,
  CalloutManager,
  getApi,
  isInstalled as isCalloutManagerInstalled,
} from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import { getAllCommands } from "./commands/allCommands";

declare module "obsidian" {
  interface App {
    commands: {
      addCommand: (command: Command) => void;
      removeCommand: (commandID: string) => void;
    };
  }
}

export default class CalloutToggleCommandsPlugin extends Plugin {
  private calloutManager?: CalloutManager<true>;
  private name = "Callout Toggle Commands";

  private log(message: string): void {
    console.log(`${this.name}: ${message}`);
  }

  private logError(message: string): void {
    console.error(`${this.name}: ${message}`);
  }

  onload(): void {
    this.log("Plugin loaded.");

    this.app.workspace.onLayoutReady(async () => {
      await this.maybeLoadCalloutManager();
      this.addAllCommands();
    });
  }

  private async maybeLoadCalloutManager(): Promise<void> {
    if (isCalloutManagerInstalled(this.app)) {
      const calloutManager = await getApi(this);
      if (calloutManager === undefined) {
        this.logError("Failed to get Callout Manager API handle.");
        return;
      }
      this.calloutManager = calloutManager;
    }
  }

  private addAllCommands(): void {
    const allCalloutIDs = this.getAllCalloutIDs();
    const allCommands = getAllCommands(allCalloutIDs);
    for (const command of allCommands) {
      this.addCommand(command);
    }
  }

  private getAllCalloutIDs(): readonly CalloutID[] {
    if (this.calloutManager === undefined) {
      this.log("Callout Manager not available; using hardcoded list of callout IDs instead");
      return this.getBuiltinCalloutIDs();
    }
    return this.getAllCalloutIDsFromCalloutManager(this.calloutManager);
  }

  private getAllCalloutIDsFromCalloutManager(calloutManager: CalloutManager): readonly CalloutID[] {
    const allCallouts = calloutManager.getCallouts();
    const allCalloutIDs = allCallouts.map((callout) => callout.id);
    this.log(`Got callout IDs from Callout Manager: ${allCalloutIDs.join(", ")}`);
    return allCalloutIDs;
  }

  private getBuiltinCalloutIDs(): readonly CalloutID[] {
    return BUILTIN_CALLOUT_IDS;
  }

  onunload(): void {
    this.log("Plugin unloaded.");
  }
}
