<script lang="ts">
  import { notifications } from "@sparrow/library/ui";
  import { Spinner } from "@sparrow/library/ui";
  import { CollectionService } from "@app/services/collection.service";
  import { Select } from "@sparrow/library/forms";
  import {
    debounce,
    isUrlValid,
    validateClientJSON,
    validateClientURL,
    validateClientXML,
    validateImportBody,
  } from "@sparrow/common/utils/importCollectionValidations";
  import { invoke } from "@tauri-apps/api/core";
  import { Button } from "@sparrow/library/ui";
  import { ContentTypeEnum, ResponseStatusCode } from "@sparrow/common/enums";
  import { TickMarkRoundedIcon as TickMark } from "@sparrow/library/assets";
  import { Drop } from "../components";
  import { InfoIcon } from "@sparrow/library/icons";

  export let currentWorkspaceId;
  export let isurl = false;
  export let onClick: (flag: boolean) => void;
  const _collectionService = new CollectionService();

  export let onImportJSONObject;
  export let onItemCreated;
  export let collectionList;
  export let onCollectionFileUpload;
  export let onImportCollectionURL;

  const ProgressTitle = {
    IDENTIFYING_SYNTAX: "Identifying Syntax...",
    FETCHING_DATA: "Fetching Data...",
  };

  let isInputDataTouched = false;
  let isTextEmpty: boolean = true;
  let isFileEmpty: boolean = true;
  let isSyntaxError: boolean = false;
  let importData: string = "";
  let importType: string = "text";
  let activeSync = false;

  let progressBar = {
    isLoading: false,
    isProgress: false,
    title: ProgressTitle.IDENTIFYING_SYNTAX,
  };

  const handleError = () => {
    isSyntaxError = false;
    isTextEmpty = false;
    isFileEmpty = false;
  };

  let isimportDataLoading = false;

  let isValidClientURL = false,
    isValidClientJSON = false,
    isValidClientXML = false,
    isValidClientDeployedURL = false;

  let isValidServerURL = false,
    isValidServerJSON = false,
    isValidServerXML = false,
    isValidServerDeployedURL = false;

  const handleInputField = async () => {
    isimportDataLoading = true;
    isValidClientURL = false;
    isValidClientJSON = false;
    isValidClientXML = false;
    isValidServerURL = false;
    isValidServerJSON = false;
    isValidServerXML = false;
    isValidClientDeployedURL = false;
    isValidServerDeployedURL = false;

    if (validateClientURL(importData)) {
      if (
        importData.includes("://127.0.0.1") ||
        importData.includes("://localhost")
      ) {
        isValidClientURL = true;
        const response = await _collectionService.validateImportCollectionURL(
          importData.replace("localhost", "127.0.0.1"),
        );
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res = await _collectionService.validateImportCollectionInput(
              "",
              JSON.parse(response?.data?.response),
            );
            if (res.isSuccessful) {
              isValidServerURL = true;
            } else {
              notifications.error(res.message);
            }
          } catch (e) {}
        }
      } else {
        isValidClientDeployedURL = true;
        const response =
          await _collectionService.validateImportCollectionURL(importData);
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res = await _collectionService.validateImportCollectionInput(
              "",
              JSON.parse(response?.data?.response),
            );
            if (res.isSuccessful) {
              isValidServerDeployedURL = true;
            }
          } catch (e) {}
        }
      }
    } else if (validateClientJSON(importData)) {
      isValidClientJSON = true;
      const response = await _collectionService.validateImportCollectionInput(
        "",
        importData,
      );
      if (response.isSuccessful) {
        isValidServerJSON = true;
        importData = JSON.stringify(JSON.parse(importData), null, 3);
      }
    } else if (validateClientXML(importData)) {
      const response = await _collectionService.validateImportCollectionInput(
        "",
        importData,
      );
      if (response.isSuccessful) {
        isValidClientXML = true;
        isValidServerXML = true;
      }
    }
    isInputDataTouched = true;
    isimportDataLoading = false;
  };
  let uploadCollection = {
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };
  let uploadFileType = "";

  const validateFileUpload = async (_fileUploadData: string): boolean => {
    if (
      validateClientJSON(_fileUploadData) ||
      validateClientXML(_fileUploadData)
    ) {
      const response =
        await _collectionService.validateImportCollectionFileUpload(
          "",
          _fileUploadData,
        );
      if (response.isSuccessful) {
        uploadFileType = response.data.type;
        return true;
      }
    }
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
    uploadCollection.file.invalid = false;
    uploadCollection.file.value = targetFile && targetFile[0];
    isFileEmpty = false;

    // Read the file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target?.result;
      const res = await validateFileUpload(fileContent);
      if (res) {
        uploadCollection.file.invalid = false;
      } else {
        uploadCollection.file.invalid = true;
        uploadCollection.file.value = [];
      }
    };
    reader.readAsText(targetFile ? targetFile[0] : "");
  };

  const handleLogoReset = (e: any) => {
    uploadCollection.file.value = [];
  };

  async function handleFileUpload(file: Request) {
    if (file) {
      progressBar.isLoading = true;
      progressBar.isProgress = false;
      progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
      const response = await onCollectionFileUpload(
        currentWorkspaceId,
        file,
        uploadFileType,
      );
      if (response.isSuccessful) {
        progressBar.title = ProgressTitle.FETCHING_DATA;
        progressBar.isProgress = true;
        onClick(false);
      } else {
        progressBar.isLoading = false;
        isSyntaxError = true;
      }
    }
  }

  const validateJSON = (data) => {
    return validateImportBody(data);
  };

  let isLoading = false;
  const handleImport = async () => {
    isLoading = true;
    isInputDataTouched = true;
    if (activeSync) {
      isRepositoryPathTouched = true;
    }
    if (isRepositoryPath) {
      isRepositoryBranchTouched = true;
    }
    if (importType === "text" && importData === "") {
      isTextEmpty = true;
    }
    if (
      importType === "text" &&
      importData &&
      ((isValidClientJSON && isValidServerJSON) ||
        (isValidClientXML && isValidServerXML))
    ) {
      const contentType = validateJSON(importData);
      handleImportJsonObject(contentType, importData);
    } else if (
      importType === "text" &&
      importData &&
      isValidClientDeployedURL &&
      isValidServerDeployedURL
    ) {
      const response =
        await _collectionService.validateImportCollectionURL(importData);
      if (response?.data?.status === ResponseStatusCode.OK) {
        handleImportJsonObject(
          ContentTypeEnum["application/json"],
          response.data.response,
        );
      }
    } else if (
      importType === "text" &&
      importData &&
      isValidClientURL &&
      isValidServerURL
    ) {
      const importUrl = importData.replace("localhost", "127.0.0.1");

      const response =
        await _collectionService.validateImportCollectionURL(importUrl);
      if (!activeSync && response?.data?.status === ResponseStatusCode.OK) {
        const requestBody = {
          urlData: {
            data: JSON.parse(response.data.response),
            headers: response.data.headers,
          },
          url: importUrl,
        };
        handleImportUrl(requestBody);
      } else if (
        activeSync &&
        response?.data?.status === ResponseStatusCode.OK &&
        isRepositoryPath &&
        repositoryBranch &&
        repositoryPath &&
        repositoryBranch !== "not exist" &&
        currentBranch
      ) {
        if (
          getBranchList
            .map((elem) => {
              return elem.name;
            })
            .includes(currentBranch)
        ) {
          const requestBody = {
            urlData: {
              data: JSON.parse(response.data.response),
              headers: response.data.headers,
            },
            url: importUrl,
            primaryBranch: repositoryBranch,
            currentBranch: currentBranch,
            localRepositoryPath: repositoryPath,
          };
          handleImportUrl(requestBody);
        } else {
          notifications.error(
            `Can't import local branch. Please push ${currentBranch} to remote first.`,
          );
        }
      }
    } else if (
      importType === "file" &&
      uploadCollection?.file?.value?.length !== 0
    ) {
      handleFileUpload(uploadCollection?.file?.value);
      isLoading = false;
      return;
    } else if (
      importType === "file" &&
      uploadCollection?.file?.value?.length === 0
    ) {
      isFileEmpty = true;
      uploadCollection.file.invalid = true;
    }
    isLoading = false;
  };

  const handleImportJsonObject = async (contentType, importJSON) => {
    if (!contentType) {
      progressBar.isLoading = false;
      isSyntaxError = true;
      return;
    }
    progressBar.isLoading = true;
    progressBar.isProgress = false;
    progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
    const response = await onImportJSONObject(
      currentWorkspaceId,
      importJSON,
      contentType,
    );
    if (response.isSuccessful) {
      progressBar.title = ProgressTitle.FETCHING_DATA;
      progressBar.isProgress = true;
      onClick(false);
    } else {
      progressBar.isLoading = false;
      isSyntaxError = true;
    }
  };

  const handleImportUrl = async (requestBody) => {
    progressBar.isLoading = true;
    progressBar.isProgress = false;
    progressBar.title = ProgressTitle.IDENTIFYING_SYNTAX;
    const response = await onImportCollectionURL(
      currentWorkspaceId,
      requestBody,
      activeSync,
    );
    if (response.isSuccessful) {
      progressBar.title = ProgressTitle.FETCHING_DATA;
      progressBar.isProgress = true;
      onClick(false);
    } else {
      progressBar.isLoading = false;
      isSyntaxError = true;
    }
  };
  let repositoryPath = "";
  let isRepositoryPath = false;
  let isRepositoryPathTouched = false;
  let getBranchList = [];
  const uploadFormFile = async () => {
    const filePathResponse: string = await invoke("fetch_folder_command");
    if (filePathResponse !== "Canceled") {
      await extractGitBranch(filePathResponse);
    }
  };

  const extractGitBranch = async (filePathResponse) => {
    repositoryPath = "";
    currentBranch = "";
    repositoryBranch = "not exist";
    getBranchList = [];
    isRepositoryPath = false;

    repositoryPath = filePathResponse;
    try {
      const response = await invoke("get_git_branches", {
        path: repositoryPath,
      });
      if (response) {
        getBranchList = response
          .filter((elem) => {
            if (elem.startsWith("upstream/")) return false;
            else if (elem.startsWith("origin/HEAD -> origin/")) {
              const branchIterator = elem;
              repositoryBranch = branchIterator.replace(
                /^origin\/HEAD -> origin\//,
                "",
              );
              return false;
            }
            return true;
          })
          .map((elem) => {
            return {
              name: elem.replace(/^origin\//, ""),
              id: elem.replace(/^origin\//, ""),
              hide: false,
            };
          });
        isRepositoryPath = true;
        const activeResponse = await invoke("get_git_active_branch", {
          path: repositoryPath,
        });
        if (activeResponse) {
          currentBranch = activeResponse;
        }
      }
    } catch (e) {}
  };

  let repositoryBranch = "not exist";
  let currentBranch = "";
  let isRepositoryBranchTouched = false;
  let handleDropdown = (tabId: string) => {
    isRepositoryBranchTouched = true;
    repositoryBranch = tabId;
  };
  const debouncedImport = debounce(handleInputField, 1000);
  let isInfoIconHovered = false;

  const handleMouseEnter = () => {
    isInfoIconHovered = true;
  };

  const handleMouseLeave = () => {
    isInfoIconHovered = false;
  };
</script>

<!-- {#if progressBar.isLoading}
  <ProgressBar
    {onClick}
    title={progressBar.title}
    zIndex={10000}
    isProgress={progressBar.isProgress}
  />
{/if} -->

<div class="d-flex pt-3">
  <div class="form-check import-type-inp">
    <input
      class="form-check-input"
      type="radio"
      name="flexRadioDefault"
      id="flexRadioDefault1"
      value="text"
      bind:group={importType}
      on:click={() => {
        isInputDataTouched = false;
      }}
    />
    <label class="form-check-label text-fs-14" for="flexRadioDefault1">
      Paste Text
    </label>
  </div>
  <div class="form-check import-type-inp">
    <input
      class="form-check-input"
      type="radio"
      name="flexRadioDefault"
      id="flexRadioDefault2"
      value="file"
      bind:group={importType}
      on:click={() => {
        isInputDataTouched = false;
      }}
    />
    <label class="form-check-label text-fs-14" for="flexRadioDefault2">
      Upload File
    </label>
  </div>
  {#if importType === "file"}
    <div
      class="info-icon"
      style="margin-left: auto;"
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
    >
      <InfoIcon
        height={"17px"}
        width={"17px"}
        color={isInfoIconHovered
          ? "var(--icon-primary-300)"
          : "var(--icon-secondary-100)"}
      />
      {#if isInfoIconHovered}
        <div class="tooltip">
          Nested folders display is not supported.<br />
          They will be flattened during import.
          <div class="tooltip-arrow"></div>
        </div>
      {/if}
    </div>
  {/if}
</div>
<br />
{#if importType === "text"}
  <div>
    <p class="sparrow-fs-12 mb-1" style="color:var(--text-secondary-1000)">
      Paste your OAS text or Swagger/Localhost Link
    </p>
  </div>
  <div class="textarea-div rounded border-0 position-relative">
    <textarea
      on:input={() => {
        isimportDataLoading = true;
        isInputDataTouched = true;
        isTextEmpty = false;
        debouncedImport();
      }}
      on:blur={() => {
        isInputDataTouched = true;
      }}
      placeholder="Example - OpenAPI JSON text or http://localhost:8080/api-docs"
      bind:value={importData}
      class="text-area mb-0 border-0 text-fs-12 rounded bg-tertiary-300 pe-4 ps-2 pb-2 pt-2"
      style={!isValidServerDeployedURL &&
      !isValidServerJSON &&
      !isValidServerURL &&
      !isValidServerXML &&
      !isimportDataLoading &&
      isInputDataTouched
        ? `border: 1px solid var(--dangerColor) !important;`
        : ``}
    />
    {#if isimportDataLoading}
      <div class="position-absolute" style="right: 10px; top:10px;">
        <Spinner size={`16px`} />
      </div>
    {:else if (isValidClientURL && isValidServerURL && isInputDataTouched) || (isValidClientXML && isValidServerXML && isInputDataTouched) || (isValidClientDeployedURL && isValidServerDeployedURL && isInputDataTouched) || (isValidClientJSON && isValidServerJSON && isInputDataTouched)}
      <div class="position-absolute" style="right: 10px; top:8px;">
        <TickMark />
      </div>
    {/if}
  </div>
  {#if !importData && isInputDataTouched && !isimportDataLoading}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      Please paste your OpenAPI specification text or Swagger/localhost link.
    </p>
  {:else if (!isimportDataLoading && isValidClientDeployedURL && !isValidServerDeployedURL && isInputDataTouched) || (!isimportDataLoading && isValidClientURL && !isValidServerURL && isInputDataTouched) || (!isTextEmpty && !isimportDataLoading && isValidClientXML && !isValidServerXML && isInputDataTouched) || (!isTextEmpty && !isimportDataLoading && isValidClientJSON && !isValidServerJSON && isInputDataTouched) || (!isTextEmpty && !isimportDataLoading && !isValidClientJSON && !isValidClientURL && !isValidClientXML && !isValidServerJSON && !isValidServerURL && !isValidServerXML && !isValidClientDeployedURL && !isValidServerDeployedURL && isInputDataTouched)}
    <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
      We have identified that the text you have pasted is not written in OpenAPI
      Specification (OAS). Please visit https://swagger.io/specification/ for
      more information on OAS.
    </p>
  {/if}
{/if}

{#if importType === "file"}
  <div>
    <p class="sparrow-fs-12 mb-1" style="color:var(--text-secondary-1000)">
      Upload files in YAML/JSON format, or JSON files exported from Postman
      (v2.1)
    </p>
  </div>
  <div>
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
    {#if isInputDataTouched && uploadCollection.file.invalid && isFileEmpty}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        Please upload a file to import collection.
      </p>
    {:else if isInputDataTouched && uploadCollection.file.invalid}
      <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
        Invalid file format. Please upload a YAML/JSON (OAS) or Postman v2.1
        file format.
      </p>
    {/if}
  </div>
  <div>
    <p class="sparrow-fs-12 mb-1" style="color:var(--text-secondary-1000)">
      Please upload your Postman collections in v2.1 specification. Currently,
      we don't support Postman Collection v2.0, and importing this version might
      result in some data loss.
    </p>
  </div>
{/if}
{#if importType === "text" && isValidClientURL && isValidServerURL && false}
  <div>
    <div>
      <small class="text-textColor sparrow-fs-12"
        >This link supports Active Sync.</small
      >
    </div>
    <div class="enable-active-sync">
      <div class="form-check form-switch ps-0 position-relative">
        <div class="d-flex justify-content-between flex-column">
          <span class="sparrow-fs-14 mb-1">Enable Active Sync</span>
          <small class="text-textColor sparrow-fs-12"
            >Enabling Active Sync auto-updates APIs via Swagger Link.</small
          >
        </div>
        <div class="custom-switch position-absolute end-0" style="top: 10%;">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            style="cursor: pointer;"
            bind:checked={activeSync}
            id="enableActiveSync"
          />
          <label class="slider" for="enableActiveSync"></label>
        </div>
      </div>
    </div>
    <!-- <div class="d-flex align-items-center gap-2 pb-2">
        <img src={linkIcon} alt="" />
        <a class="learn-active-link sparrow-fs-12" href="" on:click={() => {}}
          >Learn more about Active Sync</a
        >
      </div> -->
    {#if activeSync}
      <!-- Local repository path -->
      <div>
        <p class="sparrow-fs-14 mb-1">
          Paste or browse local repository path <span class="asterik">*</span>
        </p>
        <div class="pb-2">
          <small class="sparrow-fs-12 text-textColor"
            >The repository location is required to track your branch.</small
          >
        </div>
        <div class="d-flex justify-content-between pb-2">
          <div class="position-relative w-100 me-3">
            <input
              class="p-2 pe-4 bg-blackColor w-100 rounded border-0 sparrow-fs-12"
              type="text"
              style="width:80%; {(!repositoryPath && isRepositoryPathTouched) ||
              (!isRepositoryPath && isRepositoryPathTouched)
                ? `border: 1px solid var(--dangerColor) !important`
                : ``}"
              placeholder="Paste or browse path"
              bind:value={repositoryPath}
              on:input={() => {
                extractGitBranch(repositoryPath);
              }}
              on:blur={() => {
                isRepositoryPathTouched = true;
              }}
            />
            {#if repositoryPath && isRepositoryPath && isRepositoryPathTouched}
              <div class="position-absolute" style="right: 10px; top:4px;">
                <TickMark />
              </div>
            {/if}
          </div>
          <Button
            disable={false}
            title={"Browse"}
            textStyleProp={"font-size: var(--base-text);"}
            type={"dark"}
            loader={false}
            onClick={async () => {
              await uploadFormFile();
              isRepositoryPathTouched = true;
            }}
          />
        </div>
        {#if !repositoryPath && isRepositoryPathTouched}
          <div>
            <p
              class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start"
            >
              Please paste or browse local repository path.
            </p>
          </div>
        {:else if !isRepositoryPath && isRepositoryPathTouched}
          <div>
            <p
              class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start"
            >
              Repository is not found at the provided location. Please ensure
              that the path is accurate and accessible.
            </p>
          </div>
        {/if}
      </div>
      {#if isRepositoryPath}
        <div>
          <div>
            <p class="sparrow-fs-14 mb-1">
              Select Primary Branch <span class="asterik">*</span>
            </p>
            <div class="pb-2">
              <small class="sparrow-fs-12 text-textColor"
                >The selected primary branch is considered the default branch.</small
              >
            </div>

            <div
              class="bg-blackColor rounded w-100"
              style="width:80%; {repositoryBranch === 'not exist' &&
              isRepositoryBranchTouched
                ? `border: 1px solid var(--dangerColor) !important`
                : ``}"
            >
              <Select
                isError={repositoryBranch === "not exist" &&
                  isRepositoryBranchTouched}
                id={"select-branch"}
                headerHighlight={"hover"}
                data={[
                  {
                    name: "Select Branch",
                    id: "not exist",
                    color: "whiteColor",
                    default: true,
                    hide: true,
                  },
                  ...getBranchList,
                ]}
                titleId={repositoryBranch}
                onclick={handleDropdown}
                maxBodyHeight={"150px"}
                maxHeaderWidth={"900px"}
              />
            </div>
            {#if repositoryBranch === "not exist" && isRepositoryBranchTouched}
              <div>
                <p
                  class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start"
                >
                  Please select primary branch.
                </p>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<div
  class="d-flex flex-column align-items-center justify-content-end rounded mt-4"
>
  <button
    class="d-flex align-items-center justify-content-center border-0 w-100 py-2 fs-6 border-radius-2
       btn-primary"
    on:click={() => {
      handleImport();
    }}
    disabled={isLoading}
  >
    <span class="me-3">
      {#if progressBar.isLoading || isLoading}
        <Spinner size={"16px"} />
      {:else}
        Import Collection
      {/if}</span
    >
  </button>
  <p class="importData-whiteColor my-3 sparrow-fs-14 fw-light">OR</p>
  <button
    class="btn-primary border-0 w-100 py-2 fs-6 border-radius-2"
    on:click={() => {
      onItemCreated("collection", {
        workspaceId: currentWorkspaceId,
        collection: collectionList,
      });
      onClick(false);
    }}>Create Empty Collection</button
  >
</div>

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

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover {
    background-color: var(--background-dropdown);
  }

  .btn-close1:active {
    background-color: var(--background-dropdown);
  }
  .btn-primary {
    background-color: var(--bg-primary-300);
  }
  .btn-primary:hover {
    background-color: var(--bg-primary-400);
  }
  .btn-primary:active {
    background-color: var(--bg-primary-600);
  }
  .btn-disabled {
    background-color: var(--button-disabled);
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
</style>
