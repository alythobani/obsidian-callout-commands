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

/**
 * Gets the callout IDs that were added/removed in the new set of callout IDs returned by the
 * Callout Manager API compared to the old set of callout IDs.
 */
export function getAddedAndRemovedCalloutIDs({
  calloutManager,
  oldCalloutIDs,
}: {
  calloutManager: CalloutManagerOwnedHandle;
  oldCalloutIDs: Set<CalloutID>;
}): {
  newCalloutIDsSet: Set<CalloutID>;
  addedCalloutIDs: CalloutID[];
  removedCalloutIDs: CalloutID[];
} {
  const newCalloutIDs = getAllCalloutIDsFromCalloutManager(calloutManager);
  const newCalloutIDsSet = new Set(newCalloutIDs);
  const addedCalloutIDs = newCalloutIDs.filter((id) => !oldCalloutIDs.has(id));
  const removedCalloutIDs = Array.from(oldCalloutIDs).filter((id) => !newCalloutIDsSet.has(id));
  return { addedCalloutIDs, removedCalloutIDs, newCalloutIDsSet };
}
