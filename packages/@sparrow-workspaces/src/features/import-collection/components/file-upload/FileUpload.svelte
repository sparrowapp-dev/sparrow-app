<script lang="ts">
  import {
    validateClientJSON,
    validateClientXML,
  } from "@sparrow/common/utils/importCollectionValidations";
  import { Button } from "@sparrow/library/ui";

  import { Drop } from "../../components";

  export let currentWorkspaceId;
  export let onCloseModal;

  export let onValidateOapiFile; // Sends the (JSON / XML) file to the server (checks format and syntax) and returns true or false      (2)

  export let onImportOapiFile; // Sends the (JSON / XML) file to backend and create a collection                                        (3)

  let isInputDataTouched = false;

  let uploadCollection = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
      showFileSyntaxError: false,
    },
  };
  let uploadFileType = "";
  let isValidateFileLoading = false;
  let isValidFile = false;
  const validateFileUpload = async (
    _fileUploadData: string,
  ): Promise<boolean> => {
    isValidateFileLoading = true;
    isValidFile = false;
    if (
      validateClientJSON(_fileUploadData) ||
      validateClientXML(_fileUploadData)
    ) {
      const response = await onValidateOapiFile(_fileUploadData);
      if (response.isSuccessful) {
        uploadFileType = response.data.type;
        isValidateFileLoading = false;
        isValidFile = true;
        uploadCollection.file.invalid = false;
        return true;
      } else {
        uploadCollection.file.invalid = true;
        uploadCollection.file.showFileSyntaxError = true;
        uploadCollection.file.showFileSizeError = false;
        uploadCollection.file.showFileTypeError = false;
        uploadCollection.file.value = [];
        isValidFile = false;
        isValidateFileLoading = false;
        return false;
      }
    }
    uploadCollection.file.invalid = true;
    uploadCollection.file.value = [];
    isValidFile = false;
    isValidateFileLoading = false;
    return false;
  };

  const handleFileInputChange = async (
    e: any,
    maxSize: number,
    supportedFileTypes: string[],
  ) => {
    isInputDataTouched = true;
    const targetFile = e?.target?.files || e?.dataTransfer?.files;

    if (targetFile && targetFile[0].size > maxSize * 1024) {
      uploadCollection.file.showFileSizeError = true;
      uploadCollection.file.invalid = true;
      return;
    }
    const fileType = `.${(targetFile && targetFile[0]?.name)
      .split(".")
      .pop()
      .toLowerCase()}`;
    if (!supportedFileTypes.includes(fileType)) {
      uploadCollection.file.showFileTypeError = true;
      uploadCollection.file.invalid = true;
      return;
    }
    uploadCollection.file.showFileSizeError = false;
    uploadCollection.file.showFileTypeError = false;
    uploadCollection.file.showFileSyntaxError = false;
    uploadCollection.file.invalid = false;
    uploadCollection.file.value = targetFile && targetFile[0];

    // Read the file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target?.result;
      await validateFileUpload(fileContent);
    };
    reader.readAsText(targetFile ? targetFile[0] : "");
  };

  const handleLogoReset = (e: any) => {
    uploadCollection.file.value = [];
    isValidFile = false;
  };

  const handleFileUpload = async (file: Request) => {
    if (file) {
      const response = await onImportOapiFile(
        currentWorkspaceId,
        file,
        uploadFileType,
      );
      if (response.isSuccessful) {
        onCloseModal();
      }
    }
  };

  let isFileImportCollectionLoading = false;

  const handleFileImportCollection = async () => {
    isFileImportCollectionLoading = true;
    await handleFileUpload(uploadCollection?.file?.value);
    isFileImportCollectionLoading = false;
    return;
  };
</script>

<div class="w-100">
  <p class="sparrow-fs-12 mb-1" style="color:var(--text-secondary-1000)">
    Upload files in YAML/JSON format, or JSON files exported from Postman (v2.1)
  </p>
</div>
<div class="w-100">
  <Drop
    value={uploadCollection.file.value}
    maxFileSize={10000}
    onChange={handleFileInputChange}
    resetValue={handleLogoReset}
    inputId="upload-collection-file-input"
    inputPlaceholder="Drag and Drop or"
    supportedFileTypes={[".yaml", ".json"]}
    isError={uploadCollection.file.invalid && isInputDataTouched}
    title={"Drag & drop your YAML/JSON or Postman (v2.1) JSON file or"}
  />
</div>
<div>
  {#if isInputDataTouched && uploadCollection.file.invalid && uploadCollection.file.showFileSizeError}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      File size exceed, Plese upload a file less than 10 MB.
    </p>
  {:else if isInputDataTouched && uploadCollection.file.invalid && uploadCollection.file.showFileTypeError}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      Invalid file format. Please upload a YAML/JSON (OAS) or Postman v2.1 file
      format.
    </p>
  {:else if isInputDataTouched && uploadCollection.file.invalid && uploadCollection.file.showFileSyntaxError}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      We have identified that the file you have uploaded is not written in
      OpenAPI Specification (OAS). Please visit
      https://swagger.io/specification/ for more information on OAS.
    </p>
  {:else if isInputDataTouched && uploadCollection.file.invalid}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      Please upload a file to import collection.
    </p>
  {/if}
</div>
<div>
  <p class="sparrow-fs-12 mb-1" style="color:var(--text-secondary-1000)">
    Please upload your Postman collections in v2.1 specification. Currently, we
    don't support Postman Collection v2.0, and importing this version might
    result in some data loss.
  </p>
</div>

<Button
  title={"Import Collection"}
  onClick={handleFileImportCollection}
  type="primary"
  disable={!(isValidFile && !isValidateFileLoading)}
  loader={isFileImportCollectionLoading}
  customWidth={"100%"}
  size={"large"}
/>

<style lang="scss">
  .text-area::placeholder {
    color: var(--text-tertiary-100);
  }
  #file-input {
    display: none;
  }

  .import-type-inp {
    padding: 1% 2%;
    margin-right: 5%;
  }
  .import-type-inp input {
    margin-left: 0;
    margin-right: 5px;
    border-width: 2px;
  }
  .info-icon {
    margin-top: 1%;
    margin-right: 1%;
    display: inline-block;
    position: relative;
  }

  .tooltip {
    position: absolute;
    top: 110%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--bg-secondary-530);
    color: var(--text-secondary-1000);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1;
    opacity: 1;
  }

  .tooltip-arrow {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent var(--bg-secondary-530) transparent;
  }

  .info-icon-container:hover .tooltip {
    display: block;
  }

  .info-icon:hover {
    cursor: pointer;
  }

  .enable-active-sync {
    margin: 1% 0;
    padding: 1% 2%;
    border-radius: 10px;
  }
  .enable-active-sync input {
    background-color: var(--defaultcolor);
  }
  .enable-active-sync:hover {
    background-color: var(--keyvalue-pair);
  }

  textarea {
    width: 100%;
    resize: vertical;
    height: calc(100px) !important;
    margin-bottom: 5%;
  }
  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: 13;
  }
  .empty-data-error {
    color: var(--error--color);
    line-height: 18px;
    letter-spacing: 0em;
    padding: 2px;
  }
  textarea,
  input {
    outline: none;
  }
  .container {
    display: flex;
    position: fixed;
    top: 50%;
    left: 50%;
    max-width: calc(488px);
    transform: translate(-50%, -50%);
    background-color: var(--background-color);
    z-index: 14;
    border-radius: 10px;
  }

  .textarea-div {
    height: 25%;
    border: 2px solid red;
  }

  .learn-active-link {
    color: var(--primary-btn-color) !important;
    text-decoration: none;
  }
  .asterik {
    color: var(--dangerColor);
    margin-left: 4px;
  }
  .invalid-type-content {
    .format-types-container {
      display: flex;
      justify-content: space-between;
      width: 25%;
    }
    .format-header {
      line-height: 18px;
      letter-spacing: 0em;
    }

    .format-info {
      line-height: 18px;
      letter-spacing: 0em;
    }
    .format-type {
      line-height: 18px;
      letter-spacing: 0em;
      border: 1px solid var(--border-color);
      border-radius: 10px;
    }
    .format-btns {
      width: 100%;
      display: flex;
      justify-content: end;
      gap: 10px;
    }
    .format-btn {
      background-color: var(--border-color);
      border: none;
      border-radius: 4px;
      font-family: Roboto;
      line-height: 24px;
      letter-spacing: 0em;
    }
    .format-btn:hover {
      background-color: #616364;
    }
    .collection-btn {
      background-color: var(--sparrow-blue);
      color: var(--white-color);
      line-height: 24px;
      letter-spacing: 0em;
      text-align: center;
    }
    .collection-btn:hover {
      background-color: var(--send1-hoverbutton);
    }
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
  }

  .custom-switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
  }

  .custom-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    border-radius: 100px;
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--defaultcolor);
    transition: 200ms;
  }

  .slider:before {
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    content: "";
    height: 16px;
    width: 16px;
    background-color: var(--bg-secondary-100);
    transition: 200ms;
  }
  .form-check-input {
    border: 1px solid var(--border-secondary-100);
    background-color: var(--bg-tertiary-300) !important;
    background-image: none !important;
  }
  .form-check-input:checked:hover {
    border: 3px solid var(--border-primary-300);
    background-color: var(--bg-tertiary-300);
    outline: 5px solid var(--border-tertiary-300);
    outline-offset: -1px;
  }
  .form-check-input:hover {
    border: 3px solid var(--border-primary-300);
    background-color: var(--bg-tertiary-300);
    outline: 5px solid var(--border-tertiary-300);
    outline-offset: -1px;
  }
  .form-check-input:checked {
    background-color: var(--bg-tertiary-750) !important;
    border: 4.5px solid var(--border-primary-300) !important;
  }
  .form-check-label {
    color: var(--text-secondary-100);
  }
  input:checked + .slider {
    background-color: var(--sparrow-input-slider-button);
  }

  input:checked + .slider:before {
    background-color: var(--send-button);
    transform: translateX(16px);
  }
  .required-mark {
    color: var(--text-ds-danger-400);
    font-family: "Inter", sans-serif;
  }
</style>
