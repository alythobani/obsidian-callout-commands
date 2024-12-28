import { type TypedDropdownOption } from "./typedSettingsHelpers";

export const whenNothingSelectedAutoSelectionOptions: readonly TypedDropdownOption<AutoSelectionWhenNothingSelectedMode>[] =
  [
    { value: "selectHeaderToCursor", displayText: "Select from header to cursor" },
    { value: "selectFull", displayText: "Select full callout" },
    { value: "selectTitle", displayText: "Select callout title" },
    { value: "originalCursor", displayText: "Keep relative cursor position" },
    { value: "cursorEnd", displayText: "Move cursor to end" },
  ];

export const whenTextSelectedAutoSelectionOptions: readonly TypedDropdownOption<AutoSelectionWhenTextSelectedMode>[] =
  [
    { value: "selectHeaderToCursor", displayText: "Select from header to cursor" },
    { value: "selectFull", displayText: "Select full callout" },
    { value: "selectTitle", displayText: "Select callout title" },
    { value: "originalSelection", displayText: "Keep relative selection" },
    { value: "clearSelectionCursorEnd", displayText: "Clear selection, move cursor to end" },
  ];

export const afterRemovingCalloutAutoSelectionOptions: readonly TypedDropdownOption<AutoSelectionAfterRemovingCalloutModes>[] =
  [
    { value: "originalSelection", displayText: "Keep relative selection" },
    { value: "selectFull", displayText: "Select full remaining lines" },
    { value: "clearSelectionCursorTo", displayText: "Clear selection" },
    { value: "clearSelectionCursorStart", displayText: "Clear selection, move cursor to start" },
    { value: "clearSelectionCursorEnd", displayText: "Clear selection, move cursor to end" },
  ];

export type AutoSelectionWhenNothingSelectedMode =
  | "selectHeaderToCursor"
  | "selectFull"
  | "selectTitle"
  | "originalCursor"
  | "cursorEnd";

export type AutoSelectionWhenTextSelectedMode =
  | "selectHeaderToCursor"
  | "selectFull"
  | "selectTitle"
  | "originalSelection"
  | "clearSelectionCursorEnd";

export type AutoSelectionAfterRemovingCalloutModes =
  | "originalSelection"
  | "selectFull"
  | "clearSelectionCursorTo"
  | "clearSelectionCursorStart"
  | "clearSelectionCursorEnd";

export type AutoSelectionModes = {
  /** Cursor/selection behavior after wrapping with no text selected. */
  whenNothingSelected: AutoSelectionWhenNothingSelectedMode;
  /** Cursor/selection behavior after wrapping a selection. */
  whenTextSelected: AutoSelectionWhenTextSelectedMode;
  /** Cursor/selection behavior after removing a callout. */
  afterRemovingCallout: AutoSelectionAfterRemovingCalloutModes;
};

export const DEFAULT_AUTO_SELECTION_MODES: AutoSelectionModes = {
  whenNothingSelected: "originalCursor",
  whenTextSelected: "selectFull",
  afterRemovingCallout: "selectFull",
};

export function migrateV1SettingToV2AutoSelectionModes({
  shouldSetSelectionAfterCurrentLineWrap,
}: {
  shouldSetSelectionAfterCurrentLineWrap: boolean;
}): AutoSelectionModes {
  const whenNothingSelected = shouldSetSelectionAfterCurrentLineWrap
    ? "selectFull"
    : "originalCursor";
  const { whenTextSelected, afterRemovingCallout } = DEFAULT_AUTO_SELECTION_MODES;
  return { whenNothingSelected, whenTextSelected, afterRemovingCallout };
}
