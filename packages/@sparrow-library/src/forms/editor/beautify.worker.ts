/**
 * Web Worker for code beautification
 * Runs js_beautify and html_beautify off the main thread to prevent UI freezing
 */

import { html_beautify, js_beautify } from "js-beautify";

// Message types for communication with main thread
interface BeautifyRequest {
  id: number;
  type: "json" | "javascript" | "html" | "xml";
  value: string;
}

interface BeautifyResponse {
  id: number;
  result: string;
  error?: string;
}

/**
 * @description Formats JSON string by fixing brace and bracket indentation patterns
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

    jsonString = jsonString.replace(
      /(\[\s*)\{/g,
      (match: string, open: string, offset: number, str: string) => {
        const indent: string = lastLineIndent(str, offset);
        return "[\n" + indent + INDENT + "{";
      },
    );

    jsonString = jsonString.replace(
      /\}\s*,\s*\{/g,
      (match: string, offset: number, str: string) => {
        const objectIndent: string = lastLineIndent(str, offset);
        const arrayIndent: string = outdentOnce(objectIndent);
        return "},\n" + arrayIndent + INDENT + "{";
      },
    );

    jsonString = jsonString.replace(
      /\}\s*\]/g,
      (match: string, offset: number, str: string) => {
        const objectIndent: string = lastLineIndent(str, offset);
        const arrayIndent: string = outdentOnce(objectIndent);
        return "}\n" + arrayIndent + "]";
      },
    );

    jsonString = jsonString.replace(
      /^\[\s*\{/m,
      (match: string, offset: number, str: string) => {
        const indent: string = lastLineIndent(str, offset);
        return "[\n" + indent + INDENT + "{";
      },
    );

    jsonString = jsonString.replace(
      /,\s*\n\s*\{/g,
      (match: string, offset: number, str: string) => {
        const objectIndent: string = lastLineIndent(str, offset);
        const arrayIndent: string = outdentOnce(objectIndent);
        return ",\n" + arrayIndent + INDENT + "{";
      },
    );

    return jsonString;
  } catch (error) {
    return jsonString;
  }
}

self.onmessage = (event: MessageEvent<BeautifyRequest>) => {
  const { id, type, value } = event.data;

  try {
    let result: string;

    switch (type) {
      case "json": {
        try {
          // Use native JSON.stringify which is much faster than js_beautify
          const parsed = JSON.parse(value);
          const formatted = JSON.stringify(parsed, null, 2);

          // Skip fixJsonBraces for large files (> 1MB) - it's too slow with regex
          // Native JSON.stringify already produces nicely formatted JSON
          if (formatted.length > 1_000_000) {
            result = formatted;
          } else {
            // Apply fixJsonBraces for smaller files to clean up array formatting
            result = fixJsonBraces(formatted);
          }
        } catch (parseError) {
          // If JSON parsing fails, fall back to js_beautify for invalid JSON
          result = js_beautify(value);
        }
        break;
      }
      case "javascript":
        result = js_beautify(value);
        break;
      case "html":
      case "xml":
        result = html_beautify(value);
        break;
      default:
        result = value;
    }

    const response: BeautifyResponse = { id, result };
    self.postMessage(response);
  } catch (error) {
    console.error("Worker error:", error);
    const response: BeautifyResponse = {
      id,
      result: value,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    self.postMessage(response);
  }
};
