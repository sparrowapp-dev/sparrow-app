<script>
  import { Button } from "@sparrow/library/ui";
  import { HttpUrlSection } from "../../features/rest-explorer/components";

  export let handleModalState;
  let requestName = "New REST API";
  let requestURL = "New REST API";
  let httpRequestMethod = "GET";
  let isAddingNode = false;
</script>

<!-- Section for the modal content -->
<section>
  <div class="header-label mb-3 text-white">New Request</div>

  <div>
    <div class="input-label">Request Name</div>

    <input
      type="text"
      bind:value={requestName}
      on:input={() => {
        // onUpdateAiPrompt(prompt);
      }}
      class="w-100 pe-5 py-2 ps-2 border-radius-4 text-fs-12 mt-2 input input-label text-white"
      autofocus
      placeholder="Enter request name"
    />
  </div>

  <div class="mt-4">
    <!-- HTTP URL Section -->
    <HttpUrlSection
      class=""
      isSaveLoad={false}
      isSave={false}
      requestUrl={requestURL}
      httpMethod={httpRequestMethod}
      isSendRequestInProgress={false}
      onSendButtonClicked={() => {}}
      onCancelButtonClicked={() => {}}
      showSendButton={false}
      isCustomRequestPopup={true}
    />
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end" style="margin-top: 28px;">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
        disable={isAddingNode}
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"secondary"}
        onClick={() => {
          handleModalState(false); // Close the modal
        }}
      />
    </span>
    <Button
      disable={false}
      title={"Create"}
      textClassProp={"fs-6"}
      type={"primary"}
      onClick={() => {
        handleModalState(false);
      }}
      loader={isAddingNode}
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
</style>
