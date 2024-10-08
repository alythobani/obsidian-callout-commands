import { Plugin } from "obsidian";
import { CalloutID } from "obsidian-callout-manager";
import { filterOutElements } from "../utils/arrayUtils";
import { getFullWrapCalloutCommandID } from "./commandIDs";
import { removeCalloutFromSelectedLinesCommand } from "./removeCallout";
import { makeWrapInCalloutCommand } from "./wrapInCallout/wrapInCallout";

/**
 * Registers all commands in the plugin.
 */
export function addAllCommandsToPlugin({
  plugin,
  allCalloutIDs,
  onWrapInCalloutCommandAdded,
}: {
  plugin: Plugin;
  allCalloutIDs: readonly CalloutID[];
  onWrapInCalloutCommandAdded: (calloutID: CalloutID) => void;
}): void {
  addAllWrapInCalloutCommands({ plugin, allCalloutIDs, onWrapInCalloutCommandAdded });
  addRemoveCalloutCommand(plugin);
}

function addAllWrapInCalloutCommands({
  plugin,
  allCalloutIDs,
  onWrapInCalloutCommandAdded,
}: {
  plugin: Plugin;
  allCalloutIDs: readonly CalloutID[];
  onWrapInCalloutCommandAdded: (calloutID: CalloutID) => void;
}): void {
  allCalloutIDs.forEach((calloutID) =>
    addWrapInCalloutCommand({ plugin, calloutID, onWrapInCalloutCommandAdded })
  );
}

function addWrapInCalloutCommand({
  plugin,
  calloutID,
  onWrapInCalloutCommandAdded,
}: {
  plugin: Plugin;
  calloutID: CalloutID;
  onWrapInCalloutCommandAdded: (calloutID: CalloutID) => void;
}): void {
  const wrapInCalloutCommand = makeWrapInCalloutCommand(calloutID);
  plugin.addCommand(wrapInCalloutCommand);
  onWrapInCalloutCommandAdded(calloutID);
}

function addRemoveCalloutCommand(plugin: Plugin): void {
  plugin.addCommand(removeCalloutFromSelectedLinesCommand);
}

export function removeOutdatedWrapInCalloutCommandsFromPlugin({
  plugin,
  newCalloutIDs,
  previousCalloutIDs,
  onWrapInCalloutCommandRemoved,
}: {
  plugin: Plugin;
  newCalloutIDs: readonly CalloutID[];
  previousCalloutIDs: readonly CalloutID[];
  onWrapInCalloutCommandRemoved: (calloutID: CalloutID) => void;
}): void {
  const allCalloutIDsSet = new Set(newCalloutIDs);
  const outdatedCalloutIDs = filterOutElements(previousCalloutIDs, allCalloutIDsSet);
  outdatedCalloutIDs.forEach((calloutID) =>
    removeWrapInCalloutCommandFromPlugin({ plugin, calloutID, onWrapInCalloutCommandRemoved })
  );
}

function removeWrapInCalloutCommandFromPlugin({
  plugin,
  calloutID,
  onWrapInCalloutCommandRemoved,
}: {
  plugin: Plugin;
  calloutID: CalloutID;
  onWrapInCalloutCommandRemoved: (calloutID: CalloutID) => void;
}): void {
  const fullCommandID = getFullWrapCalloutCommandID(calloutID);
  plugin.app.commands.removeCommand(fullCommandID);
  onWrapInCalloutCommandRemoved(calloutID);
}
