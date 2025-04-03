<script>
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import TableNavbar from "../../../../components/table-navbar/TableNavbar.svelte";
  import {
    CrossIcon,
    CheckmarkCircleRegular,
    ErrorCircleRegular,
  } from "@sparrow/library/icons";
  import { RequestDoc } from "../../../rest-explorer-saved/components";
  import { RequestSectionEnum } from "@sparrow/common/types/workspace";
  import {
    RequestBodyTestFlow,
    RequestHeaderTestFlow,
    RequestNavigatorTestFlow,
    RequestParameterTestFlow,
  } from "..";
  import SparrowLogo from "../../assets/images/sparrow-logo.svelte";
  import { RequestDataset } from "@sparrow/common/enums";
  import { testFlowDataStore } from "../../store";
  import { Input } from "@sparrow/library/forms";

  export let selectedBlock;
  export let onClose;
  export let onRedirect;
  export let environmentVariables;
  export let handleUpdateRequestData;

  let blockName = selectedBlock?.blockName ?? "";
  let height = 300;
  let minHeight = 100;
  let isResizing = false;
  let isResizingActive = false;
  let requestNavigation = "Parameters";
  let inputRef;

  /**
   * Updates the active tab inside the Request Body section.
   * @param tab - The tab to update.
   * @returns- The updated request navigation.
   */
  const updateActiveTabInsideRequestBody = (tab) => {
    if (tab === "Request Body") {
      requestNavigation = "Request Body";
    } else if (tab === "Headers") {
      requestNavigation = "Headers";
    } else if (tab === "Authorization") {
      requestNavigation = "Authorization";
    } else {
      requestNavigation = "Parameters";
    }

    return requestNavigation;
  };

  const truncateName = (name, charLimit) => {
    return name.length > charLimit
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

  const startResize = (event) => {
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

  let testflowStore = undefined;
  let selectedNodeResponse = undefined;

  $: {
    if (selectedBlock && testFlowDataStore) {
      testFlowDataStore.subscribe((val) => {
        if (val) {
          testflowStore = val.get(selectedBlock?.data?.tabId);
          selectedNodeResponse = testflowStore?.nodes.find(
            (item) => item?.id === selectedBlock?.id,
          );
        }
      });
    }
  }
</script>

<section
  class="section"
  style={`height: ${height}px; border-top: 1px solid ${isResizing || isResizingActive ? "var(--border-ds-primary-400)" : "transparent"}; cursor: ${isResizing ? "ns-resize" : "default"}`}
>
  <div
    on:mousedown={startResize}
    on:mouseenter={() => (isResizingActive = true)}
    on:mouseleave={() => (isResizingActive = false)}
    style="
      height: 1px;
      background: transparent;
      cursor: ns-resize;"
  />

  <!-- Content -->
  <div style="margin-bottom: 8px;">
    <div
      class="tab-container"
      style={`border: 1px solid ${isResizing || isResizingActive ? "var(--border-ds-primary-400)" : "transparent"}; border-bottom: none;`}
    >
      <div style="display: flex; flex-direction: row;">
        <CheckmarkCircleRegular
          size="14px"
          color={"var(--icon-ds-success-400)"}
        />
        <div class="block-name">
          <!-- {truncateName(selectedBlock?.blockName ?? "", 30)} -->
          <input
            type="text"
            placeholder="Enter Block Name"
            bind:value={blockName}
            bind:this={inputRef}
            class="input-box"
            style="outline: none;"
            on:input={(e) => {}}
          />
        </div>
      </div>

      <span on:click={onClose} style="cursor: pointer;">
        <CrossIcon width="18px" height="18px" />
      </span>
    </div>

    <TableNavbar
      {selectedBlock}
      {onClose}
      onRedirect={handleRedirect}
      {handleUpdateRequestData}
      showRedirectButton={!!selectedBlock?.data?.collectionId &&
        !!selectedBlock?.data?.requestId}
      {truncateName}
    />
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
              params={selectedBlock?.data?.requestData?.queryParams}
              authParameter={{}}
              isBulkEditActive={false}
              onUpdateRequestState={() => {}}
              {environmentVariables}
            />
          {:else if requestNavigation === RequestSectionEnum.REQUEST_BODY}
            <RequestBodyTestFlow
              body={selectedBlock?.data?.requestData?.body}
              method={selectedBlock?.data?.method}
              requestState={selectedBlock?.data?.requestData?.state}
              {environmentVariables}
            />
            <div></div>
          {:else if requestNavigation === RequestSectionEnum.HEADERS}
            <RequestHeaderTestFlow
              headers={selectedBlock?.data?.requestData?.headers}
              autoGeneratedHeaders={selectedBlock?.data?.requestData
                ?.autoGeneratedHeaders}
              authHeader={{}}
              {environmentVariables}
              onHeadersChange={() => {}}
              isBulkEditActive={false}
              onUpdateRequestState={() => {}}
            />
          {/if}
        </div>
      </div>
    </Pane>

    <!-- Response Pane -->
    <Pane
      minSize={30}
      size={"30%"}
      class="position-relative bg-transparent response-pane-container"
    >
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
    </Pane>
  </Splitpanes>
</section>

<style>
  .section {
    min-height: 100px;
    max-height: 464px;
    position: relative;
    background-color: transparent;
  }

  .tab-container {
    width: 200px;
    background-color: var(--bg-ds-surface-300);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    position: absolute;
    min-height: 36px;
    top: -45px;
    z-index: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 11px;
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
