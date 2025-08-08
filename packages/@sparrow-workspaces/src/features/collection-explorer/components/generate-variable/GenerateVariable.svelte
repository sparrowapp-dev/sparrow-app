<script lang="ts">
  import { Select } from "@sparrow/library/forms";
  import { environmentType } from "@sparrow/common/enums";
  import { StackIcon } from "@sparrow/library/icons";
  import TabularInput from "../../../../components/tabular-input/TabularInput.svelte";
  import { Button } from "@sparrow/library/ui";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";

  export let generateVariables: KeyValuePair[] = [];
  export let handleCloseModal: () => void;
  export let workspaceEnvironments: any;
  export let workspaceEnvs: any;
  export let onInsertGenerativeVariables: (
    generateVariables: KeyValuePair[],
    selectedEnvironmentId: string,
    data: string,
  ) => void;

  type Environment = {
    id: string;
    name: string;
  };

  let selectedEnvironment: Environment = {
    name: "Select Environment",
    id: "none",
  };

  let isCheckedKeypairs = false;
  let environmentErrorMessage = "";
  let keyValueErrorMessage = "";
  let InsertVariableLoading: boolean = false;

  const handleGenerateValueChange = (pairs: KeyValuePair[]): void => {
    generateVariables = pairs;
  };

  const handleRemoveSelectedPair = () => {
    generateVariables = filterUnchecked(generateVariables);
  };

  const filterUnchecked = (data: KeyValuePair[]): KeyValuePair[] => {
    return data.filter((item) => !item.checked);
  };

  const hasAnyChecked = (data: KeyValuePair[]): boolean => {
    return data.some((item) => item.checked);
  };

  const clearErrors = () => {
    environmentErrorMessage = "";
    keyValueErrorMessage = "";
  };

  const handleOnChangeEnvironment = (id: string) => {
    clearErrors();
    const matchedEnvironment = workspaceEnvironments.find(
      (env: any) => env.id === id,
    );
    if (matchedEnvironment) {
      selectedEnvironment = {
        id: matchedEnvironment.id,
        name: matchedEnvironment.name,
      };
    }
  };

  const handleInsertVariables = async () => {
    clearErrors();
    InsertVariableLoading = true;
    let hasError = false;
    if (selectedEnvironment.id === "none") {
      environmentErrorMessage =
        "Please select an environment to insert variables.";
      hasError = true;
    }
    if (generateVariables.length < 2) {
      keyValueErrorMessage =
        "Please add at least one key-value pair to insert.";
      hasError = true;
    }
    if (hasError) {
      InsertVariableLoading = false;
      return;
    }
    const environmentDetails = workspaceEnvs.filter((ele: any) => {
      return ele.id === selectedEnvironment.id;
    });
    await onInsertGenerativeVariables(
      generateVariables,
      selectedEnvironment.id,
      environmentDetails,
    );
    InsertVariableLoading = false;
    handleCloseModal();
  };

  $: {
    if (generateVariables.length > 1) {
      keyValueErrorMessage = "";
    }
  }

  $: isCheckedKeypairs = hasAnyChecked(generateVariables);
</script>

<div>
  <div class="d-flex flex-column" style="margin-bottom: 24px;">
    <p class="common-text description-text" style="margin: 0px;">
      Review the AI-generated suggestions below. You can edit any key-value<br
      />
      pair before saving to an environment, or add new ones as needed.
    </p>
  </div>

  <div class="d-flex flex-column" style="gap: 12px; margin-bottom:24px;">
    <div style="width: 240px;">
      <Select
        id="environment-generate-select"
        data={[
          {
            name: "Select Environment",
            id: "none",
            type: environmentType.LOCAL,
            hide: true,
          },
          ...workspaceEnvironments,
        ]}
        titleId={selectedEnvironment.id}
        onclick={handleOnChangeEnvironment}
        minHeaderWidth="205px"
        iconRequired={true}
        icon={StackIcon}
        iconColor="var(--icon-primary-300)"
        isDropIconFilled={true}
        borderType="none"
        borderActiveType="none"
        headerHighlight="hover-active"
        headerTheme="transparent"
        menuItem="v2"
        headerFontSize="12px"
        maxHeaderWidth="240px"
        zIndex={200}
        bodyTheme="surface"
        borderRounded="2px"
        position="absolute"
        headerHeight="28px"
        isError={environmentErrorMessage ? true : false}
      />
    </div>
    {#if environmentErrorMessage}
      <p class="common-text error-text" style="margin: 0px;" aria-live="polite">
        {environmentErrorMessage}
      </p>
    {/if}

    <div style="max-height: 168px; overflow-y: auto;">
      <TabularInput
        keyValue={generateVariables}
        callback={handleGenerateValueChange}
        environmentVariables={{}}
        onUpdateEnvironment={() => {}}
      />
    </div>

    {#if keyValueErrorMessage}
      <p class="common-text error-text" style="margin: 0px;" aria-live="polite">
        {keyValueErrorMessage}
      </p>
    {/if}
  </div>

  <div class="d-flex flex-row justify-content-between">
    <div>
      {#if isCheckedKeypairs}
        <Button
          title="Delete Selected"
          type="outline-danger"
          size="medium"
          onClick={handleRemoveSelectedPair}
        />
      {/if}
    </div>
    <div class="d-flex" style="gap: 12px;">
      <Button
        title="Cancel"
        type="secondary"
        size="medium"
        onClick={handleCloseModal}
      />
      <Button
        title="Insert Variables"
        type="primary"
        size="medium"
        loader={InsertVariableLoading}
        onClick={handleInsertVariables}
      />
    </div>
  </div>
</div>

<style>
  .common-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    line-height: 1.43;
    letter-spacing: 0;
    text-align: left;
  }
  .description-text {
    font-size: 14px;
    color: var(--text-ds-neutral-200);
  }
  .error-text {
    font-size: 12px;
    color: var(--text-ds-danger-300);
  }
</style>
