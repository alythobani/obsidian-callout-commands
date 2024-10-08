import { Plugin } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import {
  CalloutManagerOwnedHandle,
  getAddedAndRemovedCalloutIDs,
  getAllCalloutIDsFromCalloutManager,
  getCalloutManagerAPIHandleIfInstalled,
} from "./callouts/calloutManager";
import {
  getAllCommands,
  getPartialWrapCalloutCommandID,
  makeWrapCalloutCommand,
} from "./commands/allCommands";
import { logInfo } from "./utils/logger";

/**
 * The ID of the plugin.
 *
 * NOTE: This should be kept in sync with the `id` in manifest.json.
 */
const PLUGIN_ID = "callout-toggle-commands";

export default class CalloutToggleCommandsPlugin extends Plugin {
  private calloutManager?: CalloutManagerOwnedHandle;
  private cachedCalloutIDs = new Set<CalloutID>();

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
    await this.loadCalloutManagerIfInstalled();
    this.addAllCommands();
  }

  /**
   * Loads the Callout Manager API if the user has installed the Callout Manager plugin.
   */
  private async loadCalloutManagerIfInstalled(): Promise<void> {
    const maybeAPIHandle = await getCalloutManagerAPIHandleIfInstalled(this);
    if (maybeAPIHandle === undefined) {
      return;
    }
    this.calloutManager = maybeAPIHandle;
    this.listenForCalloutManagerChanges(this.calloutManager);
  }

  private listenForCalloutManagerChanges(calloutManager: CalloutManagerOwnedHandle): void {
    calloutManager.on("change", () => {
      logInfo("Callout Manager change event received; refreshing commands.");
      this.refreshCommands(calloutManager);
    });
  }

  private refreshCommands(calloutManager: CalloutManagerOwnedHandle): void {
    const { addedCalloutIDs, removedCalloutIDs, newCalloutIDsSet } = getAddedAndRemovedCalloutIDs({
      calloutManager,
      oldCalloutIDs: this.cachedCalloutIDs,
    });
    this.removeCalloutWrapCommands(removedCalloutIDs);
    this.addCalloutWrapCommands(addedCalloutIDs);
    this.cachedCalloutIDs = newCalloutIDsSet;
  }

  private removeCalloutWrapCommands(calloutIDs: readonly CalloutID[]): void {
    for (const calloutID of calloutIDs) {
      logInfo(`Removing command for callout: ${calloutID}`);
      const pluginCommandID = getPluginWrapCalloutCommandID(calloutID);
      this.app.commands.removeCommand(pluginCommandID);
    }
  }

  private addCalloutWrapCommands(calloutIDs: readonly CalloutID[]): void {
    for (const calloutID of calloutIDs) {
      logInfo(`Adding command for callout: ${calloutID}`);
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
    this.cachedCalloutIDs = new Set(allCalloutIDs);
  }

  /**
   * Returns a list of all callout IDs that are available to be used in Obsidian. Uses the Callout
   * Manager API if the user has installed the Callout Manager plugin. Otherwise, returns a
   * hard-coded list of built-in callout IDs.
   */
  private getAllCalloutIDs(): readonly CalloutID[] {
    if (this.calloutManager === undefined) {
      return this.getBuiltinCalloutIDs();
    }
    return getAllCalloutIDsFromCalloutManager(this.calloutManager);
  }

  /**
   * Returns a hard-coded list of built-in callout IDs.
   */
  private getBuiltinCalloutIDs(): readonly CalloutID[] {
    return BUILTIN_CALLOUT_IDS;
  }

  onunload(): void {
    logInfo("Plugin unloaded.");
  }
}

function getPluginWrapCalloutCommandID(calloutID: CalloutID): string {
  const calloutCommandID = getPartialWrapCalloutCommandID(calloutID);
  const pluginCommandID = getPluginCommandID(calloutCommandID);
  return pluginCommandID;
}

function getPluginCommandID(commandID: string): string {
  return `${PLUGIN_ID}:${commandID}`;
}
