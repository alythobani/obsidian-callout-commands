import { Setting } from "obsidian";

export type TypedDropdownOption<ValidOption> = {
  value: ValidOption;
  displayText: string;
};

/**
 * More precisely-typed Obsidian API helper function for creating a dropdown setting. Typing helps
 * ensure that the dropdown options provided are valid for the given setting.
 */
export function createTypedDropdownSetting<ValidOption extends string>({
  containerEl,
  settingName,
  settingDescription,
  dropdownOptions,
  currentValue,
  onChange,
}: {
  containerEl: HTMLElement;
  settingName: string;
  settingDescription: string;
  dropdownOptions: readonly TypedDropdownOption<ValidOption>[];
  currentValue: ValidOption;
  onChange: (newValue: ValidOption) => void | Promise<void>;
}): void {
  const isValidOption = (value: string): value is ValidOption =>
    dropdownOptions.some((option) => option.value === value);
  new Setting(containerEl)
    .setName(settingName)
    .setDesc(settingDescription)
    .addDropdown((dropdown) => {
      for (const { value, displayText } of dropdownOptions) {
        dropdown.addOption(value, displayText);
      }
      dropdown.setValue(currentValue);
      dropdown.onChange((value) => {
        if (!isValidOption(value)) {
          throw new Error(`Invalid dropdown value: ${value}`);
        }
        return onChange(value);
      });
    });
}
