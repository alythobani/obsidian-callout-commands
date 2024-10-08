import { Plugin } from "obsidian";
import {
  CalloutID,
  CalloutManager,
  getApi,
  isInstalled as isCalloutManagerInstalled,
} from "obsidian-callout-manager";

export type CalloutManagerOwnedHandle = CalloutManager<true>;

/**
 * Loads a Callout Manager API handle if the Callout Manager plugin is installed, and watches for
 * changes to the callouts.
 *
 * @param plugin The plugin instance (for tying to the API handle).
 * @param onAPIHandleGet The callback to call when the API handle is loaded.
 * @param onMaybeCalloutsChange The callback to call on "change" events which could involve added/removed callouts.
 */
export async function loadPluginHandleAndWatchAPIIfInstalled({
  plugin,
  onAPIHandleGet,
  onMaybeCalloutsChange,
}: {
  plugin: Plugin;
  onAPIHandleGet: (calloutManager: CalloutManagerOwnedHandle) => void;
  onMaybeCalloutsChange: (newCalloutIDs: readonly CalloutID[]) => void;
}): Promise<void> {
  const maybeAPIHandle = await getCalloutManagerAPIHandleIfInstalled(plugin);
  if (maybeAPIHandle === undefined) {
    return;
  }
  onAPIHandleGet(maybeAPIHandle);
  maybeAPIHandle.on("change", () => {
    const allCalloutIDs = getAllCalloutIDsFromCalloutManager(maybeAPIHandle);
    onMaybeCalloutsChange(allCalloutIDs);
  });
}

async function getCalloutManagerAPIHandleIfInstalled(
  plugin: Plugin
): Promise<CalloutManagerOwnedHandle | undefined> {
  if (!isCalloutManagerInstalled(plugin.app)) {
    return undefined;
  }
  return getApi(plugin);
}

export function getAllCalloutIDsFromCalloutManager(
  calloutManager: CalloutManagerOwnedHandle
): readonly CalloutID[] {
  const allCallouts = calloutManager.getCallouts();
  const allCalloutIDs = allCallouts.map((callout) => callout.id);
  return allCalloutIDs;
}
