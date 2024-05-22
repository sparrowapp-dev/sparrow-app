<script lang="ts">
  import { Select } from "@library/forms";
  import { PlusIcon } from "@library/icons";
  import { Button, Modal } from "@library/ui";
  import Drop from "../components/Drop/Drop.svelte";
  import { notifications } from "@library/ui/toast/Toast";

  export let onSendFeedback;

  let dropdownTitle = "Feedback";
  let feedbackDescription = "";
  let isExposeFeedbackForm = false;
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
    console.log(e);
    const targetFile = e?.target?.files;
    const dataTransferFile = e?.dataTransfer?.files;
    if (targetFile.length === 0) {
      return;
    }
    if (targetFile.length > 5) {
      uploadFeedback.file.value = [];
      // notifications.error("too much files");
      notifications.error(errorMessage);
      return;
    }
    let vedioCount = 0;
    for (let i = 0; i < targetFile.length; i++) {
      const fileType = `.${(
        (targetFile && targetFile[i]?.name) ||
        (dataTransferFile && dataTransferFile[i]?.name)
      )
        .split(".")
        .pop()
        .toLowerCase()}`;
      if (
        (((targetFile && targetFile[i].size > maxSize * 2048) ||
          (dataTransferFile && dataTransferFile[i].size > maxSize * 2048)) &&
          fileType === ".jpg") ||
        fileType === ".jpeg" ||
        fileType === ".png" ||
        fileType === ".pdf"
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

  const handleLogoReset = (e: any) => {
    uploadFeedback.file = {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    };
    // handleUpdateTeam(TeamProperty.IMAGE);
  };

  const handleLogoEdit = (e: any) => {
    const uploadFileInput = document.getElementById(
      "upload-team-icon-file-input2",
    );
    uploadFileInput.click();
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
    width={"55%"}
    zIndex={10000}
    isOpen={isExposeFeedbackForm}
    handleModalState={(flag = false) => {
      isExposeFeedbackForm = flag;
    }}
  >
    <div class="d-flex">
      <Select
        id={"hash999"}
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
        titleId={dropdownTitle}
        onclick={(id = "") => {
          dropdownTitle = id;
          //   onUpdateRequestState({ requestAuthNavigation: id });
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
        headerTheme={"violet"}
        bodyTheme={"violet"}
        menuItem={"v2"}
        headerFontSize={"10px"}
        isDropIconFilled={true}
        position={"absolute"}
      />
    </div>
    <div>
      <p>Category</p>
      <p>Description</p>
      <p>12 characters left</p>
      <textarea class="w-100" bind:value={feedbackDescription} />
      <Drop
        value={uploadFeedback.file.value}
        maxFileSize={2048}
        onChange={handleLogoInputChange}
        iconHeight={30}
        iconWidth={30}
        resetValue={handleLogoReset}
        editValue={handleLogoEdit}
        labelText=""
        labelDescription="Drag and drop your image. We recommend that you upload an image with square aspect ratio.The image size should not be more than 2 MB. Supported formats are .jpg, .jpeg, .png"
        labelDescriptionSize={"14px"}
        inputId="upload-team-icon-file-input2"
        inputPlaceholder="Drag and Drop or"
        isRequired={false}
        supportedFileTypes={[".png", ".jpg", ".jpeg", ".pdf", ".mp4"]}
        showFileSizeError={uploadFeedback.file.showFileSizeError}
        showFileTypeError={uploadFeedback.file.showFileTypeError}
        fileTypeError="This file type is not supported. Please reupload in any of the following file formats."
        fileSizeError="The size of the file you are trying to upload is more than 100 KB."
        width={"80px"}
        height={"80px"}
      />
    </div>
    {#if uploadFeedback?.file?.value?.length > 0}
      {#each uploadFeedback.file.value as file}
        <p>{file.name}</p>
      {/each}
    {/if}

    <div class="d-flex align-items-center justify-content-between">
      <div></div>
      <div class="d-flex">
        <Button
          type={"dark"}
          title={"Cancel"}
          buttonClassProp={"me-2"}
          onClick={async () => {
            isExposeFeedbackForm = false;
          }}
        />
        <Button
          type={"primary"}
          title={"Add"}
          onClick={async () => {
            await onSendFeedback({
              files: [...uploadFeedback.file.value],
              type: dropdownTitle,
              description: feedbackDescription,
              subCategory: "High",
            });
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
</style>
