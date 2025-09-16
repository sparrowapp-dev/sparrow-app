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
const testJsCompletions = (context: CompletionContext) => {
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
      validFor: /^\w*$/,
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
      validFor: /^\w*$/,
    };
  }

  // Always show completions for 'sp.' and similar triggers, even if a word is present
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
      validFor: /^\w*$/,
    };
  }

  if (expectDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "to", type: "variable", info: "Matcher object for assertions" },
      ],
      validFor: /^\w*$/,
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
      validFor: /^\w*$/,
    };
  }

  if (expectToBeDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "a", type: "function", info: "Assert actual is of type", apply: "a();" },
        { label: "true", type: "function", info: "Assert actual is true", apply: "true();" },
        { label: "false", type: "function", info: "Assert actual is false", apply: "false();" },
        { label: "within", type: "function", info: "Assert actual is within range", apply: "within( , )" },
        { label: "lessThan", type: "function", info: "Assert actual is less than expected", apply: "lessThan();"},
        { label: "greaterThan", type: "function", info: "Assert actual is greater than expected", apply: "greaterThan();" },
        { label: "empty", type: "function", info: "Assert actual is empty", apply: "empty();" },
        { label: "notEmpty", type: "function", info: "Assert actual is not empty", apply: "notEmpty();" },
      ],
      validFor: /^\w*$/,
    };
  }
   if (expectToHaveDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "all", type: "variable", info: "Assert actual has all expected properties", },
      ],
      validFor: /^\w*$/,
    };
  }

   if (expectToHaveAllDotMatch) {
    return {
      from: context.pos,
      options: [
        { label: "keys", type: "function", info: "Assert actual has all expected keys", apply: "keys();" },
      ],
      validFor: /^\w*$/,
    };
  }

  return {
    from: word ? word.from : context.pos,
    options: [
      { label: "sp", type: "variable", info: "Sparrow object 'sp'" },
      { label: "Array", type: "class", info: "JavaScript Array constructor" },
      { label: "Object", type: "class", info: "JavaScript Object constructor" },
      { label: "String", type: "class", info: "JavaScript String constructor" },
      { label: "Number", type: "class", info: "JavaScript Number constructor" },
      { label: "Boolean", type: "class", info: "JavaScript Boolean constructor" },
      { label: "Math", type: "namespace", info: "Math functions and constants" },
      { label: "JSON", type: "namespace", info: "JSON utilities" },
      { label: "parseInt", type: "function", info: "Parse string to integer", apply: "parseInt()" },
      { label: "parseFloat", type: "function", info: "Parse string to float", apply: "parseFloat()" },
      { label: "Date", type: "class", info: "JavaScript Date constructor" },
      { label: "Promise", type: "class", info: "JavaScript Promise constructor" },
      { label: "for", type: "keyword", info: "For loop", apply: "for (let i = 0; i < ; i++) {\n  \n}" },
      { label: "foreach", type: "keyword", info: "Array forEach loop", apply: ".forEach((item) => {\n  \n});" },
      { label: "let", type: "keyword", info: "Declare block-scoped variable", apply: "let " },
      { label: "const", type: "keyword", info: "Declare constant variable", apply: "const " },
      { label: "var", type: "keyword", info: "Declare function-scoped variable", apply: "var " },
      { label: "if", type: "keyword", info: "If statement", apply: "if () {\n  \n}" },
      { label: "else", type: "keyword", info: "Else statement", apply: "else {\n  \n}" },
      { label: "while", type: "keyword", info: "While loop", apply: "while () {\n  \n}" },
      { label: "do", type: "keyword", info: "Do-while loop", apply: "do {\n  \n} while ();" },
      { label: "switch", type: "keyword", info: "Switch statement", apply: "switch () {\n  case :\n    break;\n  default:\n    break;\n}" },
      { label: "case", type: "keyword", info: "Case in switch", apply: "case :\n  break;" },
      { label: "break", type: "keyword", info: "Break statement", apply: "break;" },
      { label: "continue", type: "keyword", info: "Continue statement", apply: "continue;" },
      { label: "return", type: "keyword", info: "Return statement", apply: "return;" },
      { label: "function", type: "keyword", info: "Function declaration", apply: "function name() {\n  \n}" },
      { label: "try", type: "keyword", info: "Try block", apply: "try {\n  \n} catch (e) {\n  \n} finally {\n  \n}" },
    ],
    validFor: /^\w*$/,
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
          ]),
          ...payload,
        });
        beautifySyntaxCallback(false);
      }
      break;
    case RequestDataType.TESTJAVASCRIPT:
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
            autocompletion({ override: [testJsCompletions] }),
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
