<script>
  import { RequestMethod } from "@sparrow/common/enums";
  import { Select } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  import Input from "../../../../@sparrow-library/src/forms/Input/Input.svelte";
  import { onMount } from "svelte";

  export let handleModalState;
  export let handleCreateCustomRequest;
  export let handleUpdateRequestName;
  export let handleUpdateRequestURL;
  export let handleUpdateRequestMethod;
  export let requestName = "";
  export let requestURL = "";
  export let httpRequestMethod = "GET";
  export let isCreatingCustomRequest = false;

  const handleDropdown = (tabId) => {
    httpRequestMethod = tabId;
    handleUpdateRequestMethod(tabId);
  };

  const httpMethodData = [
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
  ];

  // Reset the fields on model open
  onMount(() => {
    requestName = "";
    requestURL = "";
    handleDropdown("GET");
  });
</script>

<!-- Section for the modal content -->
<section>
  <div style="margin-top: 24px;">
    <div class="d-flex gap-1" style="margin-bottom: 8px;">
      <div class="input-label">Request Name</div>
      <span class="required-mark-primary">*</span>
    </div>

    <Input
      placeholder="Enter request name"
      variant="primary"
      bind:value={requestName}
      width="100%"
      on:input={handleUpdateRequestName}
    />
  </div>

  <div class="input-request">
    <!-- HTTP URL Section -->
    <Select
      headerTheme={"light-violet"}
      id={"api-request"}
      size={"medium"}
      data={httpMethodData}
      borderRounded={"4px"}
      titleId={httpRequestMethod}
      onclick={handleDropdown}
      borderHighlight={"active"}
      headerHighlight={"hover"}
      minHeaderWidth={"100px"}
      borderActiveType={"none"}
      zIndex={500}
      borderType={"none"}
      menuItem={"v2"}
      bodyTheme={"surface"}
      isDropIconFilled={true}
      highlightTickedItem={false}
      headerFontSize={"12px"}
      headerHeight={"36px"}
    />
    <div style="width: 8px;"></div>
    <div style="width: 100%;">
      <Input
        placeholder="Enter URL here"
        variant="primary"
        bind:value={requestURL}
        width="100%"
        on:input={handleUpdateRequestURL}
      />
    </div>
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end" style="margin-top: 52px;">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
        disable={isCreatingCustomRequest}
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"secondary"}
        onClick={() => {
          handleModalState(false); // Close the modal
        }}
      />
    </span>
    <Button
      disable={isCreatingCustomRequest}
      title={"Create"}
      textClassProp={"fs-6"}
      type={"primary"}
      onClick={() => {
        handleCreateCustomRequest();
      }}
      loader={isCreatingCustomRequest}
    />
  </div>
</section>

<style>
  .header-label {
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: 20px;
  }

  .input-label {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-ds-neutral-200);
  }

  .input {
    outline: none;
    background-color: var(--border-ds-surface-400);
    border: 1px solid var(--border-ds-surface-400);
  }

  .input::placeholder {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: var(--text-ds-neutral-400);
  }

  .input-request {
    display: flex;
    flex-direction: row;
    margin-top: 35px;
  }

  .required-mark-primary {
    color: var(--text-ds-danger-400);
    font-family: "Inter", sans-serif;
  }
</style>
