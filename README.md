# Callout Toggles

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://buymeacoffee.com/alythobani)

An [Obsidian](https://obsidian.md/) plugin for quickly adding and removing callout wrappers from selected lines of text.

## Commands provided

1. **Wrap lines in [X] callout**
2. **Remove callout from selected lines**

One `Wrap lines in [X] callout` command is provided for each callout type (bug, info, warning, question, tip, quote, etc.), so that you can assign separate hotkeys for each of your favorite callouts.

## Usage

### Inserting a fresh callout block / wrapping the current line

To insert a fresh callout block of your choice, simply run `Wrap lines in [X] callout` on a blank line. If the current line is not blank and nothing is selected, the current line will be included in the callout.

<video src="./readme_assets/0-insert-fresh.mov"></video>

![Inserting a fresh callout block](./readme_assets/0-insert-fresh.mov)

### Turning multiple lines of text into a callout

To turn multiple lines of text into a callout of your choice, first select the lines, and then  run `Wrap lines in [X] callout`. Note that the wrap command works on full lines; so as long as part of a line is selected, the entire line will be included in the callout.

### Unwrapping a callout block

To turn a callout back into regular text, run the `Remove callout from selected lines` command with the given lines selected. The callout must begin on the first selected line of text for this command to be available.

### Retaining custom titles

By default, callout blocks are given a title that matches the callout type (e.g. `> [!quote] Quote`).

If the callout's title is the default or nonexistent, the entire header line will be removed when calling `Remove callout from selected lines`. However, if a custom title is present (e.g. `> [!quote] Aristotle`), it will be retained as a Markdown heading, so that you don't lose your hard work in titling the callout.

This means that you can reuse the custom title as a title for a new callout block. If you call `Wrap lines in [X] callout` on a selection whose first line is a Markdown heading, the heading will be used as the title for the new callout block.

## Available settings

**Select text after inserting callout** (*default: off*): When enabled, callout text will be automatically selected after insertion, even if no text was initially selected. Enable this setting if you want to be able to immediately run `Remove callout from selected lines` on the callout block you just made. Keep this setting disabled if you'd prefer to be able to immediately start typing content after inserting a callout. Note that this setting only affects what happens when you run `Wrap lines in [X] callout` with no text selected (if text is selected, the selection will still be adjusted appropriately post-wrap).

## Callout Manager integration (custom callouts)

This plugin automatically integrates with the [Callout Manager](https://github.com/eth-p/obsidian-callout-manager/) plugin, if you have it installed. This means that the callout types available in this plugin will be automatically synced with your custom callout types in Callout Manager.

If you don't have Callout Manager installed, [no worries](https://www.youtube.com/watch?v=4P-YBqVzJg0)—this plugin will still work as expected. A default set of callout types will be available for you to use.

## Other related plugins

You can use the [Callout Manager](https://github.com/eth-p/obsidian-callout-manager/) plugin to customize how Obsidian handles callouts (adjust callout colors/icons; add your own custom callouts; etc.).

If you'd like a single command that prompts you with a dropdown of callout types, I'd recommend also installing the [Callout Suggestions](https://github.com/cwfryer/obsidian-callout-suggestions) plugin. However, do note that Callout Suggestions does depend on the Callout Manager plugin to work; but it does a great job at implementing the command.

## Appreciation

Thanks to the creators of Obsidian—seriously an awesome note-taking app! Thanks also to [cwfryer](https://github.com/cwfryer) for creating a great open-source plugin ([Callout Suggestions](https://github.com/cwfryer/obsidian-callout-suggestions), mentioned above) that I could use as reference for developing this plugin. Finally, big thanks to [eth-p](https://github.com/eth-p/) for providing a Callout Manager API—quite a nice touch.
