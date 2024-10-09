import { CalloutID } from "obsidian-callout-manager";

/**
 * The ID of the plugin.
 *
 * NOTE: This should be kept in sync with the `id` in manifest.json.
 *
 * TODO: is there a way to add a test to ensure this is the case?
 */
const PLUGIN_ID = "callout-toggle-commands";

export function getFullWrapInCalloutCommandID(calloutID: CalloutID): string {
  const partialCommandID = getPartialWrapCalloutCommandID(calloutID);
  return getFullPluginCommandID(partialCommandID);
}

/**
 * Returns the command ID for wrapping the current line or selected lines in a callout.
 *
 * This is a partial command ID, so it should be combined with the plugin ID to form the full
 * command ID, e.g. when removing the command from the app.
 */
export function getPartialWrapCalloutCommandID(calloutID: CalloutID): string {
  return `wrap-current-line-or-selected-lines-in-${calloutID}-callout`;
}

export function getFullPluginCommandID(commandID: string): string {
  return `${PLUGIN_ID}:${commandID}`;
}
