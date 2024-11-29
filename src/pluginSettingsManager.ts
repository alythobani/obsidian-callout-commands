import { Plugin, PluginSettingTab, Setting, ToggleComponent } from "obsidian";

type DefaultFoldableState = "unfoldable" | "foldable-expanded" | "foldable-collapsed";
type CalloutIDCapitalization = "lower" | "upper" | "sentence" | "title";

export interface PluginSettings {
  shouldUseExplicitTitle: boolean;
  calloutIDCapitalization: CalloutIDCapitalization;
  defaultFoldableState: DefaultFoldableState;
  shouldSetSelectionAfterCurrentLineWrap: boolean;
}

type SettingKey = keyof PluginSettings;

const DEFAULT_SETTINGS: PluginSettings = {
  shouldUseExplicitTitle: true,
  calloutIDCapitalization: "lower",
  defaultFoldableState: "unfoldable",
  shouldSetSelectionAfterCurrentLineWrap: false,
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

    this.displayExplicitCalloutTitlesSetting();
    this.displayCalloutIDCapitalizationSetting();
    this.displayDefaultFoldableStateSetting();
    this.displaySelectTextAfterInsertingCalloutSetting();
  }

  private displayExplicitCalloutTitlesSetting(): void {
    new Setting(this.containerEl)
      .setName("Explicit callout titles")
      .setDesc(
        "Whether inserted callouts should have an explicit or implicit title by default. E.g. `> [!quote] Quote` vs `> [!quote]`."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.settings.shouldUseExplicitTitle)
          .onChange((value) => this.setSetting("shouldUseExplicitTitle", value))
      );
  }

  private displayCalloutIDCapitalizationSetting(): void {
    new Setting(this.containerEl)
      .setName("Callout ID capitalization")
      .setDesc(
        "The default capitalization for inserted callout IDs. E.g. `> [!quote]` vs `> [!QUOTE]`."
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

  private displayDefaultFoldableStateSetting(): void {
    new Setting(this.containerEl)
      .setName("Foldable callouts")
      .setDesc(
        "The default folded state for inserted callouts: unfoldable, expanded, or collapsed. E.g. `> [!quote]` vs `> [!quote]+` vs `> [!quote]-`."
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

  private displaySelectTextAfterInsertingCalloutSetting(): void {
    new Setting(this.containerEl)
      .setName("Select text after inserting callout")
      .setDesc(
        "Whether to auto-select text, after inserting a callout with no text selected. " +
          "Leave disabled if you'd prefer to be able to keep typing content after inserting/wrapping."
      )
      .addToggle(this.setupSetSelectionToggle.bind(this));
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
