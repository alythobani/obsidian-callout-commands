import { Plugin } from "obsidian";
import { PluginCommandManager } from "./pluginCommandManager";
import { PluginSettingsManager } from "./pluginSettingsManager";
import { logInfo } from "./utils/logger";

export default class CalloutToggleCommandsPlugin extends Plugin {
  public pluginSettingsManager = new PluginSettingsManager(this);
  private pluginCommandManager = new PluginCommandManager(this, this.pluginSettingsManager);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onload(): Promise<void> {
    logInfo("Plugin loaded.");

    await this.pluginSettingsManager.setupSettingsTab();

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  /**
   * It's recommended to put setup code here in `onLayoutReady` over `onload` when possible, for
   * better Obsidian loading performance. See Obsidian docs:
   * https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time
   */
  private async onLayoutReady(): Promise<void> {
    await this.pluginCommandManager.setupCommands();
  }

  onunload(): void {
    logInfo("Plugin unloaded.");
  }
}
