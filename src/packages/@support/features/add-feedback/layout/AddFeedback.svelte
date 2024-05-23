<script lang="ts">
  import { Input, Select, Textarea } from "@library/forms";
  import { AttachmentIcon, CrossIcon, PlusIcon } from "@library/icons";
  import { Button, Modal } from "@library/ui";
  import Drop from "../components/Drop/Drop.svelte";
  import { notifications } from "@library/ui/toast/Toast";

  export let onSendFeedback;

  let type = "Feedback";
  let feedbackDescription = "";
  let subCategory = "Usability";
  let feedbackSubject = "";
  let isExposeFeedbackForm = false;
  let isLoading = false;
  let uploadFeedback = {
    file: {
      value: [],
    },
  };

  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const errorMessage =
      "Failed to upload the file. Please check the file size or the format";
    const targetFile = e?.target?.files;
    const dataTransferFile = e?.dataTransfer?.files;
    if (targetFile?.length === 0 || dataTransferFile?.length === 0) {
      return;
    }
    if (targetFile?.length > 5 || dataTransferFile?.length > 5) {
      uploadFeedback.file.value = [];
      // notifications.error("too much files");
      notifications.error(errorMessage);
      return;
    }
    let vedioCount = 0;
    for (let i = 0; i < (targetFile?.length || dataTransferFile?.length); i++) {
      const fileType = `.${(
        (targetFile && targetFile[i]?.name) ||
        (dataTransferFile && dataTransferFile[i]?.name)
      )
        .split(".")
        .pop()
        .toLowerCase()}`;
      if (
        ((targetFile && targetFile[i].size > maxSize * 2048) ||
          (dataTransferFile && dataTransferFile[i].size > maxSize * 2048)) &&
        (fileType === ".jpg" || fileType === ".jpeg" || fileType === ".png")
      ) {
        uploadFeedback.file.value = [];
        // alert("image size exceeded");
        notifications.error(errorMessage);
        return;
      } else if (
        ((targetFile && targetFile[i].size > maxSize * 10000) ||
          (dataTransferFile && dataTransferFile[i].size > maxSize * 1000)) &&
        fileType === ".mp4"
      ) {
        uploadFeedback.file.value = [];
        // alert("vedio size exceeded");
        notifications.error(errorMessage);
        return;
      } else if (!supportedFileTypes.includes(fileType)) {
        uploadFeedback.file.value = [];
        alert("wrong format file upload");
        return;
      }
      if (fileType === ".mp4") {
        vedioCount = vedioCount + 1;
      }
    }
    if (vedioCount > 1) {
      uploadFeedback.file.value = [];
      // alert("only accepts 1 vedio at a time");
      notifications.error(errorMessage);
      return;
    }
    uploadFeedback.file.value = targetFile || dataTransferFile;
  };
  const removeFile = (index) => {
    const files = Array.from(uploadFeedback.file.value).filter((elem, i) => {
      if (i !== index) {
        return true;
      }
      return false;
    });
    uploadFeedback.file.value = files;
  };
</script>

<div class="pb-3">
  <button
    on:click={() => {
      isExposeFeedbackForm = true;
    }}
    class="add-feedback w-100 outline-none border-0 border-radius-4 text-fs-14"
  >
    <PlusIcon
      height={"18px"}
      width={"18px"}
      color={"var(--bg-secondary-100)"}
    /> Add Feedback
  </button>
</div>
<div class="position-relative">
  <Modal
    title={"Add Feedback"}
    type={"dark"}
    width={"40%"}
    zIndex={10000}
    isOpen={isExposeFeedbackForm}
    handleModalState={(flag = false) => {
      isExposeFeedbackForm = flag;
    }}
  >
    <div class="pt-2"></div>
    <div class="d-flex pb-2">
      <Select
        id={"feeds"}
        data={[
          {
            name: "Feedback",
            id: "Feedback",
          },
          {
            name: "Bugs",
            id: "Bug",
          },
          {
            name: "Feature Request",
            id: "Feature Request",
          },
        ]}
        zIndex={499}
        titleId={type}
        onclick={(id = "") => {
          type = id;
          if (type === "Feedback") {
            subCategory = "Usability";
          } else if (type === "Bug") {
            subCategory = "Low";
          } else {
            subCategory = "";
          }
        }}
        disabled={false}
        borderType={"none"}
        borderActiveType={"none"}
        borderHighlight={"hover-active"}
        headerHighlight={"hover-active"}
        headerHeight={"36px"}
        minBodyWidth={"150px"}
        minHeaderWidth={"128px"}
        maxHeaderWidth={"150px"}
        borderRounded={"4px"}
        headerTheme={"violet2"}
        bodyTheme={"violet"}
        menuItem={"v2"}
        headerFontSize={"10px"}
        isDropIconFilled={true}
        position={"absolute"}
      />
    </div>
    {#if type === "Feedback" || type === "Bug"}
      <p class="text-fs-14">Category</p>
      <div class="d-flex gap-1 pb-4">
        <!-- subCategory  starts-->
        {#if type === "Feedback"}
          <input
            type="radio"
            id="Usability"
            name="option"
            value="Usability"
            bind:group={subCategory}
          />
          <label
            for="Usability"
            class="text-fs-12 border-radius-4 {subCategory === 'Usability'
              ? 'label-active'
              : ''}">Usability</label
          ><br />
          <input
            type="radio"
            id="Documentation"
            name="option"
            value="Documentation"
            bind:group={subCategory}
          />
          <label
            for="Documentation"
            class="text-fs-12 border-radius-4 {subCategory === 'Documentation'
              ? 'label-active'
              : ''}">Documentation</label
          ><br />
          <input
            type="radio"
            id="Performance"
            name="option"
            value="Performance"
            bind:group={subCategory}
          />
          <label
            for="Performance"
            class="text-fs-12 border-radius-4 {subCategory === 'Performance'
              ? 'label-active'
              : ''}">Performance</label
          ><br />
        {/if}

        {#if type === "Bug"}
          <input
            type="radio"
            id="Low"
            name="option"
            value="Low"
            bind:group={subCategory}
          />
          <label
            for="Low"
            class="text-fs-12 border-radius-4 {subCategory === 'Low'
              ? 'label-active'
              : ''}">Low</label
          ><br />
          <input
            type="radio"
            id="Medium"
            name="option"
            value="Medium"
            bind:group={subCategory}
          />
          <label
            for="Medium"
            class="text-fs-12 border-radius-4 {subCategory === 'Medium'
              ? 'label-active'
              : ''}">Medium</label
          ><br />
          <input
            type="radio"
            id="High"
            name="option"
            value="High"
            bind:group={subCategory}
          />
          <label
            for="High"
            class="text-fs-12 border-radius-4 {subCategory === 'High'
              ? 'label-active'
              : ''}">High</label
          ><br />
          <input
            type="radio"
            id="Critical"
            name="option"
            value="Critical"
            bind:group={subCategory}
          />
          <label
            for="Critical"
            class="text-fs-12 border-radius-4 {subCategory === 'Critical'
              ? 'label-active'
              : ''}">Critical</label
          ><br />
        {/if}

        <!-- subCategory ends -->
      </div>
    {/if}
    <div>
      <p class="text-fs-14 mb-0 text-secondary-150">Description</p>
      <p class="text-fs-12 text-secondary-200">
        {500 - feedbackDescription.length} characters left
      </p>

      <div class="p-2 bg-tertiary-300 mb-3">
        <Input
          width={"100%"}
          type="text"
          bind:value={feedbackSubject}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-20 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={false}
          placeholder="Subject"
        />
        <hr class="mt-1 mb-2" />
        <Textarea
          width={"100%"}
          height={"120px"}
          bind:value={feedbackDescription}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-14 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={false}
          placeholder="Add description..."
          maxlength={500}
        />
      </div>

      <div class="drop-box mb-2">
        <Drop
          maxFileSize={2048}
          onChange={handleLogoInputChange}
          labelDescription="Choose an image or video, or drag and drop it here."
          inputId="upload--feedback-file-input"
          inputPlaceholder="Drag and Drop or"
          supportedFileTypes={[".png", ".jpg", ".jpeg", ".mp4"]}
          height={"80px"}
        />
        <div class="d-flex justify-content-between">
          <div></div>
          <div>
            <span class="text-fs-12 text-tertiary-100"
              >{uploadFeedback.file.value.length || 0}/5</span
            >
          </div>
        </div>
      </div>
    </div>
    {#if uploadFeedback?.file?.value?.length > 0}
      <div class="d-flex gap-1">
        {#each uploadFeedback.file.value as file, index}
          <div
            class="files d-flex align-items-center bg-tertiary-300 mb-2 px-3 py-1 border-radius-4"
          >
            <span>
              <AttachmentIcon
                height={"12px"}
                width={"12px"}
                color={"var(--text-secondary-200)"}
              />
            </span>
            <span class="mb-0 text-fs-12 px-2">{file.name}</span>
            <span
              on:click={() => {
                removeFile(index);
              }}
              ><CrossIcon
                height={"12px"}
                width={"9px"}
                color={"var(--text-secondary-200)"}
              /></span
            >
          </div>
        {/each}
      </div>
    {/if}

    <div class="d-flex align-items-center justify-content-between">
      <div></div>
      <div class="d-flex">
        <Button
          type={"violet"}
          title={"Cancel"}
          buttonClassProp={"me-2"}
          onClick={async () => {
            isExposeFeedbackForm = false;
          }}
        />
        <Button
          type={"primary"}
          title={"Add"}
          loader={isLoading}
          onClick={async () => {
            isLoading = true;
            const res = await onSendFeedback(
              uploadFeedback,
              type,
              feedbackSubject,
              feedbackDescription,
              subCategory,
            );
            isLoading = false;
            if (res.isSuccessful) {
              isExposeFeedbackForm = false;
            }
          }}
        />
      </div>
    </div>
  </Modal>
</div>

<style>
  .add-feedback {
    padding: 10px 16px 10px 12px;
    background-color: var(--bg-primary-300);
  }
  .add-feedback:hover {
    background-color: var(--bg-primary-250);
  }
  .add-feedback:active {
    background-color: var(--bg-primary-500);
  }
  input[type="radio"] {
    display: none;
  }
  label {
    border: 1px solid var(--border-primary-300);
    padding: 2px 8px 2px 8px;
    color: var(--text-secondary-200);
    cursor: pointer;
  }
  .label-active {
    background-color: var(--bg-primary-300);
    color: var(--text-secondary-100);
  }
</style>
