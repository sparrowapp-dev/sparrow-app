<script lang="ts">
  // ---- helper functions
  import { base64ToURL } from "$lib/utils/helpers";
  // ---- document models
  import type { TeamDocument, WorkspaceDocument } from "@app/database/database";
  // ---- library
  import { Input } from "@library/forms";
  import { Button } from "@library/ui";
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
  <div class="text-lightGray mb-2 mt-2 sparrow-fs-14">
    <p class="text-secondary-1000 sparrow-fs-14">
      Everything in <span class="text-secondary-100" style="font-weight: 500;"
        >{workspace.name}</span
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
    placeholder={"Workspace Name"}
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 border-radius-4"
    style="outline:none;"
    defaultBorderColor={inputNameError
      ? "var(--border-danger-200)"
      : "var(--bg-secondary-400)"}
    hoveredBorderColor={inputNameError
      ? "var(--border-danger-200)"
      : "var(--bg-secondary-400)"}
    focusedBorderColor={inputNameError
      ? "var(--border-danger-200)"
      : "var(--bg-secondary-400)"}
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
    style="font-size: 16px;"
  >
    <div class="d-flex">
      {#if base64ToURL(openTeam?.logo) == "" || base64ToURL(openTeam?.logo) == undefined}
        <p
          class={`m-0 sparrow-fs-15 text-defaultColor me-2 align-items-center justify-content-center bg-transparent border-defaultColor `}
          style={`padding-top: 2px; width: 25px !important; height: 25px !important; display: flex; border: 1px solid var(--defaultcolor); border-radius: 50%;  font-weight:700;`}
        >
          {workspace.team?.teamName[0]
            ? workspace.team?.teamName[0].toUpperCase()
            : ""}
        </p>
      {:else}
        <img
          class="text-center w-25 align-items-center me-2 justify-content-center profile-circle bg-dullBackground"
          style="width: 25px !important; height: 25px !important; padding-top: 2px; display: flex; border-radius: 50%;"
          src={base64ToURL(openTeam.logo)}
          alt=""
        />
      {/if}
      <div class="d-flex align-items-center ellipsis">
        <p
          style="font-size:16px; color: var(--text-secondary-100)"
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
        type={"dark"}
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
      />
    </div>
  </div>
</div>

<style lang="scss">
  .workspace-delete-confirmation {
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
    .btn-primary {
      background-color: var(--border-color);
    }

    .btn-primary:hover {
      color: var(--blackColor);
      background-color: var(--workspace-hover-color);
    }

    .btn-primary:active {
      color: var(--blackColor);
      background-color: var(--button-pressed);
    }

    .btn-secondary {
      background-color: var(--dangerColor);
    }

    .btn-secondary:hover {
      background-color: var(--delete-hover);
    }
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--dangerColor);
      margin-left: 4px;
    }
    .input-container {
      background-color: var(--background-dropdown);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color) !important;
      width: 100%;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--error--color);
    }
    .error-border {
      border: 1px solid var(--error--color) !important;
    }
  }
</style>
