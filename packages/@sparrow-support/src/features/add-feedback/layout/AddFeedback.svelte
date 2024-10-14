<script lang="ts">
  import { Input, Select, Textarea } from "@sparrow/library/forms";
  import {
    AttachmentIcon,
    CategoryIcon,
    CrossIcon,
    PlusIcon,
  } from "@sparrow/library/icons";
  import { Button, Modal } from "@sparrow/library/ui";
  import { notifications } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { Drop } from "@sparrow/support/components";
  import { FeedbackType } from "@sparrow/support/types";

  export let onAddFeedback;
  export let onInputFeedback;
  export let selectId = "";

  let type: FeedbackType = FeedbackType.CATEGORY;
  let feedbackDescription = "";
  let feedbackSubject = "";
  let uploadFeedback = {
    file: {
      value: [],
    },
  };
  export let isExposeFeedbackForm = false;
  let isLoading = false;
  let isDescriptionEmpty = false;
  let isSubjectEmpty = false;
  let isTextArea = false;
  let isSelectEmpty = false;

  const handleLogoInputChange = (e: any) => {
    const errorMessage =
      "Failed to upload the file. You are allowed to upload only 5 files per feedback.";

    let targetFile = [
      ...uploadFeedback.file.value,
      ...(e?.target?.files || e?.dataTransfer?.files),
    ];
    const maxImageSize = 2097152; // 2 MB
    if (targetFile?.length === 0) {
      return;
    }
    let isErrorThrown = false;
    const selectedFiles = targetFile.filter((file) => {
      const fileType = `.${(file?.name).split(".").pop().toLowerCase()}`;

      if (
        fileType === ".jpg" ||
        fileType === ".jpeg" ||
        fileType === ".png" ||
        fileType === ".svg"
      ) {
        if (file.size > maxImageSize) {
          // image size exceeded
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

    e.target.value = "";
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

<div class=" w-100">
  <Tooltip title="Feedback" placement="top" distance={13}>
    <button
      on:click={() => {
        const res = onAddFeedback();
        isExposeFeedbackForm = res;
      }}
      class="add-feedback w-100 outline-none border-0 border-radius-4 text-fs-14 fw-normal"
    >
      <PlusIcon height={"20"} width={"20"} />
      <span class="px-2"> Add Feedback</span>
    </button>
  </Tooltip>
</div>
<div class="position-relative">
  <Modal
    title={"Add Feedback"}
    type={"dark"}
    width={"50%"}
    zIndex={10000}
    isOpen={isExposeFeedbackForm}
    handleModalState={(flag = false) => {
      isExposeFeedbackForm = flag;
      feedbackDescription = "";
      feedbackSubject = "";
      isSelectEmpty = false;
      isDescriptionEmpty = false;
      isSubjectEmpty = false;
      isTextArea = false;
      type = FeedbackType.CATEGORY;
      uploadFeedback = {
        file: {
          value: [],
        },
      };
    }}
  >
    <div class="pt-2"></div>
    <div class="d-flex pb-2">
      <Select
        data={[
          {
            name: "Feature Request",
            id: FeedbackType.FEATURE_REQUEST,
          },
          {
            name: "UI Improvement",
            id: FeedbackType.UI_IMPROVEMENT,
          },
          {
            name: "Bugs",
            id: FeedbackType.BUG,
          },
        ]}
        iconRequired={true}
        icon={CategoryIcon}
        placeholderText={"Category"}
        id={`feeds-${selectId}`}
        zIndex={499}
        titleId={type}
        onclick={(id = "") => {
          type = id;
          isSelectEmpty = false;
        }}
        disabled={false}
        borderType={"none"}
        borderActiveType={"none"}
        borderHighlight={"hover-active"}
        headerHighlight={"hover-active"}
        headerHeight={"36px"}
        minBodyWidth={"150px"}
        minHeaderWidth={"161px"}
        maxHeaderWidth={"200px"}
        borderRounded={"4px"}
        headerTheme={"violet2"}
        bodyTheme={"violet"}
        menuItem={"v2"}
        headerFontSize={"13px"}
        isDropIconFilled={true}
        position={"absolute"}
      />
    </div>
    {#if isSelectEmpty}
      <p class="error-message">Please select a feedback category.</p>
    {/if}
    <div style="">
      <p
        class="text-fs-14 mb-0"
        style="color: var(--text-secondary-1000); font-weight: 400;"
      >
        Description
      </p>
      <p class="text-fs-12 text-secondary-200 mb-1">
        {feedbackDescription.length} / 200
      </p>

      <div
        class="p-2 bg-tertiary-300 {isDescriptionEmpty ||
        isSubjectEmpty ||
        isTextArea
          ? 'empty-data-error mb-0'
          : 'mb-3'}"
        style="height: 137px; border-radius: 4px; color:#676A80; "
      >
        <Input
          on:input={() => {
            if (feedbackSubject.length > 0) {
              isSubjectEmpty = false;
              isTextArea = false;
            }
          }}
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
          maxlength={200}
        />
        <hr class="m-0 ms-2" style="padding-bottom:5px;" />
        <Textarea
          on:input={() => {
            if (feedbackDescription.length > 0) {
              isDescriptionEmpty = false;
              isTextArea = false;
            }
          }}
          id="feedback-description"
          height={"90px"}
          bind:value={feedbackDescription}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-14 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;
           "
          disabled={false}
          placeholder="Add short description"
          maxlength={200}
        />
      </div>

      {#if isSubjectEmpty}
        <p class="error-message">Enter a relevant subject for feedback.</p>
      {/if}
      {#if isDescriptionEmpty}
        <p class="error-message">Enter a relevant description for feedback.</p>
      {/if}
      {#if isTextArea}
        <p class="error-message">
          Please enter subject and description for adding a feedback.
        </p>
      {/if}

      <div class="drop-box mb-2" style="">
        <Drop
          styleProp={""}
          maxFileSize={2048}
          onChange={handleLogoInputChange}
          labelDescription="Choose an image or drag and drop it here."
          inputId="upload--feedback-file-input"
          inputPlaceholder="Drag and Drop or"
          supportedFileTypes={[".png", ".jpg", ".jpeg", ".svg"]}
          height={"80px"}
          infoMessage={"Images: SVG, PNG, JPG, JPEG <br/> (limit 2MB each)<br/> No video files, only images <br/> are accepted"}
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
      <div class="file-scroller mb-2 d-flex gap-1 flex-wrap">
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
            isSelectEmpty = false;
            isDescriptionEmpty = false;
            isSubjectEmpty = false;
            isTextArea = false;
            feedbackDescription = "";
            feedbackSubject = "";
            type = FeedbackType.CATEGORY;
            uploadFeedback = {
              file: {
                value: [],
              },
            };
          }}
        />
        <Button
          type={"primary"}
          title={"Add"}
          loader={isLoading}
          onClick={async () => {
            isLoading = true;

            // Check if the category is not selected
            if (type === FeedbackType.CATEGORY) {
              isSelectEmpty = true; // Mark the select as empty to show an error message
              isLoading = false;
              return;
            }

            if (!feedbackDescription || !feedbackSubject) {
              if (!feedbackDescription && !feedbackSubject) {
                isTextArea = true;
                isSubjectEmpty = isDescriptionEmpty = false;
              } else {
                isTextArea = false;
                isSubjectEmpty = !feedbackSubject;
                isDescriptionEmpty = !feedbackDescription;
              }

              isLoading = false;
            } else {
              isSubjectEmpty = isDescriptionEmpty = isTextArea = false;
              const res = await onInputFeedback(
                feedbackSubject,
                feedbackDescription,
                type === FeedbackType.CATEGORY
                  ? FeedbackType.ALL_CATEGORY
                  : type,
                uploadFeedback,
              );
              if (res?.isSuccessful) {
                isExposeFeedbackForm = false;
                type = FeedbackType.CATEGORY;
                feedbackDescription = "";
                feedbackSubject = "";
                uploadFeedback = {
                  file: {
                    value: [],
                  },
                };
              }
            }
            isLoading = false;
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
  .file-scroller::-webkit-scrollbar {
    display: none;
  }
  .empty-data-error {
    border: 1px solid var(--error--color);
  }
  .error-message {
    color: var(--error--color);
    font-size: 12px;
    margin-bottom: 20px;
  }
</style>
