/**
 * This file was manually copied from the Callout Manager package (for some reason, the package's
 * types file isn't being recognized by TypeScript). I made a PR there in case the package author
 * thinks it's a good fix: https://github.com/eth-p/obsidian-callout-manager/pull/27
 *
 * In the meantime, this is a workaround. The original file can be found in node_modules at:
 * node_modules/obsidian-callout-manager/dist/api.d.ts
 *
 */

declare module "obsidian-callout-manager" {
  import { type App, type Plugin, type RGB } from "obsidian";

  /**
   * A type representing the ID of a callout.
   */
  declare type CalloutID = string;
  /**
   * A description of a markdown callout.
   */
  declare type Callout = CalloutProperties & {
    /**
     * The list of known sources for the callout.
     * A source is a stylesheet that provides styles for a callout with this ID.
     */
    sources: CalloutSource[];
  };
  type CalloutProperties = {
    /**
     * The ID of the callout.
     * This is the part that goes in the callout header.
     */
    id: CalloutID;
    /**
     * The current color of the callout.
     */
    color: string;
    /**
     * The icon associated with the callout.
     */
    icon: string;
  };
  /**
   * The source of a callout.
   * This is what declares the style information for the callout with the given ID.
   */
  declare type CalloutSource =
    | CalloutSourceObsidian
    | CalloutSourceSnippet
    | CalloutSourceTheme
    | CalloutSourceCustom;
  /**
   * The callout is a built-in Obsidian callout.
   */
  type CalloutSourceObsidian = {
    type: "builtin";
  };
  /**
   * The callout is from a snippet.
   */
  type CalloutSourceSnippet = {
    type: "snippet";
    snippet: string;
  };
  /**
   * The callout is from a theme.
   */
  type CalloutSourceTheme = {
    type: "theme";
    theme: string;
  };
  /**
   * The callout was added by the user.
   */
  type CalloutSourceCustom = {
    type: "custom";
  };

  type CalloutManagerEventMap = {
    /**
     * Called whenever one or more callouts have changed.
     */
    change(): void;
  };
  /**
   * A Callout Manager event that can be listened for.
   */
  declare type CalloutManagerEvent = keyof CalloutManagerEventMap;
  /**
   * A type which maps event names to their associated listener functions.
   */
  declare type CalloutManagerEventListener<Event extends CalloutManagerEvent> =
    CalloutManagerEventMap[Event];

  /**
   * A handle for the Callout Manager API.
   */
  declare type CalloutManager<WithPluginReference extends boolean = false> =
    WithPluginReference extends true ? CalloutManagerOwnedHandle : CalloutManagerUnownedHandle;
  /**
   * An unowned handle for the Callout Manager API.
   */
  type CalloutManagerUnownedHandle = {
    /**
     * Gets the list of available callouts.
     */
    getCallouts(): readonly Callout[];
    /**
     * Tries to parse the color of a {@link Callout callout} into an Obsidian {@link RGB} object.
     * If the color is not a valid callout color, you can access the invalid color string through the `invalid` property.
     *
     * @param callout The callout.
     */
    getColor(callout: Callout):
      | RGB
      | {
          invalid: string;
        };
    /**
     * Gets the title text of a {@link Callout callout}.
     *
     * @param callout The callout.
     */
    getTitle(callout: Callout): string;
  };
  /**
   * An owned handle for the Callout Manager API.
   */
  type CalloutManagerOwnedHandle = {
    /**
     * Registers an event listener.
     * If Callout Manager or the handle owner plugin are unloaded, all events will be unregistered automatically.
     *
     * @param event The event to listen for.
     * @param listener The listener function.
     */
    on<E extends CalloutManagerEvent>(event: E, listener: CalloutManagerEventListener<E>): void;
    /**
     * Unregisters an event listener.
     *
     * In order to unregister a listener successfully, the exact reference of the listener function provided to
     * {@link on} must be provided as the listener parameter to this function.
     *
     * @param event The event which the listener was bound to.
     * @param listener The listener function to unregister.
     */
    off<E extends CalloutManagerEvent>(event: E, listener: CalloutManagerEventListener<E>): void;
  } & CalloutManagerUnownedHandle;

  declare const PLUGIN_ID = "callout-manager";
  declare const PLUGIN_API_VERSION = "v1";
  /**
   * Gets an owned handle to the Callout Manager plugin API.
   * The provided plugin will be used as the owner.
   */
  declare function getApi(plugin: Plugin): Promise<CalloutManager<true> | undefined>;
  /**
   * Gets an unowned handle to the Callout Manager plugin API.
   * This handle cannot be used to register events.
   */
  declare function getApi(): Promise<CalloutManager | undefined>;
  /**
   * Checks if Callout Manager is installed.
   */
  declare function isInstalled(app?: App): boolean;

  export {
    Callout,
    CalloutID,
    CalloutManager,
    CalloutManagerEvent,
    CalloutManagerEventListener,
    CalloutProperties,
    CalloutSource,
    CalloutSourceCustom,
    CalloutSourceObsidian,
    CalloutSourceSnippet,
    CalloutSourceTheme,
    getApi,
    isInstalled,
    PLUGIN_API_VERSION,
    PLUGIN_ID,
  };
}
