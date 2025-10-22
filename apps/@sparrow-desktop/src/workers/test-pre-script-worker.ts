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
  const tests: any[] = [];

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
        set: (data: string) => {
          request.body.raw = data  || "";
        },
       },
       formdata:{
        text: () => {
          return JSON.stringify(request.body.formdata);
        },
        json: () => {
          return request.body.formdata;
        },
        set: (key: any, value: any) => {
          if (!request.body.formdata) request.body.formdata = [];
          const existingIndex = request.body.formdata.findIndex((item: any) => item.key === key);
          if (existingIndex !== -1) {
            request.body.formdata[existingIndex].value = value;
          } else {
            request.body.formdata.push({ key, value, checked: true });
          }
        },
        get: (key: any) => {
          if (!request.body.formdata) return "";
          const item = request.body.formdata.find((item: any) => item.key === key);
          return item ? item.value : "";
        },
        remove: (key: any) => {
          if (request.body.formdata) {
            request.body.formdata = request.body.formdata.filter((item: any) => item.key !== key);
          }
        },
        clear: () => {
          request.body.formdata = [];
        },
        has: (key: any) => {
          if (!request.body.formdata) return false;
          return request.body.formdata.some((item: any) => item.key === key);
        },
        enable: (key: any) => {
          if (request.body.formdata) {
            const item = request.body.formdata.find((item: any) => item.key === key);
            if (item) item.checked = true;
          }
        },
        disable: (key: any) => {
          if (request.body.formdata) {
            const item = request.body.formdata.find((item: any) => item.key === key);
            if (item) item.checked = false;
          }
        },
        isChecked: (key: any) => {
          if (request.body.formdata) {
            const item = request.body.formdata.find((item: any) => item.key === key);
            if (item) return item.checked;
          }
          return false;
        },
       },
       urlencoded: {
        text: () => {
          return JSON.stringify(request.body.urlencoded);
        },
        json: () => {
          return request.body.urlencoded;
        },
        set: (key: any, value: any) => {
          if (!request.body.urlencoded) request.body.urlencoded = [];
          const existingIndex = request.body.urlencoded.findIndex((item: any) => item.key === key);
          if (existingIndex !== -1) {
            request.body.urlencoded[existingIndex].value = value;
          } else {
            request.body.urlencoded.push({ key, value, checked: true });
          }
        },
        get: (key: any) => {
          if (!request.body.urlencoded) return "";
          const item = request.body.urlencoded.find((item: any) => item.key === key);
          return item ? item.value : "";
        },
        remove: (key: any) => {
          if (request.body.urlencoded) {
            request.body.urlencoded = request.body.urlencoded.filter((item: any) => item.key !== key);
          }
        },
        clear: () => {
          request.body.urlencoded = [];
        },
        has: (key: any) => {
          if (!request.body.urlencoded) return false;
          return request.body.urlencoded.some((item: any) => item.key === key);
        },
        enable: (key: any) => {
          if (request.body.urlencoded) {
            const item = request.body.urlencoded.find((item: any) => item.key === key);
            if (item) item.checked = true;
          }
        },
        disable: (key: any) => {
          if (request.body.urlencoded) {
            const item = request.body.urlencoded.find((item: any) => item.key === key);
            if (item) item.checked = false;
          }
        },
        isChecked: (key: any) => {
          if (request.body.urlencoded) {
            const item = request.body.urlencoded.find((item: any) => item.key === key);
            if (item) return item.checked;
          }
          return false;
        }
       }
      },
      url: {
        text: () => {
          return request.url;
        },
        set: (newUrl: any) => {
          request.url = newUrl;
        },
        getBaseUrl: () => {
          try {
            const url = new URL(request.url);
            return `${url.protocol}//${url.host}`;
          } catch {
            return "";
          }
        },
        getPath: () => {
          try {
            const url = new URL(request.url);
            return url.pathname;
          } catch {
            return "";
          }
        },
      },
      headers: {
        text: () => {
          return JSON.stringify(request.headers);
        },
        json: () => {
          return request.headers;
        },
        set: (key: any, value: any) => {
          if (!request.headers) request.headers = [];
          const existingIndex = request.headers.findIndex((item: any) => item.key === key);
          if (existingIndex !== -1) {
            request.headers[existingIndex].value = value;
          } else {
            request.headers.push({ key, value, checked: true });
          }
        },
        get: (key: any) => {
          if (!request.headers) return "";
          const item = request.headers.find((item: any) => item.key === key);
          return item ? item.value : "";
        },
        remove: (key: any) => {
          if (request.headers) {
            request.headers = request.headers.filter((item: any) => item.key !== key);
          }
        },
        clear: () => {
          request.headers = [];
        },
        has: (key: any) => {
          if (!request.headers) return false;
          return request.headers.some((item: any) => item.key === key);
        },
        enable: (key: any) => {
          if (request.headers) {
            const item = request.headers.find((item: any) => item.key === key);
            if (item) item.checked = true;
          }
        },
        disable: (key: any) => {
          if (request.headers) {
            const item = request.headers.find((item: any) => item.key === key);
            if (item) item.checked = false;
          }
        },
        isChecked: (key: any) => {
          if (!request.headers) return false;
          const item = request.headers.find((item: any) => item.key === key);
          return item ? item.checked : false;
        },
      },
      parameters: {
        text: () => {
          return JSON.stringify(request.queryParams);
        },
        json: () => {
          return request.queryParams;
        },
        set: (key: any, value: any) => {
          if (!request.queryParams) request.queryParams = [];
          const existingIndex = request.queryParams.findIndex((item: any) => item.key === key);
          if (existingIndex !== -1) {
            request.queryParams[existingIndex].value = value;
          } else {
            request.queryParams.push({ key, value, checked: true });
          }
        },
        get: (key: any) => {
          if (!request.queryParams) return "";
          const item = request.queryParams.find((item: any) => item.key === key);
          return item ? item.value : "";
        },
        remove: (key: any) => {
          if (request.queryParams) {
            request.queryParams = request.queryParams.filter((item: any) => item.key !== key);
          }
        },
        clear: () => {
          request.queryParams = [];
        },
        has: (key: any) => {
          if (!request.queryParams) return false;
          return request.queryParams.some((item: any) => item.key === key);
        },
        enable: (key: any) => {
          if (request.queryParams) {
            const item = request.queryParams.find((item: any) => item.key === key);
            if (item) item.checked = true;
          }
        },
        disable: (key: any) => {
          if (request.queryParams) {
            const item = request.queryParams.find((item: any) => item.key === key);
            if (item) item.checked = false;
          }
        },
        isChecked: (key: any) => {
          if (!request.queryParams) return false;
          const item = request.queryParams.find((item: any) => item.key === key);
          return item ? item.checked : false;
        },

      },

      method: {
        text: () => {
          return request.method;
        },
        set: (newMethod: any) => {
          const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
          if (validMethods.includes(newMethod.toUpperCase())) {
            request.method = newMethod.toUpperCase();
          } else {
            throw new Error(`Invalid HTTP method: ${newMethod}`);
          }
        },
      },
      auth:{
        bearerToken : {
          text: () => {
            return request.auth?.bearerToken || "";
          },
          set: (token: any) => {
            request.auth.bearerToken = token || "";
          },
          clear: () => {
            request.auth.bearerToken = "";
          },
        },
        basicAuth:{
          username:{
            text: () => {
              return request.auth?.basicAuth?.username || "";
            },
            set: (username: any) => {
              request.auth.basicAuth.username = username || "";
            },
          },
          password:{
            text: () => {
              return request.auth?.basicAuth?.password || "";
            },
            set: (password: any) => {
              request.auth.basicAuth.password = password || "";
            },
          },
          set: (username: any, password: any) => {
            request.auth.basicAuth.username = username || "";
            request.auth.basicAuth.password = password || "";
          },
          clear: () => {
              request.auth.basicAuth.password = "";
              request.auth.basicAuth.username = "";
          },
        },
        apiKey:{
          key:{
            text: () => {
              return request.auth?.apiKey?.authKey || "";
            },
            set: (key: any) => {
              request.auth.apiKey.authKey = key || "";
            },
          },
          value:{
            text: () => {
              return request.auth?.apiKey?.authValue || "";
            },
            set: (value: any) => {
              request.auth.apiKey.authValue = value || "";
            },
          },
          set: (key: any, value: any) => {
            request.auth.apiKey.authKey = key || "";
            request.auth.apiKey.authValue = value || "";
          },
          clear: () => {
            request.auth.apiKey.authKey = "";
            request.auth.apiKey.authValue =  "";
          },
        },
        clear: () => {
          request.auth.apiKey.authKey = "";
          request.auth.apiKey.authValue =  "";
          request.auth.bearerToken = "";
          request.auth.basicAuth.password = "";
          request.auth.basicAuth.username = "";
        }
      }
    },
    test: (name: any, fn: any) => {
      try {
        fn();
        tests.push({ name, passed: true });
      } catch (err: any) {
        tests.push({ name, passed: false, error: err.message });
      }
    },
    environment:{
      set:(key: any, value: any)=>{
        if(key){
          for(const e of env){
            if(e.key === key && e.type === "E"){
              e.value = value || "";
              break;
            }
          }
          // if didnt found the key then add new
          if(!env.find((e: any)=>e.key === key && e.type === "E")){
            env.unshift({key, value: value || "", type: "E"});
          }
        }
      },
      get:(key: any)=>{
        if(key){
          for(const e of env){
            if(e.key === key && e.type === "E"){
              return e.value || "";
            }
          }
          return "";
        }
        return "";
      }
    },

    global:{
      set:(key: any, value: any)=>{
        if(key){
          for(const e of env){
            if(e.key === key && e.type === "G"){
              e.value = value || "";
              break;
            }
          }
          // if didnt found the key then add new
          if(!env.find((e: any)=>e.key === key  && e.type === "G")){
            env.push({key, value: value || "", type: "G"});
          }
        }
      },
      get:(key: any)=>{
        if(key){
          for(const e of env){
            if(e.key === key  && e.type === "G"){
              return e.value || "";
            }
          }
          return "";
        }
        return "";
      }
    },
    uuid: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    xmlToJSON: (xml: any) => {
      const parser = new XMLParser();
      return parser.parse(xml);
    },
    expect
  };

  try {
    const fn = new Function("sp", javaScriptTestCases);
    fn(sp);
    self.postMessage({ success: true, tests, request, env, auth });
  } catch (err: any) {
    self.postMessage({ success: false, error: `${err.name} - ${err.message}`, tests, request, env, auth });
  }
};
