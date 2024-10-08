import { Plugin } from "obsidian";
import { CalloutID, CalloutManager } from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import {
  getAllCalloutIDsFromCalloutManager,
  getCalloutManagerAPIHandleIfInstalled,
} from "./callouts/calloutManager";
import { getAllCommands } from "./commands/allCommands";
import { logInfo } from "./utils/logger";

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
    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  /**
   * This function is called when the layout is ready.
   *
   * It's recommended to put plugin setup code here instead of the `onload` function, for better
   * performance. See Obsidian docs:
   * https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time
   */
  private async onLayoutReady(): Promise<void> {
    await this.maybeLoadCalloutManager();
    this.addAllCommands();
  }

  private async maybeLoadCalloutManager(): Promise<void> {
    const maybeAPIHandle = await getCalloutManagerAPIHandleIfInstalled(this);
    if (maybeAPIHandle === undefined) {
      return;
    }
    this.calloutManager = maybeAPIHandle;
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
      return this.getBuiltinCalloutIDs();
    }
    return getAllCalloutIDsFromCalloutManager(this.calloutManager);
  }

  private getBuiltinCalloutIDs(): readonly CalloutID[] {
    return BUILTIN_CALLOUT_IDS;
  }

  onunload(): void {
    logInfo("Plugin unloaded.");
  }
}
