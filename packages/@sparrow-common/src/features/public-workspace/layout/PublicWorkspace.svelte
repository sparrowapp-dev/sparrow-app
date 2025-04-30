<script lang="ts">
  // ---- document models
  import type { WorkspaceDocument } from "@app/database/database";
  // ---- library
  import { Input, LabelField } from "@sparrow/library/forms";
  import { Button, Avatar } from "@sparrow/library/ui";
  export let isWorkspacePublicModalOpen = false;
  export let workspace: WorkspaceDocument;
  export let onMakePublicWorkspace;
  const inputId: string = "workspace-delete-input";
  let inputName = "";
  let inputNameError = "";
  let loader: boolean = false;
</script>

<div class="workspace-delete-confirmation">
  <!-- 
      -- Input with Label Text
    -->
  <LabelField
    inputValueRequired={false}
    helpLabel={true}
    isError={inputNameError ? true : false}
    errorMessage={inputNameError}
  >
    <p
      style="color: var(--text-ds-neutral-200); margin-bottom:0px; margin-top:18px;"
      class="text-ds-font-size-14 text-ds-line-height-143"
    >
      Publish this workspace publicly?
    </p>
    <p class="text-ds-font-size-12" style="color: var(--text-ds-neutral-400);">
      Anyone with the link can view this workspace, but only collaborators
      you've added can make changes. Active sync collections will remain private
      and will not be made public. You can unpublish the workspace at any time
      to make it private again. By publishing, you agree to our <span
        style="color: var(--text-ds-neutral-50); text-decoration: underline;"
        >Terms of Service</span
      >
      and
      <span
        style="color: var(--text-ds-neutral-50); text-decoration: underline;"
        >Privacy Policy</span
      >.
    </p>
    <p class="text-ds-font-size-12" style="color: var(--text-ds-neutral-400);">
      To proceed, type <span style="color: var(--text-ds-neutral-50);"
        >{workspace?.name}</span
      > below.
    </p>

    <Input
      bind:value={inputName}
      height={"36px"}
      id={inputId}
      placeholder={"Type workspace name to proceed"}
      class="text-ds-font-size-14 bg-tertiary-300 text-ds-font-weight-medium px-2 border-radius-4"
      style="outline:none;"
      isError={inputNameError ? true : false}
      isEditIconRequired={false}
      type={"text"}
      placeholderColor={"var(--text-secondary-200)"}
    />
    <p class="text-ds-font-size-12" style="color: var(--text-ds-neutral-400);">
      <span
        style="color: var(--text-ds-neutral-50); text-decoration: underline;"
        >Learn More</span
      > how public workspaces work.
    </p>
  </LabelField>
  <br />

  <div
    class="d-flex align-items-center justify-content-between gap-3 mt-2 pb-3 mb-0 rounded ellipsis text-ds-font-size-16"
  >
    <div class="d-flex ellipsis"></div>
    <div class="d-flex">
      <Button
        title={"Cancel"}
        textStyleProp={"font-size: 16px"}
        buttonClassProp={"me-2"}
        buttonStyleProp={"height: 36px;"}
        type={"secondary"}
        onClick={async () => {
          inputNameError = "";
          isWorkspacePublicModalOpen = false;
        }}
      />
      <Button
        title={"Make Public"}
        textStyleProp={"font-size: 16px"}
        loaderSize={18}
        type={"primary"}
        buttonStyleProp={"height: 36px;"}
        {loader}
        onClick={async () => {
          loader = true;
          inputName = inputName.replace(/’/g, "'");
          if (inputName === "") {
            inputNameError = `Workspace name cannot be empty. Please enter the workspace name.`;
          } else if (inputName !== workspace?.name) {
            inputNameError = `Workspace name doesn’t match.`;
          } else {
            inputNameError = "";
            await onMakePublicWorkspace();
            isWorkspacePublicModalOpen = false;
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
