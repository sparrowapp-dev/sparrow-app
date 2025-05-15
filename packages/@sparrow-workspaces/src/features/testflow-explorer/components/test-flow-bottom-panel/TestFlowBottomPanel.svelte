<script lang="ts">
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { TableNavbar } from "../../../../components";
  import {
    CrossIcon,
    CheckmarkCircleRegular,
    ErrorCircleRegular,
    ArrowSwapRegular,
  } from "@sparrow/library/icons";
  import { RequestSectionEnum } from "@sparrow/common/types/workspace";
  import {
    RequestBodyTestFlow,
    RequestHeaderTestFlow,
    RequestNavigatorTestFlow,
    RequestParameterTestFlow,
    RequestAuthorizationTestFlow,
    ResponseErrorScreen,
    ResponseHeaders,
    ResponseNavigator,
    ResponseBody,
    ResponseBodyNavigator,
    ResponseStatus,
  } from "..";
  import SparrowLogo from "../../assets/images/sparrow-logo.svelte";
  import { ResponseStatusCode } from "@sparrow/common/enums";
  import { Alert, Loader } from "@sparrow/library/ui";
  import type { TFResponseStateType } from "@sparrow/common/types/workspace/testflow";
  import * as Sentry from "@sentry/svelte";
  import { currentStep, isTestFlowTourGuideOpen } from "../../../../stores";
  import { emptyRequest } from "../../utils";

  export let selectedBlock;
  export let onClose;
  export let onRedirect;
  export let environmentVariables;
  export let handleUpdateRequestData;
  export let onClearResponse;
  export let onUpdateEnvironment;
  export let userRole;
  export let isWebApp = false;
  export let runSingleNode;
  export let testflowStore;
  export let handleOpenCurrentDynamicExpression;

  let responseLoader = false;
  let height = 300;
  let minHeight = 100;
  let isResizing = false;
  let isResizingActive = false;
  let inputRef;
  let selectedNodeResponse: any = undefined;
  let responseNavigation = "Response";
  let requestNavigation = "Parameters";
  let apiState;
  let isAnyEnvVariableMissing = false;

  const handleResponseState = (_state) => {
    responseState = {
      ...responseState,
      ..._state,
    };
  };

  /**
   * Updates the active tab inside the Request Body section.
   * @param tab - The tab to update.
   * @returns- The updated request navigation.
   */
  const updateActiveTabInsideRequestBody = (tab: string) => {
    if (tab === "Request Body") {
      requestNavigation = "Request Body";
    } else if (tab === "Headers") {
      requestNavigation = "Headers";
    } else if (tab === "Authorization") {
      requestNavigation = "Authorization";
    } else {
      requestNavigation = "Parameters";
    }
    handleUpdateRequestData("requestNavigation", requestNavigation);
    return requestNavigation;
  };

  const truncateName = (name: string, charLimit: number) => {
    return name?.length > charLimit
      ? name.substring(0, charLimit) + "..."
      : name;
  };

  const handleRedirect = () => {
    onRedirect(
      selectedBlock?.data?.workspaceId,
      selectedBlock?.data?.collectionId,
      selectedBlock?.data?.folderId,
      selectedBlock?.data?.requestId,
    );
  };

  const startResize = (event: any) => {
    isResizing = true;
    let startY = event.clientY;
    let startHeight = height;

    function onMouseMove(e) {
      if (isResizing) {
        const maxHeight =
          window.innerHeight < 720
            ? 464
            : Math.round(window.innerHeight * 0.65);
        let newHeight = startHeight - (e.clientY - startY);
        height = Math.max(minHeight, Math.min(maxHeight, newHeight));
      }
    }

    function stopResize() {
      isResizing = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopResize);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopResize);
  };

  /**
   * Updates the navigation inside the Response section.
   * @param tab - The tab to update.
   * @returns - The updated response navigation.
   */
  const updateResponseNavigation = (tab: string) => {
    if (tab === "Response") {
      responseNavigation = "Response";
    } else if (tab === "Headers") {
      responseNavigation = "Headers";
    }
  };

  const handleClickTestButton = async () => {
    try {
      responseLoader = true;
      await runSingleNode(selectedBlock?.id);
    } catch (err) {
      console.error(`Error in run ${selectedBlock?.data?.name} API`, err);
    } finally {
      responseLoader = false;
    }
  };

  let responseState: TFResponseStateType = {
    responseBodyLanguage: "JSON",
    responseBodyFormatter: "Pretty",
  };

  const extractPlaceholders = (url: string): string[] => {
    return [...url.matchAll(/{{\s*([\w.-]+)\s*}}/g)].map((match) => match[1]);
  };

  const checkEnvironmentVariableExistValue = (items: string[]): boolean => {
    const filteredVariables = environmentVariables?.filtered;
    if (!filteredVariables && items.length > 0) return true;
    if (items.length === 0) return false;
    for (let i = 0; i < items.length; i++) {
      const matchingItem = filteredVariables.find(
        (variable: any) => variable.key === items[i],
      );
      // If any item is not found, return true
      if (!matchingItem) {
        return true;
      }
    }
    // All items matched and have valid values
    return false;
  };

  $: {
    if (selectedBlock) {
      isAnyEnvVariableMissing = false;
      apiState = selectedBlock?.data?.requestData?.state;
      requestNavigation =
        selectedBlock?.data?.requestData?.state?.requestNavigation;

      if (testflowStore) {
        const nodes = testflowStore?.nodes ?? [];
        const hasEmptyResponseStatus = nodes.some(
          (node) => !node.response?.status || node.response?.status === "",
        );
        const nodeResponse = testflowStore?.nodes.find(
          (item) => item?.id === selectedBlock?.id,
        );

        if (!testflowStore || nodes.length === 0 || hasEmptyResponseStatus) {
          selectedNodeResponse = undefined;
        } else {
          selectedNodeResponse = nodeResponse;
          responseState.responseBodyLanguage = selectedNodeResponse?.response
            .responseContentType as string;
        }
      }
      if ($currentStep === 7 && $isTestFlowTourGuideOpen) {
        selectedNodeResponse = emptyRequest;
        responseState.responseBodyLanguage = selectedNodeResponse?.response
          .responseContentType as string;
      }
      const selectedEnvs = extractPlaceholders(
        JSON.stringify(selectedBlock?.data?.requestData),
      );

      isAnyEnvVariableMissing =
        checkEnvironmentVariableExistValue(selectedEnvs);
    }
  }
</script>

<section
  class="section"
  style={`height: ${height}px; border-top: 1px solid ${isResizing || isResizingActive ? "var(--border-ds-primary-400)" : "transparent"}; cursor: ${isResizing ? "ns-resize" : "unset"};`}
>
  <div
    on:mousedown={startResize}
    on:mouseenter={() => (isResizingActive = true)}
    on:mouseleave={() => (isResizingActive = false)}
    style="
      height: 5px;
      background: var(--bg-ds-surface-300);
      cursor: ns-resize;"
  />

  <!-- Content -->
  <div style="margin-bottom: 8px;">
    <div
      class="tab-container"
      style={`border: 1px solid ${isResizing || isResizingActive ? "var(--border-ds-primary-400)" : "transparent"}; border-bottom: none;`}
    >
      <div style="display: flex; flex-direction: row;">
        {#if selectedNodeResponse?.response?.status?.startsWith("2") || ($currentStep > 6 && $isTestFlowTourGuideOpen)}
          <CheckmarkCircleRegular
            size="14px"
            color={"var(--icon-ds-success-400)"}
          />
        {:else if !selectedNodeResponse || selectedNodeResponse?.response?.status === ""}
          <ArrowSwapRegular
            size={"16px"}
            color={"var(--icon-ds-neutral-200)"}
          />
        {:else}
          <ErrorCircleRegular size="14px" color={"var(--icon-ds-danger-300)"} />
        {/if}

        <div class="block-name">
          <input
            type="text"
            placeholder="Enter Block Name"
            value={selectedBlock?.data?.blockName}
            bind:this={inputRef}
            class="input-box"
            style="outline: none;"
            on:input={(e) => {
              handleUpdateRequestData("blockName", e?.target?.value);
            }}
            on:blur={() => {
              if (selectedBlock?.data?.blockName?.length === 0) {
                handleUpdateRequestData("blockName", "Untitled");
              }
            }}
          />
        </div>
      </div>

      <span on:click={onClose} style="cursor: pointer;">
        <CrossIcon width="18px" height="18px" />
      </span>
    </div>

    <TableNavbar
      {selectedBlock}
      onRedirect={handleRedirect}
      {handleUpdateRequestData}
      showRedirectButton={!!selectedBlock?.data?.collectionId &&
        !!selectedBlock?.data?.requestId}
      {truncateName}
      {environmentVariables}
      {userRole}
      {onUpdateEnvironment}
      {handleClickTestButton}
      {handleOpenCurrentDynamicExpression}
      isTestFlowRuning={testflowStore?.isTestFlowRunning || responseLoader}
    />
    {#if isAnyEnvVariableMissing}
      <div class="" style="margin-top: 8px;">
        <Alert
          heading="Unresolved Environment Variables"
          description="This request uses environment variables, but no environment is selected or the required variables are missing. Select or update the environment to ensure all variables are defined."
          varient="warning"
          ctaShow={false}
          containerWidth={""}
          closeIconRequired={true}
          onClickClose={() => {
            isAnyEnvVariableMissing = false;
          }}
        />
      </div>
    {/if}
  </div>

  <Splitpanes
    style="padding:1px;"
    class="rest-splitter w-100 h-100"
    id={"rest-splitter"}
    horizontal={false}
  >
    <!-- Request Pane -->
    <Pane minSize={30} size={"30%"} class="position-relative bg-transparent">
      <div class="h-100 d-flex flex-column position-relative pe-2">
        <RequestNavigatorTestFlow
          paramsLength={selectedBlock?.data?.requestData?.queryParams?.length ||
            0}
          headersLength={selectedBlock?.data?.requestData?.headers?.length || 0}
          autoGeneratedHeadersLength={selectedBlock?.data?.requestData
            ?.autoGeneratedHeaders?.length || 0}
          {updateActiveTabInsideRequestBody}
          bind:requestNavigation
        />
        <div style="flex:1; overflow:auto; margin-top: 12px;" class="p-0">
          {#if requestNavigation === RequestSectionEnum.PARAMETERS}
            <RequestParameterTestFlow
              requestUrl={selectedBlock?.data?.requestData?.url ?? ""}
              params={selectedBlock?.data?.requestData?.queryParams ?? []}
              authParameter={{}}
              isBulkEditActive={false}
              {selectedBlock}
              onUpdateRequestState={handleUpdateRequestData}
              {environmentVariables}
              {handleOpenCurrentDynamicExpression}
            />
          {:else if requestNavigation === RequestSectionEnum.REQUEST_BODY}
            <RequestBodyTestFlow
              body={selectedBlock?.data?.requestData?.body ?? {}}
              method={selectedBlock?.data?.method}
              requestState={selectedBlock?.data?.requestData?.state}
              {environmentVariables}
              onUpdateRequestState={handleUpdateRequestData}
              {handleOpenCurrentDynamicExpression}
            />
          {:else if requestNavigation === RequestSectionEnum.HEADERS}
            <RequestHeaderTestFlow
              headers={selectedBlock?.data?.requestData?.headers ?? []}
              autoGeneratedHeaders={selectedBlock?.data?.requestData
                ?.autoGeneratedHeaders ?? []}
              authHeader={{}}
              {environmentVariables}
              onHeadersChange={handleUpdateRequestData}
              {handleOpenCurrentDynamicExpression}
              {selectedBlock}
              isBulkEditActive={false}
            />
          {:else if requestNavigation === RequestSectionEnum.AUTHORIZATION}
            <RequestAuthorizationTestFlow
              auth={selectedBlock?.data?.requestData?.auth}
              {environmentVariables}
              requestStateAuth={selectedBlock?.data?.requestData?.state}
              onUpdateRequestAuth={handleUpdateRequestData}
              {handleOpenCurrentDynamicExpression}
            />
          {/if}
        </div>
      </div>
    </Pane>

    <!-- Response Pane -->
    <Pane minSize={30} size={"30%"} class="position-relative bg-transparent">
      <div class="response-pane-container">
        {#if (!responseLoader && selectedNodeResponse === undefined) || selectedNodeResponse?.response?.status === ""}
          <div class="dumy-response-container">
            <SparrowLogo />
            <div class="response-text-container">
              <div style="font-weight: 700; margin-bottom: 8px;">
                Test your APIs before running the entire flow
              </div>
              <div>
                Any changes you make here will remain isolated from your
                collections, modify the API and test it to see the response.
              </div>
            </div>
          </div>
        {:else}
          <div
            class="h-100 d-flex flex-column position-relative"
            style="overflow:auto; flex:1;"
          >
            {#if responseLoader}
              <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
            {/if}
            {#if !responseLoader && selectedNodeResponse?.response?.status === ResponseStatusCode.ERROR}
              <ResponseErrorScreen />
            {:else if !responseLoader && selectedNodeResponse?.response?.status}
              <div class="d-flex flex-column" style="height: 100%;">
                <div class="d-flex" style="margin-bottom: 12px;">
                  <ResponseNavigator
                    requestStateSection={responseNavigation}
                    {updateResponseNavigation}
                    responseHeadersLength={selectedNodeResponse?.response
                      ?.headers?.length || 0}
                  />
                  <ResponseStatus response={selectedNodeResponse?.response} />
                </div>

                {#if responseNavigation === "Response"}
                  {#if selectedNodeResponse?.response?.responseContentType !== "Image"}
                    <ResponseBodyNavigator
                      response={selectedNodeResponse?.response}
                      apiState={responseState}
                      onUpdateResponseState={handleResponseState}
                      {onClearResponse}
                      {isWebApp}
                    />
                  {/if}
                  <div style="flex:1; overflow:auto;" class="border">
                    <ResponseBody
                      response={selectedNodeResponse?.response}
                      apiState={responseState}
                    />
                  </div>
                {:else if responseNavigation === "Headers"}
                  <div style="flex:1; overflow: auto;">
                    <ResponseHeaders
                      responseHeader={selectedNodeResponse?.response.headers}
                    />
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </Pane>
  </Splitpanes>
</section>

<style>
  .section {
    min-height: 100px;
    max-height: 464px;
    position: relative;
    background-color: transparent;
    margin-bottom: 70px;
  }

  .tab-container {
    width: 200px;
    background-color: var(--bg-ds-surface-300);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    position: absolute;
    height: 36px;
    top: -36px;
    z-index: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 11px;
    padding-bottom: 5px;
  }

  .block-name {
    max-width: 130px;
    font-size: 12px;
    font-weight: 500;
    line-height: 130%;
    color: var(--white-color);
    margin-left: 8px;
    overflow: hidden;
  }

  .input-box {
    width: 130px;
    border: none;
    background-color: transparent;
    padding-right: 0px;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    line-height: 150%;
    font-size: 12px;
    border-radius: 4px;
    padding: 4px;
  }

  .input-box::placeholder {
    color: var(--text-ds-neutral-500);
  }

  .input-box:focus {
    border: 1px solid var(--border-ds-primary-300);
  }

  .response-pane-container {
    padding-left: 12px;
    overflow: auto;
    height: 100%;
  }

  .dumy-response-container {
    background-color: var(--bg-ds-surface-800);
    max-width: 444px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    padding: 24px;
    gap: 24px;
    margin: 24px auto;
  }

  .response-text-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    font-size: 12px;
    line-height: 150%;
    letter-spacing: 0px;
    color: var(--text-ds-neutral-400);
    font-weight: 400;
  }
</style>
