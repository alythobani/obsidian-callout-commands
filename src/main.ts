import { Plugin } from "obsidian";
import {
  CalloutID,
  CalloutManager,
  getApi,
  isInstalled as isCalloutManagerInstalled,
} from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import { getAllCommands } from "./commands/allCommands";
import { logError, logInfo } from "./utils/logger";

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

  onload(): void {
    logInfo("Plugin loaded.");

    this.app.workspace.onLayoutReady(async () => {
      await this.maybeLoadCalloutManager();
      this.addAllCommands();
    });
  }

  private async maybeLoadCalloutManager(): Promise<void> {
    if (isCalloutManagerInstalled(this.app)) {
      const calloutManager = await getApi(this);
      if (calloutManager === undefined) {
        logError("Failed to get Callout Manager API handle.");
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
      logInfo("Callout Manager not available; using hardcoded list of callout IDs instead");
      return this.getBuiltinCalloutIDs();
    }
    return this.getAllCalloutIDsFromCalloutManager(this.calloutManager);
  }

  private getAllCalloutIDsFromCalloutManager(calloutManager: CalloutManager): readonly CalloutID[] {
    const allCallouts = calloutManager.getCallouts();
    const allCalloutIDs = allCallouts.map((callout) => callout.id);
    logInfo(`Got callout IDs from Callout Manager: ${allCalloutIDs.join(", ")}`);
    return allCalloutIDs;
  }

  private getBuiltinCalloutIDs(): readonly CalloutID[] {
    return BUILTIN_CALLOUT_IDS;
  }

  onunload(): void {
    logInfo("Plugin unloaded.");
  }
}
