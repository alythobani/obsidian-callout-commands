import { Plugin } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import {
  CalloutManagerOwnedHandle,
  getAddedAndRemovedCalloutIDs,
  getAllCalloutIDsFromCalloutManager,
  getCalloutManagerAPIHandleIfInstalled,
} from "./callouts/calloutManager";
import { getAllCommands, makeWrapCalloutCommand } from "./commands/allCommands";
import { getFullWrapCalloutCommandID } from "./commands/commandIDs";
import { logInfo } from "./utils/logger";

export default class CalloutToggleCommandsPlugin extends Plugin {
  private calloutManager?: CalloutManagerOwnedHandle;
  private addedCalloutIDs = new Set<CalloutID>(); // Used for syncing commands with Callout Manager callout changes

  onload(): void {
    logInfo("Plugin loaded.");
    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  /**
   * This function is called when the layout is ready.
   *
   * It's recommended to put plugin setup code here when possible instead of the `onload` function,
   * for better performance. See Obsidian docs:
   * https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time
   */
  private async onLayoutReady(): Promise<void> {
    await this.loadAndWatchCalloutManagerIfInstalled();
    this.addAllCommands();
  }

  /**
   * Loads (and watches) the Callout Manager API if the user has installed the Callout Manager plugin.
   */
  private async loadAndWatchCalloutManagerIfInstalled(): Promise<void> {
    const maybeAPIHandle = await getCalloutManagerAPIHandleIfInstalled(this);
    if (maybeAPIHandle === undefined) {
      return;
    }
    this.calloutManager = maybeAPIHandle;
    this.listenForCalloutManagerChanges(this.calloutManager);
  }

  /**
   * Listens for the Callout Manager's "change" event, refreshing the callout wrap commands when
   * it fires.
   */
  private listenForCalloutManagerChanges(calloutManager: CalloutManagerOwnedHandle): void {
    calloutManager.on("change", this.refreshCalloutWrapCommands.bind(this, calloutManager));
  }

  /**
   * Refreshes/syncs the callout wrap commands based on the new set of callout IDs from the Callout
   * Manager API. Removes wrap commands for callouts that were removed and adds wrap commands for
   * callouts that were added.
   */
  private refreshCalloutWrapCommands(calloutManager: CalloutManagerOwnedHandle): void {
    const { addedCalloutIDs, removedCalloutIDs, newCalloutIDsSet } = getAddedAndRemovedCalloutIDs({
      calloutManager,
      oldCalloutIDs: this.addedCalloutIDs,
    });
    this.removeCalloutWrapCommands(removedCalloutIDs);
    this.addCalloutWrapCommands(addedCalloutIDs);
    this.addedCalloutIDs = newCalloutIDsSet;
  }

  private removeCalloutWrapCommands(calloutIDs: readonly CalloutID[]): void {
    for (const calloutID of calloutIDs) {
      const fullCommandID = getFullWrapCalloutCommandID(calloutID);
      this.app.commands.removeCommand(fullCommandID);
    }
  }

  private addCalloutWrapCommands(calloutIDs: readonly CalloutID[]): void {
    for (const calloutID of calloutIDs) {
      const command = makeWrapCalloutCommand(calloutID);
      this.addCommand(command);
    }
  }

  /**
   * Registers all commands.
   */
  private addAllCommands(): void {
    const allCalloutIDs = this.getAllCalloutIDs();
    const allCommands = getAllCommands(allCalloutIDs);
    for (const command of allCommands) {
      this.addCommand(command);
    }
    this.addedCalloutIDs = new Set(allCalloutIDs);
  }

  /**
   * Returns a list of all callout IDs that are available to be used in Obsidian. Uses the Callout
   * Manager API if the user has installed the Callout Manager plugin. Otherwise, returns a
   * hard-coded list of built-in callout IDs.
   */
  private getAllCalloutIDs(): readonly CalloutID[] {
    if (this.calloutManager === undefined) {
      return BUILTIN_CALLOUT_IDS;
    }
    return getAllCalloutIDsFromCalloutManager(this.calloutManager);
  }

  onunload(): void {
    logInfo("Plugin unloaded.");
  }
}
