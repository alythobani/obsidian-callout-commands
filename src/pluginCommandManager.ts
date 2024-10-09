import { Command, Plugin } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { BUILTIN_CALLOUT_IDS } from "./callouts/builtinCallouts";
import {
  CalloutManagerOwnedHandle,
  getCalloutIDsFromCalloutManager,
  getCalloutManagerAPIHandleIfInstalled,
} from "./callouts/calloutManager";
import { getFullWrapInCalloutCommandID } from "./commands/commandIDs";
import { removeCalloutFromSelectedLinesCommand } from "./commands/removeCallout";
import { makeWrapInCalloutCommand } from "./commands/wrapInCallout/wrapInCallout";
import { filterOutElements } from "./utils/arrayUtils";

export class PluginCommandManager {
  calloutManager?: CalloutManagerOwnedHandle;
  addedCommandCalloutIDsSet = new Set<CalloutID>();

  constructor(public plugin: Plugin) {}

  public async setupCommands(): Promise<void> {
    await this.setupCalloutManagerIfInstalled();
    this.addAllCommands();
  }

  private async setupCalloutManagerIfInstalled(): Promise<void> {
    const maybeAPIHandle = await getCalloutManagerAPIHandleIfInstalled(this.plugin);
    if (maybeAPIHandle === undefined) {
      return;
    }
    this.calloutManager = maybeAPIHandle;
    this.calloutManager.on("change", () => this.resyncCalloutCommands());
  }

  private resyncCalloutCommands(): void {
    const allCalloutIDs = this.getAllCalloutIDs();
    this.removeOutdatedCalloutCommands(allCalloutIDs);
    this.addMissingCalloutCommands(allCalloutIDs);
  }

  /**
   * Returns all available Obsidian callout IDs. Uses the Callout Manager plugin API if available;
   * otherwise uses a hard-coded list of built-in callout IDs.
   */
  private getAllCalloutIDs(): readonly CalloutID[] {
    if (this.calloutManager === undefined) {
      return BUILTIN_CALLOUT_IDS;
    }
    return getCalloutIDsFromCalloutManager(this.calloutManager);
  }

  private removeOutdatedCalloutCommands(newCalloutIDs: readonly CalloutID[]): void {
    const existingCommandCalloutIDs = Array.from(this.addedCommandCalloutIDsSet);
    const newCalloutIDsSet = new Set(newCalloutIDs);
    const outdatedCalloutIDs = filterOutElements(existingCommandCalloutIDs, newCalloutIDsSet);
    outdatedCalloutIDs.forEach((calloutID) => this.removeWrapInCalloutCommand(calloutID));
  }

  private removeWrapInCalloutCommand(calloutID: CalloutID): void {
    const fullCommandID = getFullWrapInCalloutCommandID(calloutID);
    this.removeCommand({ fullCommandID });
    this.addedCommandCalloutIDsSet.delete(calloutID);
  }

  private addMissingCalloutCommands(newCalloutIDs: readonly CalloutID[]): void {
    const missingCalloutIDs = filterOutElements(newCalloutIDs, this.addedCommandCalloutIDsSet);
    missingCalloutIDs.forEach((calloutID) => this.addWrapInCalloutCommand(calloutID));
  }

  private addAllCommands(): void {
    this.addAllWrapInCalloutCommands();
    this.addCommand(removeCalloutFromSelectedLinesCommand);
  }

  private addAllWrapInCalloutCommands(): void {
    const allCalloutIDs = this.getAllCalloutIDs();
    allCalloutIDs.forEach((calloutID) => this.addWrapInCalloutCommand(calloutID));
  }

  private addWrapInCalloutCommand(calloutID: CalloutID): void {
    const wrapInCalloutCommand = makeWrapInCalloutCommand(calloutID);
    this.addCommand(wrapInCalloutCommand);
    this.addedCommandCalloutIDsSet.add(calloutID);
  }

  private addCommand(command: Command): void {
    this.plugin.addCommand(command);
  }

  private removeCommand({ fullCommandID }: { fullCommandID: string }): void {
    this.plugin.app.commands.removeCommand(fullCommandID);
  }
}
