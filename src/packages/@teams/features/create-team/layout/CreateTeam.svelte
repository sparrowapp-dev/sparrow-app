<script lang="ts" context="module">
  interface NewTeam {
    name: {
      value: string;
      isTouched: boolean;
      invalid: boolean;
    };
    description: {
      value: string;
      isTouched: boolean;
      invalid: boolean;
    };
    file: {
      value: any;
      invalid: boolean;
      showFileTypeError: boolean;
      showFileSizeError: boolean;
    };
  }
</script>

<script lang="ts">
  import { Input, Textarea } from "@library/forms";
  import { Button } from "@library/ui";
  import { IconUploader } from "../components";
  export let onCreateTeam;
  export let handleModalState;

  const iconFileType = [".jpg", ".jpeg", ".png"];
  let teamUnderSubmission = false;
  let newTeam: NewTeam = {
    name: {
      value: "",
      isTouched: false,
      invalid: false,
    },
    description: {
      value: "",
      isTouched: false,
      invalid: false,
    },
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };

  /**
   * Handles teams icon upload
   * @param e - event file meta data
   * @param maxSize - threshold size of the file that teams accepts in KB (Kilobyte)
   * @param supportedFileTypes - list of supported file extensions => example .jpg
   */
  const handleLogoInputChange = (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    const targetFiles = e?.target?.files || e?.dataTransfer?.files;
    if (targetFiles && targetFiles[0].size > maxSize * 1024) {
      newTeam.file.showFileSizeError = true;
      newTeam.file.invalid = true;
      return;
    }
    const fileType = `.${(targetFiles && targetFiles[0]?.name)
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      newTeam.file.showFileTypeError = true;
      newTeam.file.invalid = true;
      return;
    }
    newTeam.file.showFileSizeError = false;
    newTeam.file.showFileTypeError = false;
    newTeam.file.invalid = false;
    newTeam.file.value = targetFiles && targetFiles[0];
  };

  /**
   * Clears the uploaded team icon
   * @param e - event meta data
   */
  const handleLogoReset = (e: any) => {
    newTeam.file.value = [];
  };

  /**
   * envokes the dialog box to open a new upload window
   * @param e - event meta data
   */
  const handleLogoEdit = (e: any) => {
    const fileInput = document.getElementById("team-file-input");
    fileInput?.click();
  };
</script>

<div class="pb-4 mt-3">
  <label class="text-fs-14 pb-1 text-secondary-1000"
    >Team or Organization name</label
  >
  <span class="sparrow-input-required">*</span>
  <Input
    bind:value={newTeam.name.value}
    on:blur={() => {
      newTeam.name.isTouched = true;
    }}
    height={"36px"}
    id="team-name-input"
    placeholder="Please enter your team name"
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 border-radius-4"
    style="outline:none;"
    defaultBorderColor={!newTeam.name.value && newTeam.name.isTouched
      ? "var(--border-danger-200)"
      : "transparent"}
    hoveredBorderColor={!newTeam.name.value && newTeam.name.isTouched
      ? "var(--border-danger-200)"
      : "transparent"}
    focusedBorderColor={!newTeam.name.value && newTeam.name.isTouched
      ? "var(--border-danger-200)"
      : "transparent"}
    isEditIconRequired={false}
    type={"text"}
    maxlength={500}
    placeholderColor={"var(--text-secondary-200)"}
  />
  {#if !newTeam.name.value && newTeam.name.isTouched}
    <p class="mb-0 mt-1 text-fs-12 text-danger-200">
      Team name cannot be empty.
    </p>
  {/if}
</div>
<div class="pb-4">
  <label class="text-fs-14 text-secondary-1000">About</label>
  <p class="mb-2 text-fs-12 text-secondary-200">max: 500 characters</p>
  <Textarea
    bind:value={newTeam.description.value}
    placeholder="Write a little about your team"
    height={"77px"}
    defaultBorderColor="transparent"
    hoveredBorderColor="transparent"
    focusedBorderColor={"transparent"}
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 py-2 border-radius-4"
    style="outline:none;"
    disabled={false}
    maxlength={500}
    placeholderColor={"var(--text-secondary-200)"}
  />
</div>
<div class="pb-1">
  <label class="text-fs-14 text-secondary-1000">Icon</label>
  {#if !(!Array.isArray(newTeam.file.value) && newTeam.file.value.size > 0)}
    <p class="mb-2 text-fs-12 text-secondary-200">
      Drag and drop your image. We recommend that you upload an image with
      square aspect ratio.The image size should not be more than 2 MB. Supported
      formats are .jpg, .jpeg, .png
    </p>
  {/if}
  <IconUploader
    value={newTeam.file.value}
    maxFileSize={2048}
    onChange={handleLogoInputChange}
    resetValue={handleLogoReset}
    editValue={handleLogoEdit}
    inputId="team-file-input"
    inputPlaceholder="Drag and Drop or"
    supportedFileTypes={iconFileType}
    isError={newTeam.file.invalid}
  />
  <div>
    {#if newTeam.file.showFileSizeError}
      <p class="mb-2 mt-1 text-fs-12 text-danger-200">
        The size of the file you are trying to upload is more than 2 MB.
      </p>
    {:else if newTeam.file.showFileTypeError}
      <p class="mb-2 mt-1 text-fs-12 text-danger-200">
        This file type is not supported. Please reupload in any of the following
        file formats.
      </p>
      <div class="d-flex">
        {#each iconFileType as fileType (fileType)}
          <span
            class="file-type-btn text-fs-12 d-flex align-items-center justify-content-center border-radius-4 me-4 text-secondary-100"
          >
            {fileType}</span
          >
        {/each}
      </div>
    {/if}
  </div>
</div>
<div class="sparrow-modal-footer d-flex justify-content-end mt-4">
  <Button
    disable={teamUnderSubmission}
    title={`Cancel`}
    type="dark"
    buttonClassProp={`me-2`}
    onClick={() => {
      handleModalState(false);
    }}
  />
  <Button
    title={"Create Team"}
    type="primary"
    disable={teamUnderSubmission}
    loader={teamUnderSubmission}
    buttonClassProp={`me-1`}
    onClick={async () => {
      newTeam.name.isTouched = true;
      if (!newTeam.name.value) return;
      teamUnderSubmission = true;
      const response = await onCreateTeam(
        newTeam.name.value,
        newTeam.description.value,
        newTeam.file.value,
      );
      teamUnderSubmission = false;
      if (response.isSuccessful) {
        handleModalState(false);
      }
    }}
  />
</div>

<style>
  .sparrow-input-required {
    color: var(--dangerColor);
  }
  .file-type-btn {
    width: 45px;
    height: 26px;
    border: 1px solid var(--border-tertiary-300);
  }
</style>
