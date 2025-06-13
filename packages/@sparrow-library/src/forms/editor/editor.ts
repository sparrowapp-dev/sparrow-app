import type { Compartment } from "@codemirror/state";
import type { EditorView } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { RequestDataType } from "@sparrow/common/enums";
import { html } from "@codemirror/lang-html";
import { jsonSetup } from "./theme";
import { xml } from "@codemirror/lang-xml";
import { html_beautify, js_beautify } from "js-beautify";

/**
 * @description - remove indentation from the string
 * @param code - text that should be shown on code mirror view
 * @returns - plain text code without indentation
 */
const removeIndentation = (str: string = "") => {
  // Split the code into lines
  const lines = str.split("\n");
  // Remove leading whitespace from each line
  const unindentedLines = lines.map((line) => line.trim());
  // Join the lines back together
  return unindentedLines.join("\n");
};

/**
 * @description - format Python code
 * @param code - Python code string
 * @returns - formatted Python code
 */
const formatPython = (code: string): string => {
  const lines = code.split('\n');
  let indentLevel = 0;
  let formattedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // Skip empty lines but preserve them
    if (!trimmedLine) {
      formattedLines.push('');
      continue;
    }
    
    // Dedent keywords that should be at the same level as the previous block
    if (trimmedLine.match(/^(elif|else|except|finally)\b/)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Add proper spacing around operators and after commas/colons
    let formattedLine = trimmedLine
      .replace(/([^=!<>])=([^=])/g, '$1 = $2') // Add spaces around assignment
      .replace(/,(\S)/g, ', $1') // Add space after commas
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();
    
    // Apply indentation
    const indentedLine = '    '.repeat(indentLevel) + formattedLine;
    formattedLines.push(indentedLine);
    
    // Increase indent level after lines ending with colon
    if (formattedLine.endsWith(':') && !formattedLine.startsWith('#')) {
      indentLevel++;
    }
  }
  
  return formattedLines.join('\n');
};

/**
 * @description - format shell/curl commands
 * @param code - shell code string
 * @returns - formatted shell code
 */
const formatShell = (code: string): string => {
  // Basic shell formatting - mainly for curl commands
  return code
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*\\\s*/g, ' \\\n  ') // Format line continuations
    .trim();
};

/**
 * @description - adds syntax highlighting and formatting to code mirror view
 * @param codeMirrorView - code mirror constructor object
 * @param languageConf - dynamic configuration for code mirror
 * @param lang - language to check syntax and formatting
 * @param isFormatted - insure code is formatted or not
 * @param value - text that should be shown on code mirror view
 * @returns
 */
const handleCodeMirrorSyntaxFormat = (
  codeMirrorView: EditorView,
  languageConf: Compartment,
  lang: RequestDataType,
  isFormatted: boolean,
  value: string,
  beautifySyntaxCallback: (value: boolean) => void,
) => {
  switch (lang) {
    case RequestDataType.HTML:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: html_beautify(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(
            html({
              matchClosingTags: true,
              selfClosingTags: true,
              autoCloseTags: true,
            }),
          ),
          ...payload,
        });
        beautifySyntaxCallback(false);
        return;
      }
      break;
    case RequestDataType.JAVASCRIPT:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: js_beautify(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(
            javascript({ jsx: true, typescript: true }),
          ),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;

    case "Python":
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: formatPython(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(python()),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
    case "Curl":
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: formatShell(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(StreamLanguage.define(shell)),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
    case RequestDataType.GRAPHQL:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: js_beautify(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(
            javascript({ jsx: false, typescript: false }),
          ),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
    case RequestDataType.JSON:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: js_beautify(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(jsonSetup),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
    case RequestDataType.XML:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: html_beautify(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure(xml()),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
    default:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: removeIndentation(value),
            },
          };
        }
        codeMirrorView.dispatch({
          effects: languageConf.reconfigure([]),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
  }
};

export default handleCodeMirrorSyntaxFormat;