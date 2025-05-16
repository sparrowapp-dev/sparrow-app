export const FunctionOptionData = [
  {
    type: "toUpperCase()",
    description: "Converts a string to uppercase.",
    toUpperCase: (str: string) => str.toUpperCase(),
  },
  {
    type: "toLowerCase()",
    description: "Converts a string to lowercase.",
    toLowerCase: (str: string) => str.toLowerCase(),
  },
  {
    type: "parseInt()",
    description: "Converts a string to an integer.",
    parseInt: (str: string) => parseInt(str),
  },
  {
    type: "parseFloat()",
    description: "Converts a string to a floating-point number.",
    parseFloat: (str: string) => parseFloat(str),
  },
  {
    type: "isNaN()",
    description: "Checks if a value is NaN (Not a Number).",
    isNaN: (value: number) => isNaN(value),
  },
  {
    type: "trim()",
    description: "Removes whitespace from both ends of a string.",
    trim: (str: string) => str.trim(),
  },
  {
    type: "Math.abs()",
    description: "Returns the absolute value of a number.",
    abs: (num: number) => Math.abs(num),
  },
  {
    type: "Math.ceil()",
    description: "Rounds a number UP to the nearest integer.",
    ceil: (num: number) => Math.ceil(num),
  },
  {
    type: "Math.floor()",
    description: "Rounds a number DOWN to the nearest integer.",
    floor: (num: number) => Math.floor(num),
  },
  {
    type: "Math.round()",
    description: "Rounds a number to the nearest integer.",
    round: (num: number) => Math.round(num),
  },
  {
    type: "String()",
    description: "Converts any value to a string.",
    String: (value: string) => String(value),
  },
  {
    type: "Number()",
    description: "Converts a value to a number.",
    Number: (value: string) => Number(value),
  },
  {
    type: "Boolean()",
    description: "Converts a value to a Boolean.",
    Boolean: (value: boolean) => Boolean(value),
  },
  {
    type: "isFinite()",
    description: "Determines whether a value is a finite, legal number.",
    isFinite: (value: number) => isFinite(value),
  },
  {
    type: "charAt()",
    description: "Returns the character at the specified index.",
    charAt: (str: string, index: number) => str.charAt(index),
  },
  {
    type: "concat()",
    description: "Combines two or more strings.",
    concat: (str1: string, str2: string) => str1.concat(str2),
  },
  {
    type: "includes()",
    description: "Checks if a string contains the specified substring.",
    includes: (str: string, substring: string) => str.includes(substring),
  },
  {
    type: "indexOf()",
    description:
      "Returns the index of the first occurrence of a specified value.",
    indexOf: (str: string, value: string) => str.indexOf(value),
  },
  {
    type: "JSON.stringify()",
    description: "Converts a JS object into a JSON string.",
    example: (obj: any) => JSON.stringify(obj),
  },
  {
    type: "JSON.parse()",
    description: "Parses a JSON string and converts it into a Js object.",
    example: (jsonString: string) => JSON.parse(jsonString),
  },
];
