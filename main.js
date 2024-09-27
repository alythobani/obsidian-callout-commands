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
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.allCommands = void 0;\nconst QUOTE_CALLOUT_HEADER = \"> [!quote] Quote\";\n/**\n * Perform an action on the selected text if there is any, and return whether the action was performed.\n *\n * @param checking Whether we are checking or performing the action (see `editorCheckCallback`)\n * @param editor The editor instance\n * @param action The editor action to perform on the selected text\n */\nfunction maybePerformActionOnSelectedText(checking, editor, action) {\n    const selectedText = editor.getSelection();\n    if (!selectedText)\n        return false; // Don't show the command if no text is selected\n    if (checking)\n        return true;\n    action(editor, selectedText);\n    return true;\n}\nfunction turnCurrentLineIntoQuoteCallout(editor) {\n    const cursor = editor.getCursor();\n    const { line, ch } = cursor;\n    const lineText = editor.getLine(line);\n    const newText = `${QUOTE_CALLOUT_HEADER}\\n> ${lineText}`;\n    editor.replaceRange(newText, { line, ch: 0 }, { line, ch: lineText.length });\n    editor.setCursor({ line: line + 1, ch: ch + 2 }); // Keep cursor where it was relative to the original line\n}\nconst maybeTurnSelectedLinesIntoQuoteCallout = (checking, editor, _ctx) => {\n    return maybePerformActionOnSelectedText(checking, editor, (editor, selectedText) => {\n        const replacedText = selectedText.replace(/^/gm, \"> \");\n        editor.replaceSelection(`\\n\\n${QUOTE_CALLOUT_HEADER}\\n${replacedText}\\n\\n`, selectedText);\n    });\n};\nconst maybeRemoveCalloutFromSelectedLines = (checking, editor, _ctx) => {\n    return maybePerformActionOnSelectedText(checking, editor, (editor, selectedText) => {\n        const removedCallout = selectedText.replace(/^> (\\[!\\w+\\] )?/gm, \"\");\n        editor.replaceSelection(removedCallout);\n    });\n};\nexports.allCommands = [\n    {\n        id: \"turn-selected-lines-into-quote-callout\",\n        name: \"Turn Selected Lines into Quote Callout\",\n        editorCheckCallback: maybeTurnSelectedLinesIntoQuoteCallout,\n    },\n    {\n        id: \"turn-current-line-into-quote-callout\",\n        name: \"Turn Current Line into Quote Callout\",\n        editorCheckCallback: (checking, editor, _ctx) => {\n            const selectedText = editor.getSelection();\n            if (selectedText)\n                return false; // Don't show the command if text is selected\n            if (checking)\n                return true;\n            turnCurrentLineIntoQuoteCallout(editor);\n            return true;\n        },\n    },\n    {\n        id: \"remove-callout-from-selected-lines\",\n        name: \"Remove Callout from Selected Lines\",\n        editorCheckCallback: maybeRemoveCalloutFromSelectedLines,\n    },\n];\n\n\n//# sourceURL=webpack:///./commands.ts?");

/***/ }),

/***/ "./main.ts":
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst obsidian_1 = __webpack_require__(/*! obsidian */ \"obsidian\");\nconst commands_1 = __webpack_require__(/*! ./commands */ \"./commands.ts\");\nclass CalloutCommands extends obsidian_1.Plugin {\n    onload() {\n        console.log(\"Callout Commands loaded.\");\n        for (const command of commands_1.allCommands) {\n            this.addCommand(command);\n        }\n    }\n    onunload() {\n        console.log(\"Callout Commands unloaded.\");\n    }\n}\nexports[\"default\"] = CalloutCommands;\n\n\n//# sourceURL=webpack:///./main.ts?");

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