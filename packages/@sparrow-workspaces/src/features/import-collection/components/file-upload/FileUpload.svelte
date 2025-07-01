<script lang="ts">
  import {
    validateClientJSON,
    validateClientXML,
  } from "@sparrow/common/utils/importCollectionValidations";
  import { Button } from "@sparrow/library/ui";

  import { Drop } from "../../components";
  import { Sleep } from "@sparrow/common/utils";

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
    isFileImportCollectionLoading = true;
    if (file) {
      const response = await onImportOapiFile(
        currentWorkspaceId,
        file,
        uploadFileType,
      );
      if (response.isSuccessful) {
        onCloseModal();
        await new Sleep().setTime(200).exec();
        isFileImportCollectionLoading = false;
        return;
      }
    }
    isFileImportCollectionLoading = false;
  };

  let isFileImportCollectionLoading = false;

  const handleFileImportCollection = async () => {
    await handleFileUpload(uploadCollection?.file?.value);
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
  <p class="sparrow-fs-12" style="color:var(--text-secondary-1000)">
    Please upload your Postman collections in v2.1 specification. Currently, we
    don't support Postman Collection v2.0, and importing this version might
    result in some data loss.
  </p>
</div>

<Button
  title={"Import Collection"}
  onClick={handleFileImportCollection}
  type="primary"
  disable={isFileImportCollectionLoading ||
    !(isValidFile && !isValidateFileLoading)}
  loader={isFileImportCollectionLoading}
  customWidth={"100%"}
  size={"large"}
/>

<style lang="scss">
  #file-input {
    display: none;
  }

  .empty-data-error {
    color: var(--error--color);
    line-height: 18px;
    letter-spacing: 0em;
    padding: 2px;
  }

  .sparrow-fs-12 {
    font-size: 12px;
  }

  .fw-normal {
    font-weight: 400;
  }

  .text-start {
    text-align: left;
  }

  textarea,
  input {
    outline: none;
  }
</style>
