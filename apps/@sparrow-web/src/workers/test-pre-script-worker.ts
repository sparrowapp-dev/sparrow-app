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
  const { javaScriptTestCases, request, env, auth } = e.data;
debugger;
// const headersObject = Object.fromEntries(
//                   JSON.parse(decodeData[2]).map(({ key, value }) => [
//                     key,
//                     value,
//                   ]),
//                 );
//            let reqBody;
//                 if (decodeData[4] === "application/json") {
//                   // tried to handle js but that is treated as text/plain, skipping that for now
//                   try {
//                     reqBody = JSON.stringify(JSON.parse(decodeData[3]));
//                   } catch (e) {
//                     reqBody = JSON.stringify({});
//                   }
//                 } else if (
//                   decodeData[4] === "multipart/form-data" ||
//                   decodeData[4] === "application/x-www-form-urlencoded"
//                 ) {
//                   const formDataObject = Object.fromEntries(
//                     JSON.parse(decodeData[3]).map(({ key, value }) => [
//                       key,
//                       value,
//                     ]),
//                   );
//                   reqBody = JSON.stringify(formDataObject || {});
//                 } else {
//                   reqBody = decodeData[3];
//                 }

//                 const reqParam = {};
//                 const params = new URL(decodeData[0]).searchParams;

//                 for (const [key, value] of params.entries()) {
//                   reqParam[key] = value;
//                 }


//           const preRequest =  {
//                     headers: JSON.stringify(headersObject || {}),
//                     body: reqBody,
//                     parameters: JSON.stringify(reqParam || {}),
//                     url: decodeData[0],

//                   };



  const tests = [];

  const sp = {
    request: {
      body: {
       raw:{
        text: () => {
          try {
            return request?.body.raw;
          } catch {
            return "";
          }
        },
        json: () => {
          try {
            return JSON.parse(request?.body.raw);
          } catch {
            return {};
          }
        },
       },
       formdata:{
        text: () => {
          return JSON.stringify(request.body.formdata);
        },
        json: () => {
          return request.body.formdata;
        },
       },
       urlencoded: {
        text: () => {
          return JSON.stringify(request.body.urlencoded);
        },
        json: () => {
          return request.body.urlencoded;
        },
       },
      },
      url: {
        text: () => {
          return request.url;
        },
      },
      headers: {
        text: () => {
          return JSON.stringify(request.headers);
        },
        json: () => {
          return request.headers;
        },
      },
      parameters: {
        text: () => {
          return JSON.stringify(request.queryParams);
        },
        json: () => {
          return request.queryParams;
        },
      },

      method: {
        text: () => {
          return request.method;
        },
      },
      auth:{
        bearerToken : {
          text: () => {
            return request.auth.bearerToken;
          },
        },
        basicAuth:{
          username:{
            text: () => {
              return request.auth.basicAuth.username;
            },
          },
          password:{
            text: () => {
              return request.auth.basicAuth.password;
            },
          }
        },
        apiKey:{
          key:{
            text: () => {
              return request.auth.apiKey.authKey;
            }
          },
          value:{
            text: () => {
              return request.auth.apiKey.authValue;
            }
          }
        }
      }

  
    },
    test: (name, fn) => {
      try {
        fn();
        tests.push({ name, passed: true });
      } catch (err) {
        tests.push({ name, passed: false, error: err.message });
      }
    },
    environment:{
      set:(key, value)=>{
        if(key){
          for(const e of env){
            if(e.key === key){
              e.value = value || "";
              break;
            }
          }
          // if didnt found the key then add new
          if(!env.find((e)=>e.key === key)){
            env.push({key, value: value || ""});
          }
        }
      },
      get:(key)=>{
        if(key){
          for(const e of env){
            if(e.key === key){
              return e.value || "";
            }
          }
          return "";
        }
        return "";
      }
    },

    global:{
      set:(key, value)=>{
        if(key){
          for(const e of env){
            if(e.key === key){
              e.value = value || "";
              break;
            }
          }
          // if didnt found the key then add new
          if(!env.find((e)=>e.key === key)){
            env.push({key, value: value || ""});
          }
        }
      },
      get:(key)=>{
        if(key){
          for(const e of env){
            if(e.key === key){
              return e.value || "";
            }
          }
          return "";
        }
        return "";
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
    self.postMessage({ success: true, tests, request, env, auth });
  } catch (err) {
    self.postMessage({ success: false, error: `${err.name} - ${err.message}`, tests, request, env, auth });
  }
};