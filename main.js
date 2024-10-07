/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/callouts/builtinCallouts.ts":
/*!*****************************************!*\
  !*** ./src/callouts/builtinCallouts.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n/**\n * This file contains the built-in callouts that are available to be used in Obsidian.\n *\n * See Obsidian docs:\n * https://help.obsidian.md/Editing+and+formatting/Callouts#Supported%20types\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.BUILTIN_CALLOUT_KEYWORDS = void 0;\nexports.BUILTIN_CALLOUT_KEYWORDS = [\n    \"note\",\n    \"abstract\",\n    \"info\",\n    \"todo\",\n    \"tip\",\n    \"success\",\n    \"question\",\n    \"warning\",\n    \"failure\",\n    \"danger\",\n    \"bug\",\n    \"example\",\n    \"quote\",\n];\n\n\n//# sourceURL=webpack:///./src/callouts/builtinCallouts.ts?");

/***/ }),

/***/ "./src/commands/allCommands.ts":
/*!*************************************!*\
  !*** ./src/commands/allCommands.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.allCommands = void 0;\nconst builtinCallouts_1 = __webpack_require__(/*! ../callouts/builtinCallouts */ \"./src/callouts/builtinCallouts.ts\");\nconst editorCheckCallbackUtils_1 = __webpack_require__(/*! ../utils/editorCheckCallbackUtils */ \"./src/utils/editorCheckCallbackUtils.ts\");\nconst stringUtils_1 = __webpack_require__(/*! ../utils/stringUtils */ \"./src/utils/stringUtils.ts\");\nconst removeCallout_1 = __webpack_require__(/*! ./removeCallout */ \"./src/commands/removeCallout.ts\");\nconst wrapLinesInCallout_1 = __webpack_require__(/*! ./wrapLinesInCallout */ \"./src/commands/wrapLinesInCallout.ts\");\nconst allBuiltinWrapCommands = builtinCallouts_1.BUILTIN_CALLOUT_KEYWORDS.map((calloutKeyword) => {\n    const capitalizedKeyword = (0, stringUtils_1.toTitleCaseWord)(calloutKeyword);\n    return {\n        id: `wrap-current-line-or-selected-lines-in-${calloutKeyword}-callout`,\n        name: `Wrap Current Line or Selected Lines in ${capitalizedKeyword} Callout`,\n        editorCallback: (0, wrapLinesInCallout_1.makeWrapCurrentLineOrSelectedLinesInCalloutCommand)(calloutKeyword),\n    };\n});\nconst removeCalloutFromSelectedLinesCommand = {\n    id: \"remove-callout-from-selected-lines\",\n    name: \"Remove Callout from Selected Lines\",\n    editorCheckCallback: (0, editorCheckCallbackUtils_1.makeCalloutSelectionCheckCallback)(removeCallout_1.removeCalloutFromSelectedLines),\n};\nexports.allCommands = [\n    ...allBuiltinWrapCommands,\n    removeCalloutFromSelectedLinesCommand,\n];\n\n\n//# sourceURL=webpack:///./src/commands/allCommands.ts?");

/***/ }),

/***/ "./src/commands/removeCallout.ts":
/*!***************************************!*\
  !*** ./src/commands/removeCallout.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.removeCalloutFromSelectedLines = removeCalloutFromSelectedLines;\nconst arrayUtils_1 = __webpack_require__(/*! ../utils/arrayUtils */ \"./src/utils/arrayUtils.ts\");\nconst calloutTitleUtils_1 = __webpack_require__(/*! ../utils/calloutTitleUtils */ \"./src/utils/calloutTitleUtils.ts\");\nconst selectionUtils_1 = __webpack_require__(/*! ../utils/selectionUtils */ \"./src/utils/selectionUtils.ts\");\nconst stringUtils_1 = __webpack_require__(/*! ../utils/stringUtils */ \"./src/utils/stringUtils.ts\");\n/**\n * Removes the callout from the selected lines. Retains the title if it's not the default header for\n * the given callout, else removes the entire header line.\n */\nfunction removeCalloutFromSelectedLines(editor) {\n    const originalCursorPositions = (0, selectionUtils_1.getCursorPositions)(editor);\n    const { range: selectedLinesRange, text } = (0, selectionUtils_1.getSelectedLinesRangeAndText)(editor); // Full selected lines range and text\n    const textLines = (0, stringUtils_1.getTextLines)(text);\n    const [oldFirstLine, oldLastLine] = [textLines[0], (0, arrayUtils_1.getLastElement)(textLines)]; // Save now to compare with post-edit lines\n    const { calloutKeyword, effectiveTitle } = (0, calloutTitleUtils_1.getCalloutKeywordAndEffectiveTitle)(text);\n    if ((0, calloutTitleUtils_1.isCustomTitle)({ calloutKeyword, effectiveTitle })) {\n        removeCalloutWithCustomTitle({\n            oldFirstLine,\n            textLines,\n            editor,\n            originalCursorPositions,\n            selectedLinesRange,\n            oldLastLine,\n            customTitle: effectiveTitle,\n        });\n        return;\n    }\n    removeCalloutWithDefaultTitle({\n        textLines,\n        editor,\n        originalCursorPositions,\n        selectedLinesRange,\n        oldFirstLine,\n        oldLastLine,\n    });\n    return;\n}\n/**\n * Removes the callout from the selected lines, retaining the custom title if there is one.\n */\nfunction removeCalloutWithCustomTitle({ oldFirstLine, textLines, editor, originalCursorPositions, selectedLinesRange, oldLastLine, customTitle, }) {\n    const customTitleHeadingLine = (0, calloutTitleUtils_1.makeH6Line)(customTitle);\n    const unquotedLines = textLines.slice(1).map((line) => line.replace(/^> /, \"\"));\n    const adjustedTextLines = [customTitleHeadingLine, ...unquotedLines];\n    replaceCalloutLinesAndAdjustSelection({\n        editor,\n        adjustedTextLines,\n        didRemoveHeader: false,\n        originalCursorPositions,\n        selectedLinesRange,\n        oldFirstLine,\n        oldLastLine,\n    });\n}\nfunction removeCalloutWithDefaultTitle({ textLines, editor, originalCursorPositions, selectedLinesRange, oldFirstLine, oldLastLine, }) {\n    const linesWithoutHeader = textLines.slice(1);\n    const unquotedLines = linesWithoutHeader.map((line) => line.replace(/^> /, \"\"));\n    replaceCalloutLinesAndAdjustSelection({\n        editor,\n        adjustedTextLines: unquotedLines,\n        didRemoveHeader: true,\n        originalCursorPositions,\n        selectedLinesRange,\n        oldFirstLine,\n        oldLastLine,\n    });\n    return;\n}\n/**\n * Replaces the selected lines with the given text lines, adjusting the selection after to match the\n * original selection's relative position.\n */\nfunction replaceCalloutLinesAndAdjustSelection({ editor, adjustedTextLines, didRemoveHeader, originalCursorPositions, selectedLinesRange, oldFirstLine, oldLastLine, }) {\n    if (!(0, arrayUtils_1.isNonEmptyArray)(adjustedTextLines)) {\n        // Must have removed the header line completely (default title) and there are no other lines\n        editor.replaceRange(\"\", selectedLinesRange.from, selectedLinesRange.to);\n        editor.setSelection(selectedLinesRange.from, selectedLinesRange.from);\n        return;\n    }\n    const newText = adjustedTextLines.join(\"\\n\");\n    // Replace the selected lines with the unquoted text\n    editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);\n    // Set the selection to the same relative position as before, but with the new text\n    adjustSelectionAfterReplacingCallout({\n        adjustedTextLines,\n        originalCursorPositions,\n        oldLastLine,\n        didRemoveHeader,\n        oldFirstLine,\n        editor,\n    });\n}\n/**\n * Sets the selection after removing the callout from the selected lines, back to the original\n * selection's relative position.\n */\nfunction adjustSelectionAfterReplacingCallout({ adjustedTextLines, originalCursorPositions, oldLastLine, didRemoveHeader, oldFirstLine, editor, }) {\n    const { from: originalFrom, to: originalTo } = originalCursorPositions;\n    const newFirstLine = adjustedTextLines[0];\n    const newLastLine = (0, arrayUtils_1.getLastElement)(adjustedTextLines);\n    const newToCh = Math.min(originalTo.ch - (oldLastLine.length - newLastLine.length), newLastLine.length);\n    const newTo = { line: originalTo.line - (didRemoveHeader ? 1 : 0), ch: newToCh };\n    const newFromCh = didRemoveHeader\n        ? 0\n        : originalFrom.ch - (oldFirstLine.length - newFirstLine.length);\n    const newFrom = { line: originalFrom.line, ch: newFromCh };\n    const newRange = { from: newFrom, to: newTo };\n    const { newAnchor, newHead } = (0, selectionUtils_1.getNewAnchorAndHead)(originalCursorPositions, newRange);\n    editor.setSelection(newAnchor, newHead);\n}\n\n\n//# sourceURL=webpack:///./src/commands/removeCallout.ts?");

/***/ }),

/***/ "./src/commands/wrapLinesInCallout.ts":
/*!********************************************!*\
  !*** ./src/commands/wrapLinesInCallout.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.makeWrapCurrentLineOrSelectedLinesInCalloutCommand = makeWrapCurrentLineOrSelectedLinesInCalloutCommand;\nconst calloutTitleUtils_1 = __webpack_require__(/*! ../utils/calloutTitleUtils */ \"./src/utils/calloutTitleUtils.ts\");\nconst selectionUtils_1 = __webpack_require__(/*! ../utils/selectionUtils */ \"./src/utils/selectionUtils.ts\");\nconst stringUtils_1 = __webpack_require__(/*! ../utils/stringUtils */ \"./src/utils/stringUtils.ts\");\nfunction makeWrapCurrentLineOrSelectedLinesInCalloutCommand(calloutKeyword) {\n    return (editor) => {\n        wrapCurrentLineOrSelectedLinesInCallout(editor, calloutKeyword);\n    };\n}\nfunction wrapCurrentLineOrSelectedLinesInCallout(editor, calloutKeyword) {\n    if (editor.somethingSelected()) {\n        wrapSelectedLinesInCallout(editor, calloutKeyword);\n        return;\n    }\n    wrapCurrentLineInCallout(editor, calloutKeyword);\n}\n/**\n * Wraps the selected lines in a callout.\n */\nfunction wrapSelectedLinesInCallout(editor, calloutKeyword) {\n    const originalCursorPositions = (0, selectionUtils_1.getCursorPositions)(editor); // Save cursor positions before editing\n    const { range: selectedLinesRange, text: selectedText } = (0, selectionUtils_1.getSelectedLinesRangeAndText)(editor);\n    const selectedLines = (0, stringUtils_1.getTextLines)(selectedText);\n    const { title, rawBodyLines } = getCalloutTitleAndRawBodyLines(selectedLines, calloutKeyword);\n    wrapLinesInCallout({\n        editor,\n        calloutKeyword,\n        originalCursorPositions,\n        selectedLines,\n        selectedLinesRange,\n        title,\n        rawBodyLines,\n    });\n}\n/**\n * Gets the callout title and raw (not yet prepended) body lines from the selected text lines. If\n * the first line is a heading, it is used as the callout title, and the rest of the lines are used\n * as the body. Otherwise, the default callout title is used, and all the selected lines are used as\n * the body.\n */\nfunction getCalloutTitleAndRawBodyLines(selectedLines, calloutKeyword) {\n    const [firstSelectedLine, ...restSelectedLines] = selectedLines;\n    const maybeHeadingTitle = (0, calloutTitleUtils_1.getCustomHeadingTitleIfExists)({ firstSelectedLine });\n    if (maybeHeadingTitle === undefined) {\n        const defaultCalloutTitle = (0, calloutTitleUtils_1.getDefaultCalloutTitle)(calloutKeyword);\n        return { title: defaultCalloutTitle, rawBodyLines: selectedLines };\n    }\n    return { title: maybeHeadingTitle, rawBodyLines: restSelectedLines };\n}\n/**\n * Wraps the selected lines in a callout.\n */\nfunction wrapLinesInCallout({ editor, calloutKeyword, originalCursorPositions, selectedLines, selectedLinesRange, title, rawBodyLines, }) {\n    const calloutBodyLines = rawBodyLines.map((line) => `> ${line}`);\n    const calloutBody = calloutBodyLines.join(\"\\n\");\n    const calloutHeader = (0, calloutTitleUtils_1.makeCalloutHeader)({ calloutKeyword, title });\n    const newText = `${calloutHeader}\\n${calloutBody}`;\n    editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);\n    setSelectionAfterWrappingLinesInCallout({\n        editor,\n        originalCursorPositions,\n        originalSelectedLines: selectedLines,\n        calloutHeader,\n        calloutBodyLines,\n    });\n}\n/**\n * Sets the selection after wrapping the selected lines in a callout.\n */\nfunction setSelectionAfterWrappingLinesInCallout({ editor, originalCursorPositions, originalSelectedLines, calloutHeader, calloutBodyLines, }) {\n    const newRange = getNewSelectionRangeAfterWrappingLinesInCallout({\n        originalCursorPositions,\n        originalSelectedLines,\n        calloutHeader,\n        calloutBodyLines,\n    });\n    setSelectionInCorrectDirection(editor, originalCursorPositions, newRange);\n}\nfunction getNewSelectionRangeAfterWrappingLinesInCallout({ originalCursorPositions, originalSelectedLines, calloutHeader, calloutBodyLines, }) {\n    const { from: originalFrom, to: originalTo } = originalCursorPositions;\n    // Add 2 characters for the \"> \" prefix\n    const lastBodyLineLength = calloutBodyLines[calloutBodyLines.length - 1]?.length ?? 0;\n    const newToCh = Math.min(originalTo.ch + 2, lastBodyLineLength - 1);\n    const didAddHeaderLine = originalSelectedLines.length === calloutBodyLines.length;\n    if (didAddHeaderLine) {\n        const newFrom = { line: originalFrom.line, ch: 0 };\n        const newTo = { line: originalTo.line + 1, ch: newToCh };\n        return { from: newFrom, to: newTo };\n    }\n    // We turned the existing first line from a heading into a callout header\n    const originalFirstLine = originalSelectedLines[0];\n    const rawNewFromCh = originalFrom.ch - (originalFirstLine.length - calloutHeader.length);\n    const newFromCh = Math.clamp(rawNewFromCh, 0, calloutHeader.length);\n    const newFrom = { line: originalFrom.line, ch: newFromCh };\n    const newTo = { line: originalTo.line, ch: newToCh };\n    return { from: newFrom, to: newTo };\n}\nfunction setSelectionInCorrectDirection(editor, originalCursorPositions, newRange) {\n    const { newAnchor, newHead } = (0, selectionUtils_1.getNewAnchorAndHead)(originalCursorPositions, newRange);\n    editor.setSelection(newAnchor, newHead);\n}\n/**\n * Wraps the cursor's current line in a callout.\n */\nfunction wrapCurrentLineInCallout(editor, calloutKeyword) {\n    const { line, ch } = editor.getCursor();\n    const lineText = editor.getLine(line);\n    const calloutHeader = (0, calloutTitleUtils_1.makeDefaultCalloutHeader)(calloutKeyword);\n    const prependedLine = `> ${lineText}`;\n    const newText = `${calloutHeader}\\n${prependedLine}`;\n    editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });\n    const newFrom = { line, ch: 0 };\n    const newToCh = Math.min(ch + 3, lineText.length + 2);\n    const newTo = { line: line + 1, ch: newToCh };\n    editor.setSelection(newFrom, newTo);\n}\n\n\n//# sourceURL=webpack:///./src/commands/wrapLinesInCallout.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst obsidian_1 = __webpack_require__(/*! obsidian */ \"obsidian\");\nconst allCommands_1 = __webpack_require__(/*! ./commands/allCommands */ \"./src/commands/allCommands.ts\");\nclass CalloutCommands extends obsidian_1.Plugin {\n    onload() {\n        console.log(\"Callout Commands loaded.\");\n        for (const command of allCommands_1.allCommands) {\n            this.addCommand(command);\n        }\n    }\n    onunload() {\n        console.log(\"Callout Commands unloaded.\");\n    }\n}\nexports[\"default\"] = CalloutCommands;\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/utils/arrayUtils.ts":
/*!*********************************!*\
  !*** ./src/utils/arrayUtils.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getLastElement = getLastElement;\nexports.isNonEmptyArray = isNonEmptyArray;\nfunction getLastElement(arr) {\n    return arr[arr.length - 1]; // eslint-disable-line @typescript-eslint/no-non-null-assertion\n}\nfunction isNonEmptyArray(arr) {\n    return arr.length > 0;\n}\n\n\n//# sourceURL=webpack:///./src/utils/arrayUtils.ts?");

/***/ }),

/***/ "./src/utils/calloutTitleUtils.ts":
/*!****************************************!*\
  !*** ./src/utils/calloutTitleUtils.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.makeCalloutHeader = makeCalloutHeader;\nexports.getDefaultCalloutTitle = getDefaultCalloutTitle;\nexports.makeDefaultCalloutHeader = makeDefaultCalloutHeader;\nexports.makeH6Line = makeH6Line;\nexports.getCalloutKeywordAndEffectiveTitle = getCalloutKeywordAndEffectiveTitle;\nexports.getCustomHeadingTitleIfExists = getCustomHeadingTitleIfExists;\nexports.isCustomTitle = isCustomTitle;\nconst regexUtils_1 = __webpack_require__(/*! ./regexUtils */ \"./src/utils/regexUtils.ts\");\nconst stringUtils_1 = __webpack_require__(/*! ./stringUtils */ \"./src/utils/stringUtils.ts\");\nconst CALLOUT_KEYWORD_REGEX = /^> \\[!(\\w+)\\]/;\nconst CALLOUT_TITLE_REGEX = /^> \\[!\\w+\\] (.+)/;\nconst HEADING_TITLE_REGEX = /^#+ (.+)/;\nfunction makeCalloutHeader({ calloutKeyword, title, }) {\n    const baseCalloutHeader = makeBaseCalloutHeader(calloutKeyword);\n    return `${baseCalloutHeader} ${title}`;\n}\nfunction makeBaseCalloutHeader(calloutKeyword) {\n    return `> [!${calloutKeyword}]`;\n}\nfunction getDefaultCalloutTitle(calloutKeyword) {\n    return (0, stringUtils_1.toTitleCaseWord)(calloutKeyword);\n}\nfunction makeDefaultCalloutHeader(calloutKeyword) {\n    const defaultTitle = getDefaultCalloutTitle(calloutKeyword);\n    return makeCalloutHeader({ calloutKeyword, title: defaultTitle });\n}\nfunction makeH6Line(title) {\n    return `###### ${title}`;\n}\n/**\n * Parses the callout keyword and effective title from the full text of a callout.\n *\n * @param fullCalloutText The full text of the callout (both the header and the body).\n */\nfunction getCalloutKeywordAndEffectiveTitle(fullCalloutText) {\n    const calloutKeyword = getCalloutKeyword(fullCalloutText);\n    const effectiveTitle = getCalloutEffectiveTitle(calloutKeyword, fullCalloutText);\n    return { calloutKeyword, effectiveTitle };\n}\nfunction getCalloutKeyword(fullCalloutText) {\n    const maybeCalloutKeyword = getTrimmedCalloutKeywordIfExists(fullCalloutText);\n    if (maybeCalloutKeyword === undefined) {\n        throw new Error(\"Callout keyword not found in callout text.\");\n    }\n    return maybeCalloutKeyword;\n}\nfunction getTrimmedCalloutKeywordIfExists(fullCalloutText) {\n    return (0, regexUtils_1.getTrimmedFirstCapturingGroupIfExists)(CALLOUT_KEYWORD_REGEX, fullCalloutText);\n}\n/**\n * Gets the effective title of a callout, which may either be an explicitly set non-empty (and not\n * only whitespace) title, or otherwise inferred as the default title.\n */\nfunction getCalloutEffectiveTitle(calloutKeyword, fullCalloutText) {\n    const maybeExplicitTitle = getTrimmedCalloutTitleIfExists(fullCalloutText);\n    if (maybeExplicitTitle === \"\" || maybeExplicitTitle === undefined) {\n        return getDefaultCalloutTitle(calloutKeyword);\n    }\n    return maybeExplicitTitle;\n}\n/**\n * Gets the explicit title (trimmed of surrounding whitespace) of a callout, if one is present.\n *\n * @param fullCalloutText The full text of the callout (both the header and the body).\n */\nfunction getTrimmedCalloutTitleIfExists(fullCalloutText) {\n    return (0, regexUtils_1.getTrimmedFirstCapturingGroupIfExists)(CALLOUT_TITLE_REGEX, fullCalloutText);\n}\n/**\n * Gets the heading title text (trimmed of surrounding whitespace) from the first line of selected\n * text to be wrapped in a callout, if such a heading text exists. If none is found or the trimmed\n * string is empty, returns undefined.\n *\n * @param firstSelectedLine The first line of the text to be wrapped in a callout.\n * @returns The trimmed heading text if it exists and is non-empty, otherwise undefined.\n */\nfunction getCustomHeadingTitleIfExists({ firstSelectedLine, }) {\n    const maybeHeadingTitle = getTrimmedHeadingTitleIfExists(firstSelectedLine);\n    if (maybeHeadingTitle === \"\" || maybeHeadingTitle === undefined) {\n        return undefined;\n    }\n    return maybeHeadingTitle;\n}\nfunction getTrimmedHeadingTitleIfExists(firstSelectedLine) {\n    return (0, regexUtils_1.getTrimmedFirstCapturingGroupIfExists)(HEADING_TITLE_REGEX, firstSelectedLine);\n}\n/**\n * Determines whether the effective title of a callout is a custom title or the default title.\n *\n * @param effectiveTitle The effective title of the callout.\n */\nfunction isCustomTitle({ calloutKeyword, effectiveTitle, }) {\n    const defaultTitle = getDefaultCalloutTitle(calloutKeyword);\n    return effectiveTitle !== defaultTitle;\n}\n\n\n//# sourceURL=webpack:///./src/utils/calloutTitleUtils.ts?");

/***/ }),

/***/ "./src/utils/editorCheckCallbackUtils.ts":
/*!***********************************************!*\
  !*** ./src/utils/editorCheckCallbackUtils.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.makeSelectionCheckCallback = makeSelectionCheckCallback;\nexports.makeCalloutSelectionCheckCallback = makeCalloutSelectionCheckCallback;\nexports.makeCurrentLineCheckCallback = makeCurrentLineCheckCallback;\nconst selectionUtils_1 = __webpack_require__(/*! ./selectionUtils */ \"./src/utils/selectionUtils.ts\");\nconst CALLOUT_HEADER_REGEX = /^> \\[!\\w+\\]/;\n/**\n * Creates an editor check callback for a command that should only be available when text is\n * currently selected in the editor.\n */\nfunction makeSelectionCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (!editor.somethingSelected())\n            return false; // Only show the command if text is selected\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\n/**\n * Creates an editor check callback for a command that should only be available when the currently\n * selected lines begin with a callout.\n */\nfunction makeCalloutSelectionCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (!editor.somethingSelected())\n            return false; // Only show the command if text is selected\n        const { text: selectedLinesText } = (0, selectionUtils_1.getSelectedLinesRangeAndText)(editor);\n        if (!CALLOUT_HEADER_REGEX.test(selectedLinesText))\n            return false; // Only show the command if the selected text is a callout\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\n/**\n * Creates an editor check callback for a command that that runs on the current line of the cursor.\n * There should be no text currently selected in the editor, to avoid ambiguity in what will happen.\n */\nfunction makeCurrentLineCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (editor.somethingSelected())\n            return false; // Don't show the command if text is selected\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\nfunction showOrRunCommand(editorAction, editor, checking) {\n    if (checking)\n        return true;\n    editorAction(editor);\n    return true;\n}\n\n\n//# sourceURL=webpack:///./src/utils/editorCheckCallbackUtils.ts?");

/***/ }),

/***/ "./src/utils/regexUtils.ts":
/*!*********************************!*\
  !*** ./src/utils/regexUtils.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getFirstCapturingGroupIfExists = getFirstCapturingGroupIfExists;\nexports.getTrimmedFirstCapturingGroupIfExists = getTrimmedFirstCapturingGroupIfExists;\n/**\n * Returns the first capturing group match of the regex if it exists, otherwise returns undefined.\n * @param regex The regex to use, with at least one capturing group\n * @param text The text to search\n * @returns The first capturing group match if it exists, otherwise undefined\n */\nfunction getFirstCapturingGroupIfExists(regex, text) {\n    const match = regex.exec(text);\n    return match?.[1];\n}\n/**\n * Returns the first capturing group match (trimmed of surrounding whitespace) of the regex executed\n * on the text, if found. If the match is not found, returns undefined.\n * @param regex The regex to use, with at least one capturing group\n * @param text The text to search\n * @returns The first capturing group match (trimmed) if it exists, otherwise undefined\n */\nfunction getTrimmedFirstCapturingGroupIfExists(regex, text) {\n    const maybeRawMatch = getFirstCapturingGroupIfExists(regex, text);\n    return maybeRawMatch?.trim();\n}\n\n\n//# sourceURL=webpack:///./src/utils/regexUtils.ts?");

/***/ }),

/***/ "./src/utils/selectionUtils.ts":
/*!*************************************!*\
  !*** ./src/utils/selectionUtils.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getSelectedLinesRangeAndText = getSelectedLinesRangeAndText;\nexports.getSelectionRange = getSelectionRange;\nexports.getAnchorAndHead = getAnchorAndHead;\nexports.getCursorPositions = getCursorPositions;\nexports.isHeadBeforeAnchor = isHeadBeforeAnchor;\nexports.getNewAnchorAndHead = getNewAnchorAndHead;\n/**\n * Returns the range and text of the selected lines, from the start of the first\n * selected line to the end of the last selected line (regardless of where in\n * the line each selection boundary is).\n */\nfunction getSelectedLinesRangeAndText(editor) {\n    const { from, to } = getSelectedLinesRange(editor);\n    const text = editor.getRange(from, to);\n    return { range: { from, to }, text };\n}\nfunction getSelectedLinesRange(editor) {\n    const { from, to } = getSelectionRange(editor);\n    const startOfFirstSelectedLine = { line: from.line, ch: 0 };\n    const endOfLastSelectedLine = { line: to.line, ch: editor.getLine(to.line).length };\n    return { from: startOfFirstSelectedLine, to: endOfLastSelectedLine };\n}\nfunction getSelectionRange(editor) {\n    const from = editor.getCursor(\"from\");\n    const to = editor.getCursor(\"to\");\n    return { from, to };\n}\nfunction getAnchorAndHead(editor) {\n    const anchor = editor.getCursor(\"anchor\");\n    const head = editor.getCursor(\"head\");\n    return { anchor, head };\n}\nfunction getCursorPositions(editor) {\n    const { anchor, head } = getAnchorAndHead(editor);\n    const { from, to } = getSelectionRange(editor);\n    return { anchor, head, from, to };\n}\nfunction isHeadBeforeAnchor({ anchor, head, }) {\n    return head.line < anchor.line || (head.line === anchor.line && head.ch < anchor.ch);\n}\nfunction getNewAnchorAndHead(originalCursorPositions, newRange) {\n    const { from: newFrom, to: newTo } = newRange;\n    return isHeadBeforeAnchor(originalCursorPositions)\n        ? { newAnchor: newTo, newHead: newFrom }\n        : { newAnchor: newFrom, newHead: newTo };\n}\n\n\n//# sourceURL=webpack:///./src/utils/selectionUtils.ts?");

/***/ }),

/***/ "./src/utils/stringUtils.ts":
/*!**********************************!*\
  !*** ./src/utils/stringUtils.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getTextLines = getTextLines;\nexports.toTitleCaseWord = toTitleCaseWord;\n/**\n * Better-typed version of `text.split(\"\\n\")` where we know the result will always have at least one\n * element, since `String.prototype.split` only returns an empty array when the input string and\n * separator are both empty strings, and in this case the separator is \"\\n\" which is not empty.\n */\nfunction getTextLines(text) {\n    return text.split(\"\\n\");\n}\nfunction toTitleCaseWord(word) {\n    const firstLetter = word.charAt(0).toUpperCase();\n    const rest = word.slice(1).toLowerCase();\n    return `${firstLetter}${rest}`;\n}\n\n\n//# sourceURL=webpack:///./src/utils/stringUtils.ts?");

/***/ }),

/***/ "obsidian":
/*!***************************!*\
  !*** external "obsidian" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("obsidian");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;