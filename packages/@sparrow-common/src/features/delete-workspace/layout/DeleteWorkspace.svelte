<script lang="ts">
  // ---- helper functions
  import { base64ToURL } from "@sparrow/common/utils";
  // ---- document models
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  // ---- library
  import { Input, LabelField } from "@sparrow/library/forms";
  import { Button, Avatar } from "@sparrow/library/ui";
  export let isDeleteWorkspaceModalOpen = false;
  export let workspace: WorkspaceDocument;
  export let openTeam: TeamDocument;
  export let onDeleteWorkspace;
  const inputId: string = "workspace-delete-input";
  let inputName = "";
  let inputNameError = "";
  let loader: boolean = false;
</script>

<div class="workspace-delete-confirmation">
  <!-- <div class="text-lightGray mb-2 mt-2 sparrow-fs-14">
    <p class="text-secondary-1000 sparrow-fs-14">
      Everything in <span class="text-secondary-100" style="font-weight: 500;"
        >"{workspace.name}"</span
      > will be permanently removed, and all contributors will lose access. This
      action cannot be undone.
    </p>
  </div>

  <p class="confirm-header mb-1 sparrow-fs-14 text-secondary-1000">
    Enter workspace name to confirm<span class="asterik">*</span>
  </p> -->
  <!-- 
      -- Input with Label Text
    -->
  <LabelField
    inputValueRequired={true}
    headerLabelText={"Enter workspace name to confirm"}
    supportLabelText={`Everything in ${workspace.name} will be permanently removed, and all contributors will lose access. This
  action cannot be undone.`}
    helpLabel={true}
    isError={inputNameError ? true : false}
    errorMessage={inputNameError}
  >
    <Input
      bind:value={inputName}
      height={"36px"}
      id={inputId}
      placeholder={"Workspace name"}
      class="text-ds-font-size-14 bg-tertiary-300 text-ds-font-weight-medium px-2 border-radius-4"
      style="outline:none;"
      isError={inputNameError ? true : false}
      isEditIconRequired={false}
      type={"text"}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>
  <br />

  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-2 pb-3 mb-0 rounded ellipsis text-ds-font-size-16"
  >
    <div class="d-flex ellipsis">
      {#if openTeam?.logo?.size}
        <span class="me-2">
          <Avatar
            type={"image"}
            size={"large"}
            image={base64ToURL(openTeam?.logo)}
          />
        </span>
      {:else}
        <span class="me-2">
          <Avatar
            type={"letter"}
            size={"large"}
            letter={workspace?.team?.teamName[0] || ""}
            bgColor={"var(--bg-tertiary-700)"}
          />
        </span>
      {/if}
      <div class="d-flex align-items-center ellipsis">
        <p
          style="color: var(--text-secondary-100); "
          class="mb-0 ellipsis text-ds-font-size-12 text-ds-line-height-130"
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
