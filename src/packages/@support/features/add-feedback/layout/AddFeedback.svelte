<script lang="ts">
  import { Input, Select, Textarea } from "@library/forms";
  import { AttachmentIcon, CrossIcon, PlusIcon } from "@library/icons";
  import { Button, Modal } from "@library/ui";
  import Drop from "../components/Drop/Drop.svelte";
  import { notifications } from "@library/ui/toast/Toast";

  export let onSendFeedback;

  enum FeedbackType {
    FEEDBACK = "Feedback",
    BUG = "Bug",
    FEATURE_REQUEST = "Feature Request",
  }

  enum FeedbackSubCategory {
    USABILITY = "Usability",
    DOCUMENTATION = "Documentation",
    PERFORMANCE = "Performance",
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    CRITICAL = "Critical",
  }

  let type: FeedbackType = FeedbackType.FEEDBACK;
  let feedbackDescription = "";
  let subCategory: FeedbackSubCategory = FeedbackSubCategory.USABILITY;
  let feedbackSubject = "";
  let uploadFeedback = {
    file: {
      value: [],
    },
  };
  let isExposeFeedbackForm = false;
  let isLoading = false;

  const handleLogoInputChange = (e: any) => {
    const errorMessage =
      "Failed to upload the file. Please check the file size or the format";

    let targetFile = [
      ...uploadFeedback.file.value,
      ...(e?.target?.files || e?.dataTransfer?.files),
    ];
    const maxVedioSize = 10485760; // 10 MB
    const maxImageSize = 2097152; // 2 MB
    if (targetFile?.length === 0) {
      return;
    }
    let vedioCount = 0;
    let isErrorThrown = false;
    const selectedFiles = targetFile.filter((file) => {
      const fileType = `.${(file?.name).split(".").pop().toLowerCase()}`;

      if (fileType === ".jpg" || fileType === ".jpeg" || fileType === ".png") {
        if (file.size > maxImageSize) {
          // image size exceeded
          isErrorThrown = true;
          return false;
        }
        return true;
      } else if (fileType === ".mp4") {
        vedioCount = vedioCount + 1;
        if (vedioCount >= 2) {
          // vedio limit exceeded
          isErrorThrown = true;
          return false;
        }
        if (file.size > maxVedioSize) {
          // vedio size exceeded
          isErrorThrown = true;
          return false;
        }
        return true;
      } else {
        isErrorThrown = true;
        return false;
      }
    });
    if (selectedFiles.length > 5) {
      selectedFiles.length = 5;
      isErrorThrown = true;
    }
    if (isErrorThrown) {
      notifications.error(errorMessage);
    }
    uploadFeedback.file.value = selectedFiles;
  };
  const removeFile = (index: number) => {
    const files = Array.from(uploadFeedback.file.value).filter((elem, i) => {
      if (i !== index) {
        return true;
      }
      return false;
    });
    uploadFeedback.file.value = files;
  };
</script>

<div class="pb-3 w-100">
  <button
    on:click={() => {
      isExposeFeedbackForm = true;
    }}
    class="add-feedback w-100 outline-none border-0 border-radius-4 text-fs-14 fw-normal"
  >
    +Add Feedback
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
            id: FeedbackType.FEEDBACK,
          },
          {
            name: "Bug",
            id: FeedbackType.BUG,
          },
          {
            name: "Feature Request",
            id: FeedbackType.FEATURE_REQUEST,
          },
        ]}
        zIndex={499}
        titleId={type}
        onclick={(id = "") => {
          type = id;
          if (type === FeedbackType.FEEDBACK) {
            subCategory = FeedbackSubCategory.USABILITY;
          } else if (type === FeedbackType.BUG) {
            subCategory = FeedbackSubCategory.LOW;
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
            id={FeedbackSubCategory.USABILITY}
            name="option"
            value={FeedbackSubCategory.USABILITY}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.USABILITY}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.USABILITY
              ? 'label-active'
              : ''}">Usability</label
          ><br />
          <input
            type="radio"
            id={FeedbackSubCategory.DOCUMENTATION}
            name="option"
            value={FeedbackSubCategory.DOCUMENTATION}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.DOCUMENTATION}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.DOCUMENTATION
              ? 'label-active'
              : ''}">Documentation</label
          ><br />
          <input
            type="radio"
            id={FeedbackSubCategory.PERFORMANCE}
            name="option"
            value={FeedbackSubCategory.PERFORMANCE}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.PERFORMANCE}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.PERFORMANCE
              ? 'label-active'
              : ''}">Performance</label
          ><br />
        {/if}

        {#if type === "Bug"}
          <input
            type="radio"
            id={FeedbackSubCategory.LOW}
            name="option"
            value={FeedbackSubCategory.LOW}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.LOW}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.LOW
              ? 'label-active'
              : ''}">Low</label
          ><br />
          <input
            type="radio"
            id={FeedbackSubCategory.MEDIUM}
            name="option"
            value={FeedbackSubCategory.MEDIUM}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.MEDIUM}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.MEDIUM
              ? 'label-active'
              : ''}">Medium</label
          ><br />
          <input
            type="radio"
            id={FeedbackSubCategory.HIGH}
            name="option"
            value={FeedbackSubCategory.HIGH}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.HIGH}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.HIGH
              ? 'label-active'
              : ''}">High</label
          ><br />
          <input
            type="radio"
            id={FeedbackSubCategory.CRITICAL}
            name="option"
            value={FeedbackSubCategory.CRITICAL}
            bind:group={subCategory}
          />
          <label
            for={FeedbackSubCategory.CRITICAL}
            class="text-fs-12 border-radius-4 {subCategory ===
            FeedbackSubCategory.CRITICAL
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
        {500 - feedbackDescription.length < 0
          ? 0
          : 500 - feedbackDescription.length} characters left
      </p>

      <div class="p-2 bg-tertiary-300 mb-3">
        <Input
          id="feedback-subject"
          width={"100%"}
          type="text"
          isEditIconRequired={false}
          bind:value={feedbackSubject}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-20 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={false}
          placeholder="Subject"
          maxlength={500}
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
          infoMessage={"Images: PNG, JPEG (Max 2 MB each). Video: MP4 (Max 10 MB, only 1 video allowed)"}
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
      <div class="file-scroller mb-2 d-flex gap-1 overflow-auto">
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
            <span class="mb-0 text-fs-12 px-2 ellipsis">{file.name}</span>
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
              type = FeedbackType.FEEDBACK;
              feedbackDescription = "";
              subCategory = FeedbackSubCategory.USABILITY;
              feedbackSubject = "";
              uploadFeedback = {
                file: {
                  value: [],
                },
              };
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
  .file-scroller::-webkit-scrollbar {
    display: none;
  }
</style>
