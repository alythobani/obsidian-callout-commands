import { Plugin } from "obsidian";
import {
  CalloutID,
  CalloutManager,
  getApi,
  isInstalled as isCalloutManagerInstalled,
} from "obsidian-callout-manager";
import { logInfo } from "../utils/logger";

export type CalloutManagerOwnedHandle = CalloutManager<true>;

export async function getCalloutManagerAPIHandleIfInstalled(
  plugin: Plugin
): Promise<CalloutManagerOwnedHandle | undefined> {
  if (!isCalloutManagerInstalled(plugin.app)) {
    return undefined;
  }
  return getApi(plugin);
}

export function getAllCalloutIDsFromCalloutManager(
  calloutManager: CalloutManager
): readonly CalloutID[] {
  const allCallouts = calloutManager.getCallouts();
  const allCalloutIDs = allCallouts.map((callout) => callout.id);
  logInfo(`Got callout IDs from Callout Manager: ${allCalloutIDs.join(", ")}`);
  return allCalloutIDs;
}
