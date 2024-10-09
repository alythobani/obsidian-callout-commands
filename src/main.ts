import { Plugin } from "obsidian";
import { PluginCommandManager } from "./pluginCommandManager";
import { logInfo } from "./utils/logger";

export default class CalloutToggleCommandsPlugin extends Plugin {
  private pluginCommandManager = new PluginCommandManager(this);

  onload(): void {
    logInfo("Plugin loaded.");
    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  /**
   * Plugin setup. It's recommended to put setup code here in `onLayoutReady` over `onload` when
   * possible, for better Obsidian loading performance. See Obsidian docs:
   * https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time
   */
  private async onLayoutReady(): Promise<void> {
    await this.pluginCommandManager.setupCommands();
  }

  onunload(): void {
    logInfo("Plugin unloaded.");
  }
}
