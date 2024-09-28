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

/***/ "./commands.ts":
/*!*********************!*\
  !*** ./commands.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.allCommands = void 0;\nconst editorCheckCallback_1 = __webpack_require__(/*! ./editorCheckCallback */ \"./editorCheckCallback.ts\");\nconst selectionHelpers_1 = __webpack_require__(/*! ./selectionHelpers */ \"./selectionHelpers.ts\");\nconst QUOTE_CALLOUT_HEADER = \"> [!quote] Quote\";\nexports.allCommands = [\n    {\n        id: \"wrap-selected-lines-in-quote-callout\",\n        name: \"Wrap Selected Lines in Quote Callout\",\n        editorCheckCallback: (0, editorCheckCallback_1.makeSelectionCheckCallback)(wrapSelectedLinesInQuoteCallout),\n    },\n    {\n        id: \"wrap-current-line-in-quote-callout\",\n        name: \"Wrap Current Line in Quote Callout\",\n        editorCheckCallback: (0, editorCheckCallback_1.makeCurrentLineCheckCallback)(wrapCurrentLineInQuoteCallout),\n    },\n    {\n        id: \"remove-callout-from-selected-lines\",\n        name: \"Remove Callout from Selected Lines\",\n        editorCheckCallback: (0, editorCheckCallback_1.makeSelectionCheckCallback)(removeCalloutFromSelectedLines),\n    },\n];\n/**\n * Wraps the selected lines in a quote callout. Note that we intentionally do not adjust the cursor\n * position after wrapping the text, since the full callout block will be selected after the wrapping,\n * which is convenient in case the user then wants to call another command (e.g. remove/change\n * callout) on the block.\n */\nfunction wrapSelectedLinesInQuoteCallout(editor) {\n    const { range, text } = (0, selectionHelpers_1.getSelectedLinesRangeAndText)(editor);\n    const prependedLines = text.replace(/^/gm, \"> \");\n    const newText = `${QUOTE_CALLOUT_HEADER}\\n${prependedLines}`;\n    editor.replaceRange(newText, range.from, range.to);\n}\n/**\n * Moves the cursor one line down (for the added callout header) and two characters to the right\n * (for the prepended `> `).\n *\n * @param editor The editor to move the cursor in.\n * @param originalCursor The cursor position before the callout was added.\n */\nfunction setCursorPositionAfterWrappingWithCallout(editor, originalCursor) {\n    const { line, ch } = originalCursor;\n    editor.setCursor({ line: line + 1, ch: ch + 2 });\n}\nfunction wrapCurrentLineInQuoteCallout(editor) {\n    // Save the cursor position before editing the text\n    const originalCursor = editor.getCursor();\n    // We can actually just call `wrapSelectedLinesInQuoteCallout` here, since the selected lines\n    // range will be the current line if nothing is selected.\n    wrapSelectedLinesInQuoteCallout(editor);\n    setCursorPositionAfterWrappingWithCallout(editor, originalCursor);\n}\n/**\n * Removes the callout from the selected lines.\n *\n * TODO: Remove the full header line if it's the default header title.\n */\nfunction removeCalloutFromSelectedLines(editor) {\n    const { range, text } = (0, selectionHelpers_1.getSelectedLinesRangeAndText)(editor);\n    const removedCallout = text.replace(/^> (\\[!\\w+\\] )?/gm, \"\");\n    editor.replaceRange(removedCallout, range.from, range.to);\n}\n\n\n//# sourceURL=webpack:///./commands.ts?");

/***/ }),

/***/ "./editorCheckCallback.ts":
/*!********************************!*\
  !*** ./editorCheckCallback.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.makeSelectionCheckCallback = makeSelectionCheckCallback;\nexports.makeCurrentLineCheckCallback = makeCurrentLineCheckCallback;\n/**\n * Creates an editor check callback for a command that should only be available when text is\n * currently selected in the editor.\n */\nfunction makeSelectionCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (!editor.somethingSelected())\n            return false; // Only show the command if text is selected\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\n/**\n * Creates an editor check callback for a command that that runs on the current line of the cursor.\n * There should be no text currently selected in the editor, to avoid ambiguity in what will happen.\n */\nfunction makeCurrentLineCheckCallback(editorAction) {\n    return (checking, editor, _ctx) => {\n        if (editor.somethingSelected())\n            return false; // Don't show the command if text is selected\n        return showOrRunCommand(editorAction, editor, checking);\n    };\n}\nfunction showOrRunCommand(editorAction, editor, checking) {\n    if (checking)\n        return true;\n    editorAction(editor);\n    return true;\n}\n\n\n//# sourceURL=webpack:///./editorCheckCallback.ts?");

/***/ }),

/***/ "./main.ts":
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst obsidian_1 = __webpack_require__(/*! obsidian */ \"obsidian\");\nconst commands_1 = __webpack_require__(/*! ./commands */ \"./commands.ts\");\nclass CalloutCommands extends obsidian_1.Plugin {\n    onload() {\n        console.log(\"Callout Commands loaded.\");\n        for (const command of commands_1.allCommands) {\n            this.addCommand(command);\n        }\n    }\n    onunload() {\n        console.log(\"Callout Commands unloaded.\");\n    }\n}\nexports[\"default\"] = CalloutCommands;\n\n\n//# sourceURL=webpack:///./main.ts?");

/***/ }),

/***/ "./selectionHelpers.ts":
/*!*****************************!*\
  !*** ./selectionHelpers.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getSelectedLinesRangeAndText = getSelectedLinesRangeAndText;\n/**\n * Returns the range and text of the selected lines, from the start of the first\n * selected line to the end of the last selected line (regardless of where in\n * the line each selection boundary is).\n */\nfunction getSelectedLinesRangeAndText(editor) {\n    const { from, to } = getSelectedLinesRange(editor);\n    const text = editor.getRange(from, to);\n    return { range: { from, to }, text };\n}\nfunction getSelectedLinesRange(editor) {\n    const { from, to } = getSelectionRange(editor);\n    const startOfFirstSelectedLine = { line: from.line, ch: 0 };\n    const endOfLastSelectedLine = { line: to.line, ch: editor.getLine(to.line).length };\n    return { from: startOfFirstSelectedLine, to: endOfLastSelectedLine };\n}\nfunction getSelectionRange(editor) {\n    const from = editor.getCursor(\"from\");\n    const to = editor.getCursor(\"to\");\n    return { from, to };\n}\n\n\n//# sourceURL=webpack:///./selectionHelpers.ts?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./main.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;