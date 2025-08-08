<script lang="ts">
  import { RequestMethod, WorkspaceRole } from "@sparrow/common/enums";
  import { Select } from "@sparrow/library/forms";
  import { notifications, Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils/";
  import { Tooltip } from "@sparrow/library/ui";
  import { SaveRegular } from "@sparrow/library/icons";
  import * as curlconverter from "curlconverter";
  import type { TransformedRequest } from "@sparrow/common/types/workspace/collection-base";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl;
  export let httpMethod;
  export let isSendRequestInProgress;
  export let onSendButtonClicked;
  export let onCancelButtonClicked;
  export let onUpdateRequestUrl;
  export let onUpdateRequestMethod;
  export let toggleSaveRequest;
  export let onSaveRequest;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  export let userRole;
  export let isSaveLoad = false;
  export let onImportCurl;

  const theme = new UrlInputTheme().build();
  const handleDropdown = (tab: string) => {
    onUpdateRequestMethod(tab);
  };

  // --- cURL parsing logic ---
  const handleFormatCurl = (curlCommand: string): string => {
    const rawLiteralRegex = /(\$'[\s\S]*?')$/m;
    let rawLiteral = "";
    const rawMatch = curlCommand.match(rawLiteralRegex);
    if (rawMatch) {
      rawLiteral = rawMatch[0];
      curlCommand = curlCommand.slice(0, rawMatch.index).trim();
    }
    const heredocRegex = /(<<\s*EOF[\s\S]*?^EOF\s*)$/m;
    const heredocMatch = curlCommand.match(heredocRegex);
    let heredoc = "";
    if (heredocMatch) {
      heredoc = heredocMatch[0]
        .replace(/\r\n/g, "\n")
        .replace(/^\s+|\s+$/g, "");
      curlCommand = curlCommand.slice(0, heredocMatch.index).trim();
    }
    curlCommand = curlCommand.replace(/\\\s*\n\s*/g, " ");
    curlCommand = curlCommand.replace(/\\\s*/g, " ");
    curlCommand = curlCommand.replace(/\s+/g, " ").trim();
    const parts = curlCommand.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    let formatted = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0) {
        formatted += part;
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
    if (heredoc) {
      const [firstLine, ...restLines] = heredoc.split("\n");
      formatted += " \\\n  " + firstLine + "\n" + restLines.join("\n");
    }
    if (rawLiteral && !formatted.includes(rawLiteral)) {
      formatted += ` \\\n  ${rawLiteral}`;
    }
    return formatted.trim();
  };

  const handleFormatUrl = (url: string) => {
    url = url.replace(/^(https?:\/\/\s*)+(https?:\/\/)/, "$2");
    return url;
  };

  // --- FULL transformRequest function from ImportCurl.svelte ---
  const transformRequest = (requestObject: any, username: string) => {
    let url = requestObject.url || "";
    let raw_url = requestObject.raw_url || "";
    let method = requestObject.method || "GET";
    let headers = requestObject.headers || [];
    // Check both body and data properties from curlconverter
    let body = requestObject.body || requestObject.data || "";
    let files = requestObject.files || [];
    let params = [];
    let auth = requestObject.auth || {};
    let queryParams = [];

    // Format queryParams (always add an empty param at the end)
    if (raw_url && raw_url.includes("?")) {
      const [baseUrl, queryString] = raw_url.split("?");
      url = baseUrl;
      queryParams = queryString
        .split("&")
        .map((pair) => {
          const eqIdx = pair.indexOf("=");
          if (eqIdx === -1) {
            // No value, just key
            return { key: pair.trim(), value: "", checked: true };
          }
          const key = pair.slice(0, eqIdx).trim();
          const value = pair.slice(eqIdx + 1).trim();
          return { key, value, checked: true };
        })
        .filter((item) => item.key);
      // Always add an empty param at the end
      queryParams.push({ key: "", value: "", checked: true });
    } else {
      queryParams = [{ key: "", value: "", checked: true }];
    }

    // Format headers
    if (
      !Array.isArray(headers) &&
      typeof headers === "object" &&
      headers !== null
    ) {
      headers = Object.entries(headers)
        .filter(([key]) => key && key.trim() !== "")
        .map(([key, value]) => ({
          key: key.trim(),
          value:
            value !== undefined && value !== null ? String(value).trim() : "",
          checked: true,
        }));
      // Always add an empty header at the end
      headers.push({ key: "", value: "", checked: true });
    } else {
      headers = [{ key: "", value: "", checked: true }];
    }

    // Format files
    files = Array.isArray(files)
      ? files.map((f) =>
          typeof f === "string"
            ? {
                key: f.split("=")[0],
                value: f.split("=").slice(1).join("="),
                checked: true,
              }
            : { key: f.key, value: f.value, checked: true },
        )
      : [];

    // Format body (for JSON, form, etc.)
    if (typeof body === "object" && body !== null) {
      try {
        body = JSON.stringify(body, null, 2);
      } catch {
        body = String(body);
      }
    }

    // Format auth
    if (auth && typeof auth === "object") {
      auth = {
        ...auth,
        checked: true,
      };
    }

    return {
      request: {
        url: handleFormatUrl(url),
        method,
        headers,
        body,
        files,
        params,
        auth,
        queryParams,
      },
      username,
    };
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
    if (formDataItems.length > 0) {
      parsedCurl.files = formDataItems;
    }
    return transformRequest(parsedCurl, "anonymous");
  };
  // --- end cURL parsing logic ---

  async function handleUrlInput(value) {
    if (typeof value === "string" && value.trim().startsWith("curl ")) {
      try {
        const parsed = parseCurl(value);
        if (parsed) {
          await onImportCurl(parsed);
        }
      } catch (err) {
        console.error("Failed to parse cURL command:", err);
        notifications.error("Failed to parse cURL command.");
        onUpdateRequestUrl(value);
      }
    } else {
      onUpdateRequestUrl(value);
    }
  }
  /**
   * @description - save request handler
   */
  const handleSaveRequest = async () => {
    const x = await onSaveRequest();
    if (
      x.status === "error" &&
      x.message === "request is not a part of any workspace or collection"
    ) {
      toggleSaveRequest(true);
    } else if (x.status === "success") {
      notifications.success("API request saved successfully.");
    }
  };

  /**
   * @description - handles different key press
   * @param event - keyboard events
   */
  const handleKeyPress = (event: KeyboardEvent) => {
    const isSaveDisabled =
      isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER ? true : false;
    if (
      !isSaveDisabled &&
      (event.metaKey || event.ctrlKey) &&
      event.code === "KeyS"
    ) {
      event.preventDefault();
      handleSaveRequest();
    } else if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
      event.preventDefault();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (requestUrl === "") {
        const codeMirrorElement = document.querySelector(
          ".input-url .cm-editor",
        );
        if (codeMirrorElement) {
          codeMirrorElement.classList.add("url-red-border");
        }
      }
      onSendButtonClicked(environmentVariables);
    }
  };

  let isHovered = false;

  function handleMouseEnter() {
    isHovered = true;
  }

  function handleMouseLeave() {
    isHovered = false;
  }
</script>

<div class={`d-flex ${componentClass}`} style="display: flex; gap: 6px;">
  <!-- Http Method Dropdown -->
  <Select
    variant={"secondary"}
    id={"api-request"}
    size={"medium"}
    data={[
      {
        name: "GET",
        id: RequestMethod.GET,
        color: "success",
      },
      {
        name: "POST",
        id: RequestMethod.POST,
        color: "warning",
      },
      {
        name: "PUT",
        id: RequestMethod.PUT,
        color: "secondary",
      },
      {
        name: "DELETE",
        id: RequestMethod.DELETE,
        color: "danger",
      },
      {
        name: "PATCH",
        id: RequestMethod.PATCH,
        color: "patch",
      },
    ]}
    titleId={httpMethod}
    onclick={handleDropdown}
    borderHighlight={"active"}
    headerHighlight={"hover"}
    minHeaderWidth={"100px"}
    borderActiveType={"none"}
    zIndex={500}
    borderType={"none"}
    menuItem={"v2"}
    highlightTickedItem={false}
  />
  <div class="w-100 d-flex align-items-center position-relative">
    <div class="position-absolute top-0" style="width: calc(100% );">
      <CodeMirrorInput
        value={requestUrl}
        onUpdateInput={handleUrlInput}
        placeholder={"Enter a URL or paste a cURL command"}
        {theme}
        {onUpdateEnvironment}
        {environmentVariables}
        codeId={"url"}
        class={"input-url"}
        {userRole}
        isFocusedOnMount={false}
      />
    </div>
  </div>

  <!-- Send button -->
  {#if !isSendRequestInProgress}
    <Button
      title="Send"
      type="primary"
      customWidth={"96px"}
      onClick={() => {
        if (requestUrl === "") {
          const codeMirrorElement = document.querySelector(
            ".input-url .cm-editor",
          );
          if (codeMirrorElement) {
            codeMirrorElement.classList.add("url-red-border");
          }
        } else {
          onSendButtonClicked(environmentVariables);
        }
      }}
    />
  {:else}
    <Button
      type="secondary"
      customWidth={"96px"}
      title="Cancel"
      onClick={() => {
        onCancelButtonClicked();
      }}
    />
  {/if}

  <!-- Switch pane layout button -->
  <!-- <ToggleButton
    selectedToggleId={splitterDirection}
    toggleButtons={[
      {
        name: "",
        id: "vertical",
        icon: tableColumnIcon,
      },
      {
        name: "",
        id: "horizontal",
        icon: barIcon,
      },
    ]}
    on:click={(e) => {
      onUpdateRequestState({ requestSplitterDirection: e.detail });
    }}
  /> -->
  {#if !(userRole === WorkspaceRole.WORKSPACE_VIEWER)}
    <Tooltip
      title={"Save"}
      placement={"bottom-center"}
      distance={12}
      zIndex={10}
    >
      <Button
        type="secondary"
        size="medium"
        loader={isSaveLoad}
        startIcon={isSaveLoad ? "" : SaveRegular}
        onClick={handleSaveRequest}
        disable={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
          ? true
          : false}
      />
    </Tooltip>
  {/if}
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .save-disk {
    padding: 7px;
    background-color: var(--bg-secondary-400);
  }

  .save-disk:disabled {
    background-color: var(--bg-secondary-550);
  }
  :global(.url-red-border) {
    border: 1px solid var(--border-danger-200) !important;
  }
</style>
