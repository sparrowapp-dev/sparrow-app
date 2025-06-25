<script lang="ts">
  import { Select } from "@sparrow/library/forms";
  import { Button } from "@sparrow/library/ui";
  import { Input } from "@sparrow/library/forms";
  import { httpMethodData } from "../../../../@sparrow-common/src/utils/testFlow.helper";

  export let handleModalState;
  export let handleCreateCustomRequest;

  export let requestName = "";
  export let requestURL = "";
  export let httpRequestMethod = "GET";

  const handleDropdown = (tabId: any) => {
    httpRequestMethod = tabId;
  };
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
    />
  </div>

  <div class="input-request">
    <!-- HTTP URL Section -->
    <Select
      variant={"light-violet"}
      id={"custom-modal"}
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
      />
    </div>
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end" style="margin-top: 52px;">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
        disable={false}
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"secondary"}
        onClick={() => {
          handleModalState(false); // Close the modal
        }}
      />
    </span>
    <Button
      disable={!requestName?.trim()}
      title={"Create"}
      textClassProp={"fs-6"}
      type={"primary"}
      onClick={() => {
        handleCreateCustomRequest(
          requestName?.trim() || "New Request",
          httpRequestMethod,
          requestURL,
        );
      }}
      loader={false}
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
