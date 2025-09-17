import { XMLParser } from "fast-xml-parser";

// Define expect helper (same as in your code)
 const expect = (actual: any) => ({
      to: {
        equal: (expected: any) => {
          if (actual !== expected)
            throw new Error(`Expected ${actual} to equal ${expected}`);
        },
        notEqual: (expected: any) => {
          if (actual === expected)
            throw new Error(`Expected ${actual} to not equal ${expected}`);
        },
        exist: () => {
          if (actual === undefined || actual === null)
            throw new Error(`Expected value to exist but got ${actual}`);
        },
        notExist: () => {
          if (actual !== undefined && actual !== null)
            throw new Error(`Expected value to not exist but got ${actual}`);
        },
        be: {
          a: (type: string) => {
            if (typeof actual !== type)
              throw new Error(`Expected type ${type} but got ${typeof actual}`);
          },
          true: () => {
            if (actual !== true)
              throw new Error(`Expected value to be true but got ${actual}`);
          },
          false: () => {
            if (actual !== false)
              throw new Error(`Expected value to be false but got ${actual}`);
          },
          within: (min: number, max: number) => {
            if (typeof actual !== "number")
              throw new Error(`Expected a number but got ${typeof actual}`);
            if (actual < min || actual > max)
              throw new Error(
                `Expected ${actual} to be within ${min} and ${max}`,
              );
          },
          lessThan: (expected: number) => {
            if (!(typeof actual === "number" && typeof expected === "number"))
              throw new Error(`Expected numbers for comparison`);
            if (!(actual < expected))
              throw new Error(`Expected ${actual} to be less than ${expected}`);
          },
          greaterThan: (expected: number) => {
            if (!(typeof actual === "number" && typeof expected === "number"))
              throw new Error(`Expected numbers for comparison`);
            if (!(actual > expected))
              throw new Error(
                `Expected ${actual} to be greater than ${expected}`,
              );
          },
          empty: () => {
            if (
              (Array.isArray(actual) && actual.length > 0) ||
              (typeof actual === "string" && actual.trim().length > 0) ||
              (actual &&
                typeof actual === "object" &&
                Object.keys(actual).length > 0)
            ) {
              throw new Error(
                `Expected value to be empty but got ${JSON.stringify(actual)}`,
              );
            }
          },
          notEmpty: () => {
            if (
              (Array.isArray(actual) && actual.length === 0) ||
              (typeof actual === "string" && actual.trim().length === 0) ||
              (actual &&
                typeof actual === "object" &&
                Object.keys(actual).length === 0)
            ) {
              throw new Error(`Expected value to not be empty`);
            }
          },
        },
        contain: (expected: any) => {
          if (
            (typeof actual === "string" || Array.isArray(actual)) &&
            !actual.includes(expected)
          ) {
            throw new Error(`Expected ${actual} to contain ${expected}`);
          }
        },
        notContain: (expected: any) => {
          if (
            (typeof actual === "string" || Array.isArray(actual)) &&
            actual.includes(expected)
          ) {
            throw new Error(`Expected ${actual} to not contain ${expected}`);
          }
        },
        beInList: (list: any[]) => {
          if (!Array.isArray(list))
            throw new Error(`Expected a list but got ${typeof list}`);
          if (!list.includes(actual))
            throw new Error(`Expected ${actual} to be in list ${list}`);
        },
        notBeInList: (list: any[]) => {
          if (!Array.isArray(list))
            throw new Error(`Expected a list but got ${typeof list}`);
          if (list.includes(actual))
            throw new Error(`Expected ${actual} to not be in list ${list}`);
        },
        have: {
          all: {
            keys: (...keys: string[]) => {
              const missing = keys.filter((k) => !(k in actual));
              if (missing.length > 0)
                throw new Error(`Missing keys: ${missing.join(", ")}`);
            },
          },
        },
      },
    });

self.onmessage = (e) => {
  const { javaScriptTestCases, response } = e.data;

  const tests = [];

  const sp = {
    response: {
      statusCode: Number(response?.status.split(" ")[0]),
      body: {
        text: () => {
          try {
            return response?.body;
          } catch {
            return {};
          }
        },
        json: () => {
          try {
            return JSON.parse(response?.body);
          } catch {
            return {};
          }
        },
      },
      headers: response?.headers.reduce((acc, h) => {
        acc[h.key] = h.value;
        return acc;
      }, {}),
      size: response?.size,
      time: response?.time,
    },
    test: (name, fn) => {
      try {
        fn();
        tests.push({ name, passed: true });
      } catch (err) {
        tests.push({ name, passed: false, error: err.message });
      }
    },
    xmlToJSON: (xml) => {
      const parser = new XMLParser();
      return parser.parse(xml);
    },
    expect,
  };

  try {
    const fn = new Function("sp", javaScriptTestCases);
    fn(sp);
    self.postMessage({ success: true, tests });
  } catch (err) {
    self.postMessage({ success: false, error: `${err.name} - ${err.message}` });
  }
};
