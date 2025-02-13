<script lang="ts">
  // ---- helper functions
  import { base64ToURL } from "@sparrow/common/utils";
  // ---- document models
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  // ---- library
  import { Button, IconFallback } from "@sparrow/library/ui";
  import { Input } from "@sparrow/library/forms";
  export let isDeleteWorkspaceModalOpen = false;
  export let workspace: WorkspaceDocument;
  export let openTeam: TeamDocument;
  export let onDeleteWorkspace;
  const inputId: string = "workspace-delete-input";
  let inputName = "";
  let inputNameError = "";
  let loader: boolean = false;
  $: defaultBorderColor = inputNameError
    ? "1px solid var(--border-ds-danger-300) !important"
    : "transparent";
  $: hoveredBorderColor = inputNameError
    ? "1px solid var(--border-ds-danger-300) !important"
    : "1px solid var(--border-ds-neutral-300)";

  $: focusedBorderColor = inputNameError
    ? "2px solid var(--border-ds-danger-300) !important"
    : "2px solid var(--border-ds-primary-300)";
  $: typedBorderColor = inputNameError
    ? "1px soild var(--border-ds-danger-300) !important"
    : "1px soild var(----border-ds-primary-300)";
</script>

<div class="workspace-delete-confirmation">
  <div class="text-lightGray mb-2 mt-2 sparrow-fs-14">
    <p class="text-secondary-1000 sparrow-fs-14">
      Everything in <span class="text-secondary-100" style="font-weight: 500;"
        >"{workspace.name}"</span
      > will be permanently removed, and all contributors will lose access. This
      action cannot be undone.
    </p>
  </div>

  <p class="confirm-header mb-1 sparrow-fs-14 text-secondary-1000">
    Enter workspace name to confirm<span class="asterik">*</span>
  </p>
  <!-- 
      -- Input 
    -->
  <Input
    bind:value={inputName}
    height={"36px"}
    id={inputId}
    placeholder={"Workspace name"}
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 border-radius-4"
    style="outline:none;"
    {defaultBorderColor}
    {hoveredBorderColor}
    {focusedBorderColor}
    {typedBorderColor}
    isEditIconRequired={false}
    type={"text"}
    placeholderColor={"var(--text-secondary-200)"}
  />

  {#if inputNameError}
    <p class="error-text sparrow-fs-12">{inputNameError}</p>
  {/if}
  <br />

  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-2 pb-3 mb-0 rounded ellipsis"
    style="font-size: 16px;`"
  >
    <div class="d-flex ellipsis">
      {#if openTeam?.logo?.size}
        <img
          class="text-center w-25 align-items-center me-2 justify-content-center profile-circle bg-dullBackground"
          style="width: 25px !important; height: 25px !important; padding-top: 2px; display: flex; border-radius: 50%;"
          src={base64ToURL(openTeam?.logo)}
          alt=""
        />
      {:else}
        <span class="me-2">
          <IconFallback character={workspace?.team?.teamName[0] || ""} />
        </span>
      {/if}
      <div class="d-flex align-items-center ellipsis">
        <p
          style="font-size:16px; color: var(--text-secondary-100); "
          class="mb-0 ellipsis"
        >
          {workspace.team?.teamName}
        </p>
      </div>
    </div>
    <div class="d-flex">
      <Button
        title={"Cancel"}
        textStyleProp={"font-size: 16px"}
        buttonClassProp={"me-2"}
        buttonStyleProp={"height: 36px;"}
        type={"secondary"}
        onClick={async () => {
          inputNameError = "";
          isDeleteWorkspaceModalOpen = false;
        }}
      />
      <Button
        title={"Delete Workspace"}
        textStyleProp={"font-size: 16px"}
        loaderSize={18}
        type={"danger"}
        buttonStyleProp={"height: 36px;"}
        {loader}
        onClick={async () => {
          loader = true;
          inputName = inputName.replace(/’/g, "'");
          if (inputName === "") {
            inputNameError = `Workspace name cannot be empty.`;
          } else if (inputName !== workspace.name) {
            inputNameError = `Workspace name does not match.`;
          } else {
            inputNameError = "";
            await onDeleteWorkspace();
            isDeleteWorkspaceModalOpen = false;
          }
          loader = false;
        }}
        disable={loader}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .workspace-delete-confirmation {
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--text-danger-200);
      margin-left: 4px;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--text-danger-200);
    }
    .error-border {
      border: 1px solid var(--border-danger-200) !important;
    }
  }
</style>
