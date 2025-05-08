<script lang="ts">
  // ---- document models
  import type { WorkspaceDocument } from "@app/database/database";
  // ---- library
  import { Input, LabelField } from "@sparrow/library/forms";
  import { Button, Avatar } from "@sparrow/library/ui";
  export let isWorkspacePublicModalOpen = false;
  export let workspace: WorkspaceDocument;
  export let onMakePublicWorkspace;
  export let onRedirectTermsService;
  export let onRedirectPrivacyPolicy;
  export let onRedirectDocs;
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
      style="color: var(--text-ds-neutral-200); margin-bottom:7px; margin-top:18px;"
      class="text-ds-font-size-14 text-ds-line-height-143"
    >
      Publish "{workspace?.name}" Workspace
    </p>
    <p
      class="text-ds-font-size-12"
      style="color: var(--text-ds-neutral-400); margin-bottom: 0px;"
    >
      Anyone with the link can view this workspace, but only collaborators
      you've added can make changes. Active sync collections will remain private
      and will not be made public. By publishing, you agree to our
    </p>
    <div class="d-flex" style="align-items:center;">
      <Button
        title="Terms of Service"
        type={"link-secondary"}
        onClick={async () => {
          "click dont save";
          await onRedirectTermsService();
        }}
        size="small"
        buttonClassProp="ps-0 pe-1"
      />
      <!-- <span
        style="color: var(--text-ds-neutral-200); text-decoration: underline;"
        >Terms of Service</span
      > -->
      <p
        class="text-ds-font-size-12"
        style="margin-top: 4px; margin-bottom:4px; color: var(--text-ds-neutral-400); "
      >
        and
      </p>
      <Button
        title="Privacy Policy"
        type={"link-secondary"}
        onClick={async () => {
          "click dont save";
          await onRedirectPrivacyPolicy();
        }}
        size="small"
        buttonClassProp="ps-1 pe-1"
      />
    </div>
    <!-- <span
        style="color: var(--text-ds-neutral-200); text-decoration: underline;"
        >Privacy Policy</span
      > -->

    <p class="text-ds-font-size-12" style="color: var(--text-ds-neutral-400);">
      To proceed, type <span style="color: var(--text-ds-neutral-200);"
        >workspace name</span
      > below.
    </p>

    <Input
      bind:value={inputName}
      id={inputId}
      placeholder={"Type workspace name to proceed"}
      class="text-ds-font-size-14 bg-tertiary-300 text-ds-font-weight-medium px-2 border-radius-4"
      style="outline:none;"
      isError={inputNameError ? true : false}
      isEditIconRequired={false}
      type={"text"}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>

  <div class="d-flex" style="align-items:center;">
    <Button
      title="Learn More"
      type={"link-secondary"}
      onClick={async () => {
        "click dont save";
        await onRedirectDocs();
      }}
      size="small"
      buttonClassProp="ps-0 pe-1"
    />
    <p
      class="text-ds-font-size-12"
      style="color: var(--text-ds-neutral-400); margin-bottom: 0px;"
    >
      <!-- <span style="color: var(--text-ds-neutral-200); text-decoration: underline;"
      >Learn More</span
    >  -->
      how public workspaces work.
    </p>
  </div>
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
        title={"Publish"}
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
