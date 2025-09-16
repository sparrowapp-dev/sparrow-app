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
import * as Sentry from "@sentry/svelte";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

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
  try {
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
  } catch (error) {
    Sentry.captureException(error);
    return jsonString;
  }
}

/**
 * Custom JavaScript autocompletion source for CodeMirror
 */
const customJsCompletions = (context: CompletionContext) => {
  // Always match the last word or after 'sp.'
  const beforeCursor = context.state.sliceDoc(0, context.pos);
  const spDotMatch = /sp\.$/.test(beforeCursor);
  const spResponseDotMatch = /sp\.response\.$/.test(beforeCursor);
  const spResponseBodyDotMatch = /sp\.response\.body\.$/.test(beforeCursor);
  const expectDotMatch = /expect\([^)]*\)\.$/.test(beforeCursor);
  const expectToDotMatch = /expect\([^)]*\)\.to\.$/.test(beforeCursor);  // expect().to.
  const expectToBeDotMatch = /expect\([^)]*\)\.to\.be\.$/.test(beforeCursor);  // expect().to.be.
  const expectToHaveDotMatch = /expect\([^)]*\)\.to\.have\.$/.test(beforeCursor);  // expect().to.have.
  const expectToHaveAllDotMatch = /expect\([^)]*\)\.to\.have\.all\.$/.test(beforeCursor);  // expect().to.have.all.
  const word = context.matchBefore(/\w*/);

  if (spResponseBodyDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "text", type: "function", info: "Get response body as text", apply: "text()" },
        { label: "json", type: "function", info: "Get response body as JSON", apply: "json()" },
      ],
    };
  }

  if (spResponseDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "statusCode", type: "variable", info: "Response status code" },
        { label: "body", type: "variable", info: "Response body object (text, json)" },
        { label: "headers", type: "variable", info: "Response headers object" },
        { label: "size", type: "variable", info: "Response size in KB" },
        { label: "time", type: "variable", info: "Response time in ms" },
      ],
    };
  }

  if (spDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "expect", type: "function", info: "Expect testcase function", apply: "expect()" },
        {
          label: "xmlToJSON",
          type: "function",
          info: "Convert XML to JSON",
          apply: "xmlToJSON();"
        },
        {
          label: "response",
          type: "variable",
          info: "Get response object",
          apply: "response"
        },

        {
          label: "test",
          type: "function",
          info: "Test definition function",
          apply: `test("", function () {

});`
        },
      ],
    };
  }

  if (expectDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "to", type: "variable", info: "Matcher object for assertions" },
      ],
    };
  }

  if (expectToDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "equal", type: "function", info: "Assert actual equals expected", apply: "equal();" },
        { label: "notEqual", type: "function", info: "Assert actual not equals expected", apply: "notEqual();" },
        { label: "exist", type: "function", info: "Assert actual exists", apply: "exist();" },
        { label: "notExist", type: "function", info: "Assert actual does not exist", apply: "notExist();" },
        { label: "be", type: "variable", info: "Type and value matchers" },
        { label: "contain", type: "function", info: "Assert actual contains expected", apply: "contain();" },
        { label: "notContain", type: "function", info: "Assert actual does not contain expected", apply: "notContain();" },
        { label: "beInList", type: "function", info: "Assert actual is in list", apply: "beInList();" },
        { label: "notBeInList", type: "function", info: "Assert actual is not in list", apply: "notBeInList();" },
        { label: "have", type: "variable", info: "Object key matchers" },
      ],
    };
  }

  if (expectToBeDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "a", type: "function", info: "Assert actual equals expected", apply: "a();" },
        { label: "true", type: "function", info: "Assert actual not equals expected", apply: "true();" },
        { label: "false", type: "function", info: "Assert actual exists", apply: "false();" },
        { label: "within", type: "function", info: "Assert actual does not exist", apply: "within( , )" },
        { label: "lessThan", type: "function", info: "Type and value matchers", apply: "lessThan();"},
        { label: "greaterThan", type: "function", info: "Assert actual contains expected", apply: "greaterThan();" },
        { label: "empty", type: "function", info: "Assert actual does not contain expected", apply: "empty();" },
        { label: "notEmpty", type: "function", info: "Assert actual is in list", apply: "notEmpty();" },
      ],
    };
  }
   if (expectToHaveDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "all", type: "variable", info: "Assert actual equals expected", },
      ],
    };
  }

   if (expectToHaveAllDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "keys", type: "function", info: "Assert actual is in list", apply: "keys();" },
      ],
    };
  }

  // Always show completions if typing a word or explicitly triggered
  if (!word && !context.explicit) {
    return {
      from: context.pos,
      options: [
        { label: "sp", type: "variable", info: "Sparrow testcase object 'sp'" },
        { label: "log", type: "function", info: "Log output" },
        { label: "document", type: "variable", info: "Document object" },
        { label: "window", type: "variable", info: "Window object" },
        { label: "setTimeout", type: "function", info: "Set a timer" },
        { label: "setInterval", type: "function", info: "Set interval timer" },
      ],
    };
  }

  return {
    from: word ? word.from : context.pos,
    options: [
      { label: "sp", type: "variable", info: "Custom object 'sp'" },
      { label: "log", type: "function", info: "Log output" },
      { label: "document", type: "variable", info: "Document object" },
      { label: "window", type: "variable", info: "Window object" },
      { label: "setTimeout", type: "function", info: "Set a timer" },
      { label: "setInterval", type: "function", info: "Set interval timer" },
    ],
  };
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
          effects: languageConf.reconfigure([
            javascript({ jsx: true, typescript: true }),
            autocompletion({ override: [customJsCompletions] }),
          ]),
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
