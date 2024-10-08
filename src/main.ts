import { Plugin } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import {
  CalloutManagerOwnedHandle,
  getAllCalloutIDsFromCalloutManager,
  loadPluginHandleAndWatchAPIIfInstalled,
} from "./callouts/calloutManager";
import {
  addAllCommandsToPlugin,
  removeOutdatedWrapInCalloutCommandsFromPlugin,
} from "./commands/allCommands";
import { makeWrapInCalloutCommand } from "./commands/wrapInCallout/wrapInCallout";
import { logInfo } from "./utils/logger";

export default class CalloutToggleCommandsPlugin extends Plugin {
  private calloutManager?: CalloutManagerOwnedHandle;
  private readonly addedCalloutIDs = new Set<CalloutID>(); // Used for syncing commands with Callout Manager callout changes

  onload(): void {
    logInfo("Plugin loaded.");
    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  /**
   * Loads the Callout Manager API if the Callout Manager plugin is installed, and then adds all
   * commands to the plugin.
   *
   * It's recommended to put plugin setup code here in `onLayoutReady` over `onload` when possible,
   * for better Obsidian performance. See Obsidian docs:
   * https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time
   */
  private async onLayoutReady(): Promise<void> {
    await this.loadAndWatchCalloutManagerAPIIfInstalled();
    this.addAllCommands();
  }

  private async loadAndWatchCalloutManagerAPIIfInstalled(): Promise<void> {
    await loadPluginHandleAndWatchAPIIfInstalled({
      plugin: this,
      onAPIHandleGet: this.setCalloutManagerHandle.bind(this),
      onMaybeCalloutsChange: this.onMaybeCalloutsChange.bind(this),
    });
  }

  private addAllCommands(): void {
    addAllCommandsToPlugin({
      plugin: this,
      allCalloutIDs: this.getAllCalloutIDs(),
      onWrapInCalloutCommandAdded: (calloutId) => this.addedCalloutIDs.add(calloutId),
    });
  }

  public setCalloutManagerHandle(calloutManager: CalloutManagerOwnedHandle): void {
    this.calloutManager = calloutManager;
  }

  private onMaybeCalloutsChange(newCalloutIDs: readonly CalloutID[]): void {
    this.removeOutdatedCalloutWrapCommands(newCalloutIDs);
    this.addMissingWrapInCalloutCommands(newCalloutIDs);
  }

  private removeOutdatedCalloutWrapCommands(newCalloutIDs: readonly CalloutID[]): void {
    const previousCalloutIDs = [...this.addedCalloutIDs];
    removeOutdatedWrapInCalloutCommandsFromPlugin({
      plugin: this,
      newCalloutIDs,
      previousCalloutIDs,
      onWrapInCalloutCommandRemoved: (calloutId) => this.addedCalloutIDs.delete(calloutId),
    });
  }

  private addMissingWrapInCalloutCommands(allCalloutIDs: readonly CalloutID[]): void {
    const missingCalloutIDs = allCalloutIDs.filter((id) => !this.addedCalloutIDs.has(id));
    missingCalloutIDs.forEach(this.addWrapInCalloutCommand.bind(this));
  }

  private addWrapInCalloutCommand(calloutID: CalloutID): void {
    const wrapCommand = makeWrapInCalloutCommand(calloutID);
    this.addCommand(wrapCommand);
    this.addedCalloutIDs.add(calloutID);
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
