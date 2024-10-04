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

/***/ "./src/arrayUtils.ts":
/*!***************************!*\
  !*** ./src/arrayUtils.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getLastElement = getLastElement;\nexports.isNonEmptyArray = isNonEmptyArray;\nfunction getLastElement(arr) {\n    return arr[arr.length - 1]; // eslint-disable-line @typescript-eslint/no-non-null-assertion\n}\nfunction isNonEmptyArray(arr) {\n    return arr.length > 0;\n}\n\n\n//# sourceURL=webpack:///./src/arrayUtils.ts?");

/***/ }),

/***/ "./src/calloutHeaders.ts":
/*!*******************************!*\
  !*** ./src/calloutHeaders.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.DEFAULT_QUOTE_CALLOUT_HEADER = exports.BASE_QUOTE_CALLOUT_HEADER = void 0;\nexports.BASE_QUOTE_CALLOUT_HEADER = \"> [!quote]\";\nexports.DEFAULT_QUOTE_CALLOUT_HEADER = `${exports.BASE_QUOTE_CALLOUT_HEADER} Quote`;\n\n\n//# sourceURL=webpack:///./src/calloutHeaders.ts?");

/***/ }),

/***/ "./src/commands.ts":
/*!*************************!*\
  !*** ./src/commands.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.allCommands = void 0;\nconst editorCheckCallback_1 = __webpack_require__(/*! ./editorCheckCallback */ \"./src/editorCheckCallback.ts\");\nconst removeCallout_1 = __webpack_require__(/*! ./removeCallout */ \"./src/removeCallout.ts\");\nconst wrapLinesInCallout_1 = __webpack_require__(/*! ./wrapLinesInCallout */ \"./src/wrapLinesInCallout.ts\");\nexports.allCommands = [\n    {\n        id: \"wrap-current-line-or-selected-lines-in-quote-callout\",\n        name: \"Wrap Current Line or Selected Lines in Quote Callout\",\n        editorCallback: wrapLinesInCallout_1.wrapCurrentLineOrSelectedLinesInQuoteCallout,\n    },\n    {\n        id: \"remove-callout-from-selected-lines\",\n        name: \"Remove Callout from Selected Lines\",\n        editorCheckCallback: (0, editorCheckCallback_1.makeCalloutSelectionCheckCallback)(removeCallout_1.removeCalloutFromSelectedLines),\n    },\n];\n\n\n//# sourceURL=webpack:///./src/commands.ts?");

/***/ }),

/***/ "./src/editorCheckCallback.ts":
/*!************************************!*\
  !*** ./src/editorCheckCallback.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.makeSelectionCheckCallback = makeSelectionCheckCallback;\nexports.makeCalloutSelectionCheckCallback = makeCalloutSelectionCheckCallback;\nexports.makeCurrentLineCheckCallback = makeCurrentLineCheckCallback;\nconst selectionHelpers_1 = __webpack_require__(/*! ./selectionHelpers */ \"./src/selectionHelpers.ts\");\nconst CALLOUT_HEADER_REGEX = /^> \\[!\\w+\\]/;\n/**\n * Creates an editor check callback for a command that should only be available when text is\n * currently selected in the editor.\n */\nfunction makeSelectionCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (!editor.somethingSelected())\n            return false; // Only show the command if text is selected\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\n/**\n * Creates an editor check callback for a command that should only be available when the currently\n * selected lines begin with a callout.\n */\nfunction makeCalloutSelectionCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (!editor.somethingSelected())\n            return false; // Only show the command if text is selected\n        const { text: selectedLinesText } = (0, selectionHelpers_1.getSelectedLinesRangeAndText)(editor);\n        if (!CALLOUT_HEADER_REGEX.test(selectedLinesText))\n            return false; // Only show the command if the selected text is a callout\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\n/**\n * Creates an editor check callback for a command that that runs on the current line of the cursor.\n * There should be no text currently selected in the editor, to avoid ambiguity in what will happen.\n */\nfunction makeCurrentLineCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (editor.somethingSelected())\n            return false; // Don't show the command if text is selected\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\nfunction showOrRunCommand(editorAction, editor, checking) {\n    if (checking)\n        return true;\n    editorAction(editor);\n    return true;\n}\n\n\n//# sourceURL=webpack:///./src/editorCheckCallback.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst obsidian_1 = __webpack_require__(/*! obsidian */ \"obsidian\");\nconst commands_1 = __webpack_require__(/*! ./commands */ \"./src/commands.ts\");\nclass CalloutCommands extends obsidian_1.Plugin {\n    onload() {\n        console.log(\"Callout Commands loaded.\");\n        for (const command of commands_1.allCommands) {\n            this.addCommand(command);\n        }\n    }\n    onunload() {\n        console.log(\"Callout Commands unloaded.\");\n    }\n}\nexports[\"default\"] = CalloutCommands;\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/removeCallout.ts":
/*!******************************!*\
  !*** ./src/removeCallout.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.removeCalloutFromSelectedLines = removeCalloutFromSelectedLines;\nconst arrayUtils_1 = __webpack_require__(/*! ./arrayUtils */ \"./src/arrayUtils.ts\");\nconst calloutHeaders_1 = __webpack_require__(/*! ./calloutHeaders */ \"./src/calloutHeaders.ts\");\nconst selectionHelpers_1 = __webpack_require__(/*! ./selectionHelpers */ \"./src/selectionHelpers.ts\");\n/**\n * Removes the callout from the selected lines. Retains the title if it's not the default header for\n * the given callout, else removes the entire header line.\n *\n * TODO: if there's a custom title, make it a heading when retaining it. This will make it easier to\n * convert the text back to a callout with the custom title if desired.\n */\nfunction removeCalloutFromSelectedLines(editor) {\n    const selectionRange = (0, selectionHelpers_1.getSelectionRange)(editor); // Actual selection range\n    const { range: selectedLinesRange, text } = (0, selectionHelpers_1.getSelectedLinesRangeAndText)(editor); // Full selected lines range and text\n    const textLines = text.split(\"\\n\"); // `split` is guaranteed to return at least one element\n    const [oldFirstLine, oldLastLine] = [textLines[0], (0, arrayUtils_1.getLastElement)(textLines)]; // Save now to compare with post-edit lines\n    if ([calloutHeaders_1.BASE_QUOTE_CALLOUT_HEADER, calloutHeaders_1.DEFAULT_QUOTE_CALLOUT_HEADER].includes(oldFirstLine)) {\n        const linesWithoutHeader = textLines.slice(1);\n        const unquotedLines = linesWithoutHeader.map((line) => line.replace(/^> /, \"\"));\n        removeCallout({\n            editor,\n            adjustedTextLines: unquotedLines,\n            didRemoveHeader: true,\n            selectionRange,\n            selectedLinesRange,\n            oldFirstLine,\n            oldLastLine,\n        });\n        return;\n    }\n    const customCalloutTitle = oldFirstLine.replace(/^> \\[!\\w+\\] /, \"\");\n    const unquotedLines = textLines.slice(1).map((line) => line.replace(/^> /, \"\"));\n    const adjustedTextLines = [customCalloutTitle, ...unquotedLines];\n    removeCallout({\n        editor,\n        adjustedTextLines,\n        didRemoveHeader: false,\n        selectionRange,\n        selectedLinesRange,\n        oldFirstLine,\n        oldLastLine,\n    });\n}\nfunction removeCallout({ editor, adjustedTextLines, didRemoveHeader, selectionRange, selectedLinesRange, oldFirstLine, oldLastLine, }) {\n    if (!(0, arrayUtils_1.isNonEmptyArray)(adjustedTextLines)) {\n        // Must have removed the header line completely and there are no other lines\n        editor.replaceRange(\"\", selectedLinesRange.from, selectedLinesRange.to);\n        editor.setSelection(selectedLinesRange.from, selectedLinesRange.from);\n        return;\n    }\n    const newText = adjustedTextLines.join(\"\\n\");\n    // Replace the selected lines with the unquoted text\n    editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);\n    // Set the selection to the same relative position as before, but with the new text\n    setSelectionAfterRemovingCallout({\n        adjustedTextLines,\n        selectionRange,\n        oldLastLine,\n        didRemoveHeader,\n        oldFirstLine,\n        editor,\n    });\n}\n/**\n * Sets the selection after removing a callout from the selected lines. This function is necessary\n * because the length and content of the lines may have changed, so the selection must be adjusted\n * accordingly.\n *\n * TODO: correctly set anchor vs head based on the direction of the selection\n */\nfunction setSelectionAfterRemovingCallout({ adjustedTextLines, selectionRange, oldLastLine, didRemoveHeader, oldFirstLine, editor, }) {\n    const newFirstLine = adjustedTextLines[0];\n    const newLastLine = (0, arrayUtils_1.getLastElement)(adjustedTextLines);\n    const newToCh = selectionRange.to.ch - (oldLastLine.length - newLastLine.length);\n    const newTo = { line: selectionRange.to.line - (didRemoveHeader ? 1 : 0), ch: newToCh };\n    const newFromCh = didRemoveHeader\n        ? 0\n        : selectionRange.from.ch - (oldFirstLine.length - newFirstLine.length);\n    const newFrom = { line: selectionRange.from.line, ch: newFromCh };\n    editor.setSelection(newFrom, newTo);\n}\n\n\n//# sourceURL=webpack:///./src/removeCallout.ts?");

/***/ }),

/***/ "./src/selectionHelpers.ts":
/*!*********************************!*\
  !*** ./src/selectionHelpers.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getSelectedLinesRangeAndText = getSelectedLinesRangeAndText;\nexports.getSelectionRange = getSelectionRange;\n/**\n * Returns the range and text of the selected lines, from the start of the first\n * selected line to the end of the last selected line (regardless of where in\n * the line each selection boundary is).\n */\nfunction getSelectedLinesRangeAndText(editor) {\n    const { from, to } = getSelectedLinesRange(editor);\n    const text = editor.getRange(from, to);\n    return { range: { from, to }, text };\n}\nfunction getSelectedLinesRange(editor) {\n    const { from, to } = getSelectionRange(editor);\n    const startOfFirstSelectedLine = { line: from.line, ch: 0 };\n    const endOfLastSelectedLine = { line: to.line, ch: editor.getLine(to.line).length };\n    return { from: startOfFirstSelectedLine, to: endOfLastSelectedLine };\n}\nfunction getSelectionRange(editor) {\n    const from = editor.getCursor(\"from\");\n    const to = editor.getCursor(\"to\");\n    return { from, to };\n}\n\n\n//# sourceURL=webpack:///./src/selectionHelpers.ts?");

/***/ }),

/***/ "./src/wrapLinesInCallout.ts":
/*!***********************************!*\
  !*** ./src/wrapLinesInCallout.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.wrapCurrentLineOrSelectedLinesInQuoteCallout = wrapCurrentLineOrSelectedLinesInQuoteCallout;\nconst calloutHeaders_1 = __webpack_require__(/*! ./calloutHeaders */ \"./src/calloutHeaders.ts\");\nconst selectionHelpers_1 = __webpack_require__(/*! ./selectionHelpers */ \"./src/selectionHelpers.ts\");\nfunction wrapCurrentLineOrSelectedLinesInQuoteCallout(editor) {\n    if (editor.somethingSelected()) {\n        wrapSelectedLinesInQuoteCallout(editor);\n        return;\n    }\n    wrapCurrentLineInQuoteCallout(editor);\n}\n/**\n * Wraps the selected lines in a quote callout.\n */\nfunction wrapSelectedLinesInQuoteCallout(editor) {\n    const selectionRange = (0, selectionHelpers_1.getSelectionRange)(editor);\n    const { range: selectedLinesRange, text } = (0, selectionHelpers_1.getSelectedLinesRangeAndText)(editor);\n    const prependedLines = text.replace(/^/gm, \"> \");\n    const newText = `${calloutHeaders_1.DEFAULT_QUOTE_CALLOUT_HEADER}\\n${prependedLines}`;\n    editor.replaceRange(newText, selectedLinesRange.from, selectedLinesRange.to);\n    setSelectionAfterWrappingLinesInCallout(editor, selectionRange);\n}\nfunction setSelectionAfterWrappingLinesInCallout(editor, originalSelectionRange) {\n    const { from, to } = originalSelectionRange;\n    const newFrom = { line: from.line, ch: 0 };\n    const newTo = { line: to.line + 1, ch: to.ch + 2 };\n    editor.setSelection(newFrom, newTo);\n}\nfunction wrapCurrentLineInQuoteCallout(editor) {\n    const { line, ch } = editor.getCursor();\n    const lineText = editor.getLine(line);\n    const newText = `${calloutHeaders_1.DEFAULT_QUOTE_CALLOUT_HEADER}\\n> ${lineText}`;\n    editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });\n    editor.setSelection({ line, ch: 0 }, { line: line + 1, ch: ch + 3 });\n}\n\n\n//# sourceURL=webpack:///./src/wrapLinesInCallout.ts?");

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