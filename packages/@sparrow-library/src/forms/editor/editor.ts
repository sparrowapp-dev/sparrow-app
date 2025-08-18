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
 * @description Formats JSON string by fixing brace and bracket indentation patterns to improve readability.
 * Specifically handles arrays of objects by ensuring proper newlines and indentation for:
 * - Opening `[{` patterns
 * - Comma-separated objects `}, {` in arrays
 * - Closing `}]` patterns
 * - Various edge cases at different indentation levels
 *
 * @param {string} jsonString - The JSON string to format (can be minified or poorly formatted)
 * @param {number} [indentLevel=4] - Number of spaces to use for each indentation level (default: 4)
 *
 * @returns {string} A newly formatted JSON string with consistent brace/bracket indentation
 */
function fixJsonBraces(jsonString: string, indentLevel: number = 4): string {
  const INDENT: string = " ".repeat(indentLevel);

  const lastLineIndent = (str: string, offset: number): string => {
    const before: string = str.slice(0, offset);
    const lines: string[] = before.split("\n");
    const lastLine: string = lines[lines.length - 1];
    const m: RegExpMatchArray | null = lastLine.match(/^\s*/);
    return m ? m[0] : "";
  };

  const outdentOnce = (indent: string): string =>
    indent.length >= INDENT.length
      ? indent.slice(0, indent.length - INDENT.length)
      : "";

  // 1) Ensure [{ starts on a new line and { is one level deeper than [
  jsonString = jsonString.replace(
    /(\[\s*)\{/g,
    (match: string, open: string, offset: number, str: string) => {
      const indent: string = lastLineIndent(str, offset); // indent of line containing [
      return "[\n" + indent + INDENT + "{";
    },
  );

  // 2) Ensure }, { becomes a newline with { aligned to the SAME indent for all siblings
  // Use arrayIndent = outdent(objectIndent). Siblings go at arrayIndent + INDENT.
  jsonString = jsonString.replace(
    /\}\s*,\s*\{/g,
    (match: string, offset: number, str: string) => {
      const objectIndent: string = lastLineIndent(str, offset); // indent of the line with }
      const arrayIndent: string = outdentOnce(objectIndent);
      return "},\n" + arrayIndent + INDENT + "{";
    },
  );

  // 3) Ensure }] has ] on its own line, OUTDENTED one level relative to object indent
  jsonString = jsonString.replace(
    /\}\s*\]/g,
    (match: string, offset: number, str: string) => {
      const objectIndent: string = lastLineIndent(str, offset); // indent of the line with }
      const arrayIndent: string = outdentOnce(objectIndent);
      return "}\n" + arrayIndent + "]";
    },
  );

  // 4) Handle top-of-string case: [{ at the very start
  jsonString = jsonString.replace(
    /^\[\s*\{/m,
    (match: string, offset: number, str: string) => {
      const indent: string = lastLineIndent(str, offset);
      return "[\n" + indent + INDENT + "{";
    },
  );

  // 5) Normalization pass: any { that starts a new array sibling after a comma,
  // align it to arrayIndent + INDENT as well (catches odd inputs)
  jsonString = jsonString.replace(
    /,\s*\n\s*\{/g,
    (match: string, offset: number, str: string) => {
      // objectIndent = indent of the comma's line (same as previous object)
      const objectIndent: string = lastLineIndent(str, offset);
      const arrayIndent: string = outdentOnce(objectIndent);
      return ",\n" + arrayIndent + INDENT + "{";
    },
  );

  return jsonString;
}

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

    case RequestDataType.PYTHON:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: value, // manual beautification is done, as beautify lib. is not available for python
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
    case RequestDataType.CURL:
      if (codeMirrorView) {
        let payload = {};
        if (isFormatted) {
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: value, // manual beautification is done, as beautify lib. is not available for curl
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
          let beautified = fixJsonBraces(js_beautify(value));
          beautified = fixJsonBraces(js_beautify(beautified));
          payload = {
            changes: {
              from: 0,
              to: codeMirrorView.state.doc.length,
              insert: beautified,
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
