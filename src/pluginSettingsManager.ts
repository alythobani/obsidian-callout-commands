import { Plugin, PluginSettingTab, Setting, ToggleComponent } from "obsidian";
import { REMOVE_CALLOUT_FROM_SELECTED_LINES_COMMAND } from "./commands/removeCallout";

type DefaultFoldableState = "unfoldable" | "foldable-expanded" | "foldable-collapsed";
type CalloutIDCapitalization = "lower" | "upper" | "sentence" | "title";

export interface PluginSettings {
  shouldSetSelectionAfterCurrentLineWrap: boolean;
  defaultFoldableState: DefaultFoldableState;
  calloutIDCapitalization: CalloutIDCapitalization;
}

type SettingKey = keyof PluginSettings;

const DEFAULT_SETTINGS: PluginSettings = {
  shouldSetSelectionAfterCurrentLineWrap: false,
  defaultFoldableState: "unfoldable",
  calloutIDCapitalization: "lower",
};

export class PluginSettingsManager extends PluginSettingTab {
  private settings: PluginSettings;

  constructor(private plugin: Plugin) {
    super(plugin.app, plugin);
    this.settings = Object.assign({}, DEFAULT_SETTINGS);
  }

  public async setupSettingsTab(): Promise<void> {
    this.settings = await this.loadSettings();
    this.addSettingTab();
  }

  private async loadSettings(): Promise<PluginSettings> {
    const loadedSettings = (await this.plugin.loadData()) as PluginSettings;
    return Object.assign({}, DEFAULT_SETTINGS, loadedSettings);
  }

  private addSettingTab(): void {
    this.plugin.addSettingTab(this);
  }

  public getSetting<K extends SettingKey>(settingKey: K): PluginSettings[K] {
    return this.settings[settingKey];
  }

  private async setSetting<K extends SettingKey>(
    settingKey: K,
    value: PluginSettings[K]
  ): Promise<void> {
    this.settings[settingKey] = value;
    await this.saveSettings();
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    this.displaySelectTextAfterInsertingCalloutSetting();
    this.displayDefaultFoldableStateSetting();
    this.displayCalloutIDCapitalizationSetting();
  }

  private displaySelectTextAfterInsertingCalloutSetting(): void {
    new Setting(this.containerEl)
      .setName("Select text after inserting callout")
      .setDesc(
        "Whether to select a callout's text after insertion, even if no text was selected before." +
          " This can be useful if you want to be able to run" +
          ` '${REMOVE_CALLOUT_FROM_SELECTED_LINES_COMMAND.name}' immediately afterwards.`
      )
      .addToggle(this.setupSetSelectionToggle.bind(this));
  }

  private displayDefaultFoldableStateSetting(): void {
    new Setting(this.containerEl)
      .setName("Foldable callouts")
      .setDesc(
        "The default foldable/folded state for inserted callouts: unfoldable, expanded, or collapsed."
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOption("unfoldable", "Unfoldable")
          .addOption("foldable-expanded", "Foldable, expanded")
          .addOption("foldable-collapsed", "Foldable, collapsed")
          .setValue(this.settings.defaultFoldableState)
          .onChange((value) =>
            this.setSetting("defaultFoldableState", value as DefaultFoldableState)
          )
      );
  }

  private displayCalloutIDCapitalizationSetting(): void {
    new Setting(this.containerEl)
      .setName("Callout ID capitalization")
      .setDesc(
        "The default capitalization for inserted callout IDs (e.g. `> [!quote]` vs `> [!QUOTE]`)."
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOption("lower", "lower-case")
          .addOption("upper", "UPPER-CASE")
          .addOption("sentence", "Sentence-case")
          .addOption("title", "Title-Case")
          .setValue(this.settings.calloutIDCapitalization)
          .onChange((value) =>
            this.setSetting("calloutIDCapitalization", value as CalloutIDCapitalization)
          )
      );
  }

  private setupSetSelectionToggle(toggle: ToggleComponent): ToggleComponent {
    toggle = toggle.setValue(this.settings.shouldSetSelectionAfterCurrentLineWrap);
    toggle = toggle.onChange(this.setSetting.bind(this, "shouldSetSelectionAfterCurrentLineWrap"));
    return toggle;
  }

  private async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }
}
