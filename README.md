# Callout Toggles

An [Obsidian plugin](https://obsidian.md/plugins?id=callout-toggles) to quickly add, change, or remove callouts in your notes.

![Switching between callout types demonstration](./readme_assets/6-demo-switching.gif)

## Table of contents

1. [Table of contents](#table-of-contents)
2. [Commands provided](#commands-provided)
   1. [Wrap lines in X callout](#wrap-lines-in-x-callout)
   2. [Remove callout from selected lines](#remove-callout-from-selected-lines)
3. [Usage examples](#usage-examples)
   1. [Inserting a fresh callout](#inserting-a-fresh-callout)
   2. [Wrapping the current line](#wrapping-the-current-line)
   3. [Wrapping multiple lines](#wrapping-multiple-lines)
   4. [Removing a callout](#removing-a-callout)
   5. [Retaining custom titles](#retaining-custom-titles)
4. [Available settings](#available-settings)
   1. [Select text after inserting callout (default: off)](#select-text-after-inserting-callout-default-off)
   2. [Foldable callouts (default: unfoldable)](#foldable-callouts-default-unfoldable)
5. [Callout Manager integration (custom callouts)](#callout-manager-integration-custom-callouts)
6. [Related plugins](#related-plugins)
7. [Feedback](#feedback)
8. [Appreciation](#appreciation)

## Commands provided

Two types of commands are provided: `Wrap lines in X callout` and `Remove callout from selected lines`. Using them together, you can easily change the type of an existing callout.

> [!TIP]
> Both commands work on full lines of text, so your cursor position within a given line doesn't matter. As long as part of a line is selected, the entire line will be included.

### Wrap lines in X callout

One `Wrap lines in X callout` command is provided for every possible callout type `X` (❞ Quote, ⚠ Warning, 🔥 Tip, 🐞 Bug, 📝 Note, etc.), so that you can assign separate hotkeys for each of your favorite callouts. This can be used both for inserting fresh callouts, and for turning existing text into callouts.

### Remove callout from selected lines

> [!IMPORTANT]
> Note that a callout must begin on the first selected line of text for this command to be available.

This will remove the callout syntax from the selected lines, turning the callout back into regular text. If a custom title is present, it will be retained as a Markdown heading.

## Usage examples

### Inserting a fresh callout

To insert a fresh callout of your choice, simply run `Wrap lines in X callout` on a blank line:

![Inserting a fresh callout](./readme_assets/0-insert-fresh.gif)

### Wrapping the current line

If the current line is not blank and nothing is selected, the current line will be turned into a callout:

![Wrapping the current line in a callout](./readme_assets/1-current-line.gif)

### Wrapping multiple lines

To turn multiple lines of text into a callout, first select the lines, and then  run `Wrap lines in X callout`:

![Wrapping multiple lines in a callout](./readme_assets/2-multi-line.gif)

### Removing a callout

To turn a callout back into regular text, run `Remove callout from selected lines` with the given lines selected (make sure the callout header is on the first selected line):

![Unwrapping a callout block](./readme_assets/3-remove-callout.gif)

### Retaining custom titles

If a callout has a default title (e.g. `> [!quote] Quote`), the entire header line will be removed when calling `Remove callout from selected lines`. If a custom title is present (e.g. `> [!quote] Aristotle`), it will be retained as a Markdown heading, so that you don't lose your hard work in choosing that title.

If you call `Wrap lines in X callout` on a selection whose first line is a Markdown heading, the heading will be used as the custom title for the new callout block:

![Retaining custom titles](./readme_assets/4-custom-title.gif)

This makes it easy to switch between callout types while retaining your custom titles:

![Retaining custom titles while switching between callout types](./readme_assets/6-demo-switching-aristotle.gif)

## Available settings

### Select text after inserting callout (default: off)

> [!NOTE]
> This setting only affects what `Wrap lines in X callout` does *when no text is initially selected*.

When enabled, callout text will be automatically selected after insertion, even if no text was initially selected (i.e. when inserting a fresh callout or wrapping the current line). Keep this setting disabled if you'd prefer to be able to immediately start typing content after inserting/wrapping. Enable this setting if you'd prefer to be able to immediately run `Remove callout from selected lines` instead (useful for switching between callout types):

![Select text after inserting callout](./readme_assets/5-setting-select-text-after-inserting-callout.gif)

### Foldable callouts (default: unfoldable)

Whether newly inserted callouts should be unfoldable, expanded, or collapsed by default.

## Callout Manager integration (custom callouts)

This plugin automatically integrates with the [Callout Manager] plugin, if you have it installed. This means that the callout types available in this plugin will be automatically synced with your custom callout types in Callout Manager.

If you don't have Callout Manager installed, [no worries](https://www.youtube.com/watch?v=4P-YBqVzJg0)—this plugin will still work as expected. A default set of callout types will be available for you to use.

## Related plugins

As mentioned above, you can use [Callout Manager] (by [eth-p]) to customize how Obsidian handles callouts—e.g. adjust callout colors/icons, add your own custom callouts, etc.

If you'd like to be able to insert a fresh callout by choosing from a styled (with icons!) dropdown of callout types, you can also consider installing either/both:

1. [Personal Assistant](https://github.com/edonyzpc/personal-assistant) (by [edonyzpc](https://github.com/edonyzpc/)): Shows dropdown when running command "List callout for quickly insert"
2. [Callout Suggestions](https://github.com/cwfryer/obsidian-callout-suggestions) (by [cwfryer](https://github.com/cwfryer/)): Shows inline dropdown when typing `>!`

## Feedback

If you have any feedback or suggestions, feel free to [open an issue](https://github.com/alythobani/obsidian-callout-toggles/issues) and I'd be happy to take a look!

## Appreciation

Thanks to the creators of Obsidian, seriously an awesome note-taking app! And big thanks to [eth-p] for providing a [Callout Manager API](https://github.com/eth-p/obsidian-callout-manager/tree/master/api)—super cool.

[Callout Manager]: https://github.com/eth-p/obsidian-callout-manager/
[eth-p]: https://github.com/eth-p/
