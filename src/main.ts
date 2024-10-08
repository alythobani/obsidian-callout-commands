import { Plugin } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import {
  CalloutManagerOwnedHandle,
  getAllCalloutIDsFromCalloutManager,
  loadAndWatchCalloutManagerIfInstalled,
} from "./callouts/calloutManager";
import {
  makeWrapInCalloutCommand,
  removeCalloutFromSelectedLinesCommand,
} from "./commands/allCommands";
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
    await loadAndWatchCalloutManagerIfInstalled({
      plugin: this,
      onAPIHandleGet: this.setCalloutManagerHandle.bind(this),
      onMaybeCalloutsChange: this.onMaybeCalloutsChange.bind(this),
    });
    this.addAllCommands();
  }

  public setCalloutManagerHandle(calloutManager: CalloutManagerOwnedHandle): void {
    this.calloutManager = calloutManager;
  }

  private onMaybeCalloutsChange(allCalloutIDs: readonly CalloutID[]): void {
    this.removeOutdatedCalloutWrapCommands(allCalloutIDs);
    this.addMissingWrapInCalloutCommands(allCalloutIDs);
  }

  private removeOutdatedCalloutWrapCommands(allCalloutIDs: readonly CalloutID[]): void {
    const allCalloutIDsSet = new Set(allCalloutIDs);
    const outdatedCalloutIDs = [...this.addedCalloutIDs].filter((id) => !allCalloutIDsSet.has(id));
    outdatedCalloutIDs.forEach(this.removeWrapInCalloutCommand.bind(this));
  }

  private removeWrapInCalloutCommand(calloutID: CalloutID): void {
    const fullCommandID = getFullWrapCalloutCommandID(calloutID);
    this.app.commands.removeCommand(fullCommandID);
    this.addedCalloutIDs.delete(calloutID);
  }

  private addMissingWrapInCalloutCommands(allCalloutIDs: readonly CalloutID[]): void {
    const missingCalloutIDs = allCalloutIDs.filter((id) => !this.addedCalloutIDs.has(id));
    missingCalloutIDs.forEach(this.addWrapInCalloutCommand.bind(this));
  }

  /**
   * Registers all commands.
   */
  private addAllCommands(): void {
    this.addAllWrapInCalloutCommands();
    this.addRemoveCalloutCommand();
  }

  private addAllWrapInCalloutCommands(): void {
    const allCalloutIDs = this.getAllCalloutIDs();
    allCalloutIDs.forEach(this.addWrapInCalloutCommand.bind(this));
  }

  private addWrapInCalloutCommand(calloutID: CalloutID): void {
    const wrapCommand = makeWrapInCalloutCommand(calloutID);
    this.addCommand(wrapCommand);
    this.addedCalloutIDs.add(calloutID);
  }

  private addRemoveCalloutCommand(): void {
    this.addCommand(removeCalloutFromSelectedLinesCommand);
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
