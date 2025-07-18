<script lang="ts">
  import { Debounce } from "@sparrow/common/utils";
  import { TickMarkRoundedIcon as TickMark } from "@sparrow/library/assets";
  import { Spinner } from "@sparrow/library/ui";
  import * as curlconverter from "curlconverter";
  import type { TransformedRequest } from "@sparrow/common/types/workspace/collection-base";

  let importCurl = "";
  let parsedCurlData: TransformedRequest | null = null;

  export let workspaceId: string;
  export let onClosePopup: () => void;
  export let onItemImported: (entityType: string, args: any) => void;

  let isInputTouched = false;
  let isCurlValid = false;
  let isCurlDataLoading = false;
  let isLoading = false;
  let isMethodWrong = false;

  const handleFormatCurl = (curlCommand: string): string => {
    // 0. Extract $'…' raw-string literal (if present)
    const rawLiteralRegex = /(\$'[\s\S]*?')$/m;
    let rawLiteral = "";
    const rawMatch = curlCommand.match(rawLiteralRegex);
    if (rawMatch) {
      rawLiteral = rawMatch[0];
      curlCommand = curlCommand.slice(0, rawMatch.index).trim();
    }

    // 1. Extract heredoc (if present)
    const heredocRegex = /(<<\s*EOF[\s\S]*?^EOF\s*)$/m;
    const heredocMatch = curlCommand.match(heredocRegex);
    let heredoc = "";
    if (heredocMatch) {
      heredoc = heredocMatch[0]
        .replace(/\r\n/g, "\n") // Normalize newlines
        .replace(/^\s+|\s+$/g, ""); // Trim
      // Remove heredoc from command
      curlCommand = curlCommand.slice(0, heredocMatch.index).trim();
    }

    // 2. Remove line continuations (backslash + optional spaces/newlines) only in main cURL
    curlCommand = curlCommand.replace(/\\\s*\n\s*/g, " ");
    curlCommand = curlCommand.replace(/\\\s*/g, " ");

    // 3. Normalize whitespace
    curlCommand = curlCommand.replace(/\s+/g, " ").trim();

    // 4. Tokenize: quoted substrings or non-space
    const parts = curlCommand.match(/"[^"]*"|'[^']*'|\S+/g) || [];

    // 5. Build formatted command
    let formatted = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0) {
        formatted += part; // 'curl'
      } else if (
        part.startsWith("--") ||
        (part.startsWith("-") && !/^-\d/.test(part))
      ) {
        formatted += " \\\n  " + part;
      } else if (
        /^https?:\/\//.test(part) ||
        /^\$\{.*\}/.test(part) ||
        /^[\w\/:.?&=%-]+$/.test(part)
      ) {
        if (parts[i - 1] && parts[i - 1].startsWith("--request")) {
          formatted += " " + part;
        } else {
          formatted += " \\\n  " + part;
        }
      } else {
        formatted += " " + part;
      }
    }

    // 6. Append heredoc block if present
    if (heredoc) {
      const [firstLine, ...restLines] = heredoc.split("\n");
      formatted += " \\\n  " + firstLine + "\n" + restLines.join("\n");
    }

    // 7. Re-attach rawLiteral if it wasn’t already consumed
    if (rawLiteral && !formatted.includes(rawLiteral)) {
      formatted += ` \\\n  ${rawLiteral}`;
    }

    return formatted.trim();
  };

  const handleFormatUrl = (url: string) => {
    url = url.replace(/^(https?:\/\/\s*)+(https?:\/\/)/, "$2");
    return url;
  };

  const transformRequest = (requestObject: any, username: string) => {
    const keyValueDefaultObj = {
      key: "",
      value: "",
      checked: false,
    };
    const formDataFileDefaultObj = {
      key: "",
      value: "",
      checked: false,
      base: "",
    };
    let method = requestObject.method.toUpperCase();
    if (
      method !== "GET" &&
      method !== "POST" &&
      method !== "PUT" &&
      method !== "PATCH" &&
      method !== "DELETE"
    ) {
      method = "INVALID";
    }

    const url = handleFormatUrl(requestObject.raw_url);
    const transformedObject: TransformedRequest = {
      name: url || "",
      description: "",
      type: "REQUEST",
      source: "USER",
      request: {
        method: method,
        url: url ?? "",
        body: {
          raw: "",
          urlencoded: [],
          formdata: {
            text: [],
            file: [],
          },
        },
        headers: [],
        queryParams: [],
        auth: {
          bearerToken: "",
          basicAuth: {
            username: "",
            password: "",
          },
          apiKey: {
            authKey: "",
            authValue: "",
            addTo: "Header",
          },
        },
        selectedRequestBodyType: "none",
        selectedRequestAuthType: "No Auth",
      },
      createdBy: username,
      updatedBy: username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Extract the query parameter from the URL
    const queryString = url.split("?")[1];
    const queryParams = [];
    if (queryString) {
      const pairs = queryString.split("&");
      for (const pair of pairs) {
        const [key, rawValue] = pair.split("=");
        const value = rawValue || "";
        queryParams.push({ key, value, checked: true });

        if (
          key.toLowerCase() === "api-key" ||
          key.toLowerCase() === "x-api-key"
        ) {
          transformedObject.request!.auth.apiKey = {
            authKey: key,
            authValue: value,
            addTo: "Query Parameter",
          };
          transformedObject.request!.selectedRequestAuthType = "API Key";
        }
      }
      queryParams.push({ key: "", value: "", checked: false });

      transformedObject.request!.queryParams = queryParams;
      transformedObject.request!.url = url;
    }
    let isFormData = false;

    // Handle request body based on Content-Type
    if (requestObject?.data || requestObject?.files) {
      const contentType =
        requestObject?.headers?.["content-type"] ||
        requestObject?.headers?.["Content-Type"] ||
        "";
      if (contentType.startsWith("multipart/form-data")) {
        isFormData = true;
        const boundary = contentType.split("boundary=")[1];
        if (contentType.includes("boundary=")) {
          const formDataParts = requestObject.data.split(`--${boundary}\r\n`);
          formDataParts.shift(); // Remove the first boundary part

          for (const part of formDataParts) {
            const lines = part.trim().split("\r\n");
            const disposition = lines[0]; // Content-Disposition line
            if (disposition.includes('name="_method"')) {
              // Ignore the _method part
              continue;
            }
            const key = disposition.split('name="')[1].split('"')[0];
            let value = "";

            if (lines.length > 2) {
              value = lines.slice(2).join("\r\n").trim(); // Extract value from part content
            }

            if (value.includes(boundary)) {
              value = "";
            }

            if (
              disposition.includes('Content-Disposition: form-data; name="')
            ) {
              transformedObject.request!.body.formdata!.text.push({
                key,
                value,
                checked: true,
              });
            } else if (
              disposition.includes(
                'Content-Disposition: form-data; name="file"',
              ) &&
              value.startsWith("/")
            ) {
              transformedObject.request!.body.formdata!.text.push({
                key,
                value: "",
                checked: true,
              });
            }
          }
        } else {
          // Handle case where no boundary is present
          try {
            // Try to parse the body data
            const bodyData =
              typeof requestObject.data === "string"
                ? JSON.parse(requestObject.data)
                : requestObject.data;

            // If bodyData is an object, convert its key-value pairs
            if (typeof bodyData === "object" && bodyData !== null) {
              Object.entries(bodyData).forEach(([key, value]) => {
                // Check if the value appears to be a file path
                if (typeof value === "string" && value.startsWith("/")) {
                  transformedObject.request!.body.formdata!.text.push({
                    key,
                    value: "",
                    checked: true,
                  });
                } else {
                  transformedObject.request!.body.formdata!.text.push({
                    key,
                    value: String(value),
                    checked: true,
                  });
                }
              });
            }
          } catch (error) {
            // If parsing fails, try to handle it as a plain string
            if (typeof requestObject.data === "string") {
              // Split by common form data delimiters
              const pairs = requestObject.data.split(/[&\n]/).filter(Boolean);
              pairs.forEach((pair: any) => {
                const [key, value] = pair.split("=").map(decodeURIComponent);
                if (value && value.startsWith("/")) {
                  transformedObject.request!.body.formdata!.text.push({
                    key,
                    value: "",
                    checked: true,
                  });
                } else {
                  transformedObject.request!.body.formdata!.text.push({
                    key,
                    value: value || "",
                    checked: true,
                  });
                }
              });
            }
          }
        }
        transformedObject.request!.selectedRequestBodyType =
          "multipart/form-data";
      } else if (contentType.includes("application/json")) {
        try {
          transformedObject.request!.body.raw = JSON.stringify(
            requestObject.data,
            null,
            2,
          );
        } catch (error) {
          console.warn("Error parsing request body JSON:", error);
          transformedObject.request!.body.raw = requestObject.data;
        }
        transformedObject.request!.selectedRequestBodyType = "application/json";
      } else if (contentType.includes("application/javascript")) {
        transformedObject.request!.selectedRequestBodyType =
          "application/javascript";
      } else if (contentType.includes("text/html")) {
        transformedObject.request!.selectedRequestBodyType = "text/html";
      } else if (
        contentType.includes("application/xml") ||
        contentType.includes("text/xml")
      ) {
        transformedObject.request!.selectedRequestBodyType = "application/xml";
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        for (const [key, value] of new URLSearchParams(requestObject.data)) {
          transformedObject.request!.body.urlencoded!.push({
            key,
            value,
            checked: true,
          });
        }
        transformedObject.request!.selectedRequestBodyType =
          "application/x-www-form-urlencoded";
      } else {
        console.warn(`Unsupported Content-Type: ${contentType}`);
        transformedObject.request!.body.raw = JSON.stringify(
          requestObject?.data,
        );
        transformedObject.request!.selectedRequestBodyType = "text/plain";
      }
    }

    // Handle files from request object
    if (requestObject.files) {
      // If files is an array of objects
      if (Array.isArray(requestObject.files)) {
        requestObject.files.forEach((fileObj: any) => {
          transformedObject.request!.body.formdata!.text.push({
            key: fileObj?.key || "",
            value: "",
            checked: true,
          });
        });
      }
      // If files is an object with key-value pairs
      else {
        for (const key of Object.keys(requestObject.files)) {
          transformedObject.request!.body.formdata!.text.push({
            key,
            value: "",
            checked: true,
          });
        }
      }
    }

    // Handle headers and populate auth details
    if (requestObject.headers) {
      for (const [key, value] of Object.entries(requestObject.headers)) {
        if (
          !(isFormData && (key === "Content-Type" || key === "content-type"))
        ) {
          transformedObject.request!.headers!.push({
            key,
            value,
            checked: true,
          });
        }

        // Check for Bearer token
        if (
          key.toLowerCase() === "authorization" &&
          typeof value === "string" &&
          (value.startsWith("bearer ") || value.startsWith("Bearer "))
        ) {
          transformedObject.request!.auth.bearerToken = value.slice(7).trim();
          transformedObject.request!.selectedRequestAuthType = "Bearer Token";
        }

        // Check for API key
        if (
          key.toLowerCase() === "api-key" ||
          key.toLowerCase() === "x-api-key"
        ) {
          transformedObject.request!.auth.apiKey = {
            authKey: key,
            authValue: value,
            addTo: "Header",
          };
          transformedObject.request!.selectedRequestAuthType = "API Key";
        }

        // Check for Basic Auth
        if (
          key.toLowerCase() === "authorization" &&
          typeof value === "string" &&
          (value.startsWith("basic ") || value.startsWith("Basic "))
        ) {
          const decodedValue = Buffer.from(value.slice(6), "base64").toString(
            "utf8",
          );
          const [username, password] = decodedValue.split(":");
          transformedObject.request!.auth.basicAuth = {
            username,
            password,
          };
          transformedObject.request!.selectedRequestAuthType = "Basic Auth";
        }
      }
      transformedObject.request!.headers!.push(keyValueDefaultObj);
    }

    //Assign default values
    if (!transformedObject.request!.headers!.length) {
      transformedObject.request!.headers!.push(keyValueDefaultObj);
    }
    if (!transformedObject.request!.queryParams!.length) {
      transformedObject.request!.queryParams!.push(keyValueDefaultObj);
    }
    if (!transformedObject.request!.body.formdata!.text.length) {
      transformedObject.request!.body.formdata!.text.push(keyValueDefaultObj);
    }
    if (!transformedObject.request!.body.formdata!.file.length) {
      transformedObject.request!.body.formdata!.file.push(
        formDataFileDefaultObj,
      );
    }
    if (!transformedObject.request!.body.urlencoded!.length) {
      transformedObject.request!.body.urlencoded!.push(keyValueDefaultObj);
    }

    return transformedObject;
  };

  const parseCurl = (curl: string): TransformedRequest => {
    if (!curl || !curl.length) {
      throw new Error();
    }

    const updatedCurl = handleFormatCurl(curl);
    const stringifiedCurl = curlconverter.toJsonString(updatedCurl);
    const parsedCurl = JSON.parse(stringifiedCurl);

    // Match all -F flags with their key-value pairs
    const formDataMatches = curl.match(/-F\s+'([^=]+)=@([^;]+)/g);
    const formDataItems = formDataMatches
      ? formDataMatches.map((match) => {
          // Extract key and filename
          const [, keyValue] = match.split("-F '");
          const [key, filePath] = keyValue.split("=@");
          const value = filePath.replace(/'/g, "");

          return {
            key,
            value,
            checked: true,
            base: value,
          };
        })
      : [];

    // Override the form data in second
    if (formDataItems.length > 0) {
      parsedCurl.files = formDataItems;
    }

    // Override the form data in second
    if (formDataItems.length > 0) {
      parsedCurl.files = formDataItems;
    }
    return transformRequest(parsedCurl, "anonymous");
  };

  //importCurl contains the user pasted curl in string format
  const handleInputField = async () => {
    try {
      isCurlDataLoading = true;
      isCurlValid = false;
      isMethodWrong = false;
      parsedCurlData = parseCurl(importCurl);
      if (parsedCurlData) {
        if (parsedCurlData.request!.method === "INVALID") {
          isMethodWrong = true;
        } else {
          isCurlValid = true;
        }
      }
      isCurlDataLoading = false;
    } catch (error) {
      console.log("Error parsing cURL:", error);
      isCurlDataLoading = false;
      isCurlValid = false;
      parsedCurlData = null;
    }
  };

  const debouncedCurlValidate = new Debounce().debounce(handleInputField, 1000);
</script>

<div class="mt-3">
  <p class="sparrow-fs-14 mb-1 text-secondary-1000">Paste cURL here</p>
</div>
<div class="rounded border-0 position-relative">
  <textarea
    bind:value={importCurl}
    on:input={() => {
      isInputTouched = true;
      isCurlDataLoading = true;
      debouncedCurlValidate();
    }}
    on:blur={() => {
      isInputTouched = true;
    }}
    class="pe-4 ps-2 pb-2 pt-2 w-100 bg-tertiary-300 border-0 text-fs-12 rounded textarea-class {isInputTouched &&
    !isCurlDataLoading &&
    !isCurlValid
      ? 'border-error'
      : ''}"
    placeholder="Example- curl -X GET https://api.example.com/resource"
  />
  {#if isCurlDataLoading}
    <div class="position-absolute" style="right: 10px; top:10px;">
      <Spinner size={`16px`} />
    </div>
  {:else if isCurlValid}
    <div class="position-absolute" style="right: 10px; top:8px;">
      <TickMark />
    </div>
  {/if}
</div>
<div>
  {#if isInputTouched && !isCurlDataLoading && importCurl === ""}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      Please paste your cURL command here.
    </p>
  {:else if isInputTouched && !isCurlDataLoading && !isCurlValid}
    {#if isMethodWrong}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        The specified HTTP method is currently not supported.
      </p>
    {:else}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        The cURL command format appears to be incorrect, make sure it is in the
        correct format.
      </p>
    {/if}
  {/if}
</div>
<button
  class="mt-3 btn-primary d-flex mb-1 align-items-center justify-content-center border-0 w-100 py-2 fs-6 rounded"
  disabled={isLoading}
  on:click={async () => {
    isLoading = true;
    isInputTouched = true;
    if (isCurlValid) {
      await onItemImported("curl", {
        workspaceId,
        parsedCurlData,
      });
      onClosePopup();
    }
    isLoading = false;
  }}
>
  <span class="me-3">
    {#if isLoading}
      <Spinner size={"16px"} />
    {:else}
      Import
    {/if}
  </span>
</button>

<style lang="scss">
  .border-error {
    border: 1px solid var(--error--color) !important;
  }
  .textarea-class {
    height: 100px;
    outline: none;
  }
  .btn-primary {
    background-color: var(--bg-primary-300);
  }
  .btn-primary:hover {
    background-color: var(--bg-primary-250);
  }
  .btn-primary:active {
    background-color: var(--bg-primary-500);
  }
  .empty-data-error {
    color: var(--error--color);
  }
</style>
