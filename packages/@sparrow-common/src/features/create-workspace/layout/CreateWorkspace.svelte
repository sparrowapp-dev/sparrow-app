<script lang="ts">
  import { Input, LabelField, Textarea } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";

  export let onCreateWorkspace;
  export let isCreateWorkspaceModalOpen: boolean = false;

  let workspaceName = "";
  let workspaceDescription = "";
  const maxChars = 100;
  let isLoading = false;

  let isWorkspaceNameTouched = false;
  let isWorkspaceNameInvalid = false;
  const WORKSPACE_NAME_ID = "workspace-name-input";
  const WORKSPACE_DESCRIPTION_ID = "workspace-description-area";

  // Validation function
  const isInvalidWorkspaceName = (name: string) => {
    return (
      !name.trim() ||
      !/^(?!.*[^A-Za-z0-9]{3,})(?=.*[A-Za-z0-9])[\x20-\x7E]+$/.test(name)
    );
  };

  const handleInputName = (event) => {
    workspaceName = event.detail;
    if (isWorkspaceNameTouched) {
      isWorkspaceNameInvalid = isInvalidWorkspaceName(workspaceName);
    }
  };

  const handleBlurName = (event) => {
    isWorkspaceNameTouched = true;
    workspaceName = event.detail.trim();
    isWorkspaceNameInvalid = isInvalidWorkspaceName(workspaceName);
  };

  const handleSubmit = async () => {
    isWorkspaceNameTouched = true;
    isWorkspaceNameInvalid = isInvalidWorkspaceName(workspaceName);
    if (isWorkspaceNameInvalid) {
      return;
    }
    isLoading = true;
    try {
      await onCreateWorkspace(
        workspaceName.trim(), // name
        workspaceDescription, // description
      );
    } finally {
      isLoading = false;
    }
  };
</script>

<div class="d-flex flex-column gap-3">
  <div class="modal-subtitle">
    Give your workspace a name that reflects its purpose.
  </div>

  <div class="form-group">
    <label class="form-label" for={WORKSPACE_NAME_ID}>
      Workspace Name <span class="required">*</span>
    </label>

    <Input
      id={WORKSPACE_NAME_ID}
      type="text"
      placeholder="Enter your workspace name"
      maxlength={100}
      variant="primary"
      size="medium"
      width="100%"
      value={workspaceName}
      isError={isWorkspaceNameInvalid && isWorkspaceNameTouched}
      on:input={handleInputName}
      on:blur={handleBlurName}
    />

    {#if isWorkspaceNameInvalid && isWorkspaceNameTouched}
      <span class="error-message">
        Workspace name is required and cannot contain invalid characters.
      </span>
    {/if}
  </div>

  <div>
    <!-- Workspace Description with LabelField -->
    <LabelField
      inputLabelId={WORKSPACE_DESCRIPTION_ID}
      headerLabelText="Workspace Summary"
      supportLabelText=""
      type="textarea"
      maxTextLength={maxChars}
      currentTextLength={workspaceDescription?.length || 0}
      helpLabel={true}
    >
      <Textarea
        id={WORKSPACE_DESCRIPTION_ID}
        bind:value={workspaceDescription}
        placeholder="Write a small summary about your workspace"
        height="120px"
        defaultBorderColor="transparent"
        hoveredBorderColor="var(--border-ds-neutral-300)"
        focusedBorderColor="var(--border-ds-primary-300)"
        class="text-ds-font-size-14 bg-tertiary-300 text-ds-font-weight-medium px-2 py-2 border-radius-4"
        style="outline:none;"
        disabled={false}
        maxlength={maxChars}
        placeholderColor="var(--text-secondary-200)"
      />
    </LabelField>
  </div>

  <div class="modal-actions">
    <Button
      title="Cancel"
      type="secondary"
      onClick={() => (isCreateWorkspaceModalOpen = false)}
      size="medium"
    />
    <Button
      title="Save"
      type="primary"
      onClick={handleSubmit}
      loader={isLoading}
      disable={isLoading || isWorkspaceNameInvalid}
      size="medium"
    />
  </div>
</div>

<style>
  .modal-subtitle {
    color: var(--text-ds-neutral-100);
    font-size: 14px;
    font-weight: 300;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-ds-neutral-200);
    margin: 0;
  }

  .required {
    color: var(--text-ds-danger-400);
  }

  .error-message {
    font-size: 12px;
    color: var(--text-ds-danger-300);
    margin-top: 4px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
