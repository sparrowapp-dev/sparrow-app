<script lang="ts">
  import { RequestMethod, WorkspaceRole } from "@sparrow/common/enums";
  import { Select } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  import { CodeMirrorInput } from "../../../../components";
  import { UrlInputTheme } from "../../../../utils";
  import { Tooltip } from "@sparrow/library/ui";
  import { ArrowUpRightRegular, SaveRegular } from "@sparrow/library/icons";

  let componentClass = "";
  export { componentClass as class };

  export let requestUrl;
  export let httpMethod;
  export let onSendButtonClicked;
  export let onUpdateRequestUrl;
  export let onUpdateRequestMethod;
  export let onSaveRequest;
  export let environmentVariables;
  export let onUpdateEnvironment;
  export let isSave;
  /**
   * Role of user in active workspace
   */
  export let userRole;

  const theme = new UrlInputTheme().build();
  const handleDropdown = (tab: string) => {
    onUpdateRequestMethod(tab);
  };

  /**
   * @description - save request handler
   */
  const handleSaveRequest = async () => {
    await onSaveRequest();
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
      onSendButtonClicked(environmentVariables);
    }
  };
</script>

<div class={`d-flex ${componentClass}`}>
  <!-- Http Method Dropdown -->
  <div class="" style="">
    <Select
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
      variant={"secondary"}
      zIndex={500}
      borderType={"none"}
      menuItem={"v2"}
      highlightTickedItem={false}
      disabled={true}
    />
  </div>
  <div class="ps-2"></div>

  <CodeMirrorInput
    value={requestUrl}
    onUpdateInput={onUpdateRequestUrl}
    placeholder={"Enter a URL"}
    {theme}
    {onUpdateEnvironment}
    {environmentVariables}
    codeId={"url"}
    class={"input-url"}
    {userRole}
    isFocusedOnMount={true}
    disabled={true}
  />

  <span class="ps-2"></span>
  <Button
    title="Try"
    endIcon={ArrowUpRightRegular}
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
  <span class="ps-2"></span>
  <Tooltip title={"Save"} placement={"bottom-center"} distance={12} zIndex={10}>
    <Button
      type="secondary"
      size="medium"
      startIcon={SaveRegular}
      onClick={handleSaveRequest}
      disable={isSave || userRole === WorkspaceRole.WORKSPACE_VIEWER
        ? true
        : false}
    />
  </Tooltip>
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
