<script lang="ts">
  import { Spinner, Tag, Toggle } from "@sparrow/library/ui";
  import {
    debounce,
    validateClientJSON,
    validateClientURL,
    validateClientXML,
    validateImportBody,
  } from "@sparrow/common/utils/importCollectionValidations";
  import { Button } from "@sparrow/library/ui";
  import { ContentTypeEnum, ResponseStatusCode } from "@sparrow/common/enums";
  import { TickMarkRoundedIcon as TickMark } from "@sparrow/library/assets";
  import { policyConfig } from "@sparrow/common/store";

  export let currentWorkspaceId;
  export let onCloseModal;

  export let onGetOapiTextFromURL; // Sends http request to the URL and get the (JSON / XML) text of Oapi                               (1)

  export let onValidateOapiText; // Sends the (JSON / XML) text to the server (checks format and syntax) and returns true or false      (2)

  export let onImportOapiText; // Sends the (JSON / XML) text to backend and create a collection                                        (3)

  export let isActiveSyncRequired;
  export let isActiveSyncPlanModalOpen;
  export let onImportPostmanCollection;

  let isInputDataTouched = false;
  let isTextEmpty: boolean = true;
  let importData: string = "";
  let postmanCollectionJson: string = "";
  let importType: string = "text";
  let activeSync = false;

  let isValidateTextLoading = false;

  let isValidClientURL = false,
    isValidClientJSON = false,
    isValidClientXML = false,
    isValidClientDeployedURL = false,
    isValidPostmanCollectionURL = false;

  let isValidServerURL = false,
    isValidServerJSON = false,
    isValidServerXML = false,
    isValidServerDeployedURL = false;

  let isActiveSyncEnabled = false;
  const handleInputField = async () => {
    isValidateTextLoading = true;
    isValidClientURL = false;
    isValidPostmanCollectionURL = false;
    isValidClientJSON = false;
    isValidClientXML = false;
    isValidServerURL = false;
    isValidServerJSON = false;
    isValidServerXML = false;
    isValidClientDeployedURL = false;
    isValidServerDeployedURL = false;

    if (validateClientURL(importData)) {
      if (importData.includes("api.postman.com")) {
        const postmanResponse = await onGetOapiTextFromURL(importData);
        if (postmanResponse?.data?.status === ResponseStatusCode.OK) {
          isValidPostmanCollectionURL = true;
          postmanCollectionJson = postmanResponse.data.body;
        }
      } else if (
        importData.includes("://127.0.0.1") ||
        importData.includes("://localhost")
      ) {
        isValidClientURL = true;
        const response = await onGetOapiTextFromURL(importData);
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res = await onValidateOapiText(response);
            if (res?.isSuccessful) {
              isValidServerURL = true;
            }
          } catch (e) {}
        }
      } else {
        isValidClientDeployedURL = true;
        const response = await onGetOapiTextFromURL(importData);
        if (response?.data?.status === ResponseStatusCode.OK) {
          try {
            const res = await onValidateOapiText(response);
            if (res.isSuccessful) {
              isValidServerDeployedURL = true;
            }
          } catch (e) {}
        }
      }
    } else if (validateClientJSON(importData)) {
      isValidClientJSON = true;
      const response = await onValidateOapiText({
        data: {
          body: importData,
        },
      });
      if (response.isSuccessful) {
        isValidServerJSON = true;
        importData = JSON.stringify(JSON.parse(importData), null, 3);
      }
    } else if (validateClientXML(importData)) {
      const response = await onValidateOapiText({
        data: {
          body: importData,
        },
      });
      if (response.isSuccessful) {
        isValidClientXML = true;
        isValidServerXML = true;
      }
    }
    isInputDataTouched = true;
    isValidateTextLoading = false;
  };

  const handlePostmanUrl = async () => {
    try {
      const response = await onImportPostmanCollection(
        currentWorkspaceId,
        postmanCollectionJson,
      );
      if (response.isSuccessful) {
        onCloseModal();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const validateJSON = (data) => {
    return validateImportBody(data);
  };

  let isTextImportCollectionLoading = false;
  const handleTextImportCollection = async () => {
    isTextImportCollectionLoading = true;

    if (
      (isValidClientJSON && isValidServerJSON) ||
      (isValidClientXML && isValidServerXML)
    ) {
      /**
       * Handle imports using JSON / XML textarea
       */
      const contentType = validateJSON(importData);
      await handleImportJsonObject(contentType, importData);
    } else if (isValidClientDeployedURL && isValidServerDeployedURL) {
      /**
       * Handle imports using deployed URL
       */
      const response = await onGetOapiTextFromURL(importData);
      const contentType = validateJSON(importData);
      if (response?.data?.status === ResponseStatusCode.OK) {
        await handleImportJsonObject(
          ContentTypeEnum["application/json"],
          response?.data?.body,
          isActiveSyncEnabled,
        );
      }
    } else if (isValidClientURL && isValidServerURL) {
      /**
       * Handle imports using localhost URL
       */
      const response = await onGetOapiTextFromURL(importData);
      if (!activeSync && response?.data?.status === ResponseStatusCode.OK) {
        const contentType = validateJSON(response?.data?.body);
        await handleImportJsonObject(
          contentType,
          response?.data?.body,
          isActiveSyncEnabled,
        );
      }
    } else if (isValidPostmanCollectionURL && postmanCollectionJson.length) {
      await handlePostmanUrl();
    }
    isTextImportCollectionLoading = false;
  };

  const handleImportJsonObject = async (
    contentType,
    importJSON,
    activeSyncEnabled = false,
  ) => {
    if (!contentType) {
      return;
    }
    const response = await onImportOapiText(
      currentWorkspaceId,
      importJSON,
      contentType,
      activeSyncEnabled,
      importData,
    );
    if (response.isSuccessful) {
      onCloseModal();
    }
  };

  const debouncedImport = debounce(handleInputField, 1000);
</script>

<div class="w-100">
  <p class="sparrow-fs-12 mb-1" style="color:var(--text-secondary-1000)">
    Paste OAS Text, Postman Collection or Swagger/Localhost Link <span
      class="required-mark">*</span
    >
  </p>
</div>
<div class="w-100 textarea-div rounded border-0 position-relative">
  <textarea
    on:input={() => {
      isValidateTextLoading = true;
      isInputDataTouched = true;
      isTextEmpty = false;
      debouncedImport();
    }}
    on:blur={() => {
      isInputDataTouched = true;
    }}
    placeholder={"Eg: OpenAPI JSON text or http://localhost:8080/api/docs-json "}
    bind:value={importData}
    class="text-area mb-1 border-0 text-fs-12 rounded bg-tertiary-300 pe-4 ps-2 pb-2 pt-2"
    style={!isValidServerDeployedURL &&
    !isValidServerJSON &&
    !isValidServerURL &&
    !isValidServerXML &&
    !isValidPostmanCollectionURL &&
    !isValidateTextLoading &&
    isInputDataTouched
      ? `border: 1px solid var(--dangerColor) !important;`
      : ``}
  />
  {#if isValidateTextLoading}
    <div class="position-absolute" style="right: 10px; top:10px;">
      <Spinner size={`16px`} />
    </div>
  {:else if (isValidClientURL && isValidServerURL && isInputDataTouched) || (isValidClientXML && isValidServerXML && isInputDataTouched) || (isValidPostmanCollectionURL && isInputDataTouched) || (isValidClientDeployedURL && isValidServerDeployedURL && isInputDataTouched) || (isValidClientJSON && isValidServerJSON && isInputDataTouched)}
    <div class="position-absolute" style="right: 10px; top:8px;">
      <TickMark />
    </div>
  {/if}
</div>
{#if !importData && isInputDataTouched && !isValidateTextLoading}
  <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
    Please paste your OpenAPI specification text, Postman Collection or
    Swagger/localhost link.
  </p>
{:else if !isValidateTextLoading && isInputDataTouched && !((isValidClientURL && isValidServerURL) || (isValidClientXML && isValidServerXML) || isValidPostmanCollectionURL || (isValidClientDeployedURL && isValidServerDeployedURL) || (isValidClientJSON && isValidServerJSON))}
  <p class="empty-data-error sparrow-fs-12 fw-normal w-100 text-start">
    We have identified that the text you have pasted is not a Postman Collection
    or written in OpenAPI Specification (OAS). Please visit
    https://swagger.io/specification/ for more information on OAS.
  </p>
{/if}

{#if !isValidateTextLoading && (isValidServerDeployedURL || isValidServerURL) && importType === "text"}
  <div
    class="d-flex"
    style="justify-content: space-between; align-items:flex-start; margin-top:10px;"
  >
    {#if !$policyConfig.disableActiveSync}
      <div>
        <div class="d-flex">
          <p
            class="text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
            style="color: var(--text-ds-neutral-200); margin-bottom:0px; margin-right:8px;"
          >
            Enable active sync
          </p>
          <Tag type="cyan" text={"Beta"} />
        </div>
        <p
          class="text-ds-font-size-12 text-ds-font-weight-medium"
          style="color: var(--text-ds-neutral-400);"
        >
          Keeps your Sparrow collection in sync with your Swagger in real-time.
          While edits are allowed, adding or deleting APIs is disabled to
          maintain consistency.
        </p>
      </div>
      <Toggle
        isActive={isActiveSyncEnabled}
        onChange={() => {
          if (isActiveSyncRequired) {
            isActiveSyncEnabled = !isActiveSyncEnabled;
          } else {
            isActiveSyncPlanModalOpen = true;
            onCloseModal();
          }
        }}
      />
    {/if}
  </div>
{/if}
<Button
  title="Import Collection"
  onClick={handleTextImportCollection}
  type="primary"
  disable={isTextImportCollectionLoading ||
    !(
      ((isValidClientURL && isValidServerURL && isInputDataTouched) ||
        (isValidClientXML && isValidServerXML && isInputDataTouched) ||
        (isValidPostmanCollectionURL && isInputDataTouched) ||
        (isValidClientDeployedURL &&
          isValidServerDeployedURL &&
          isInputDataTouched) ||
        (isValidClientJSON && isValidServerJSON && isInputDataTouched)) &&
      !isValidateTextLoading
    )}
  loader={isTextImportCollectionLoading}
  customWidth={"100%"}
  size={"large"}
/>

<style lang="scss">
  .text-area::placeholder {
    color: var(--text-tertiary-100);
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

  .enable-active-sync {
    margin: 1% 0;
    padding: 1% 2%;
    border-radius: 10px;
  }

  textarea {
    width: 100%;
    resize: vertical;
    height: 120px !important;
    margin-bottom: 5%;
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

  .textarea-div {
    border: 2px solid red;
  }

  .btn-close1 {
    background-color: var(--background-color);
  }

  .btn-close1:hover,
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

  .required-mark {
    color: var(--text-ds-danger-400);
    font-family: "Inter", sans-serif;
  }
</style>
