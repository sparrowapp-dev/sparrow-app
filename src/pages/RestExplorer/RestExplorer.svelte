<script lang="ts">
  // ---- Assets
  import floppyDisk from "$lib/assets/floppy-disk.svg";
  import angleDown from "$lib/assets/angle-down.svg";

  // ---- Components
  import {
    HttpUrlSection,
    RequestHeaders,
    RequestNavigator,
    ResponseNavigator,
    RequestAuth,
    ResponseDefaultScreen,
    ResponseErrorScreen,
    ResponseHeaders,
    ResponseBodyNavigator,
    RequestBody,
    RequestName,
    ResponseBody,
    RestExtensionPanel,
    SaveAsRequest,
    RequestParameters,
  } from "@features/rest-explorer/components";
  import Loader from "$lib/components/Transition/loader/Loader.svelte";
  import { ModalWrapperV1 } from "$lib/components";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import Button from "$lib/components/buttons/Button.svelte";

  // ---- View Model
  import RestExplorerViewModel from "./RestExplorer.ViewModel";

  // ---- types
  import { RequestSection, ResponseSection } from "$lib/utils/enums";

  // ---- Store
  import {
    restLeftPanelWidth,
    restRightPanelWidth,
    restSplitterDirection,
  } from "@features/rest-explorer/store";
  import { user } from "$lib/store";
  import { DashboardViewModel } from "../Dashboard/Dashboard.ViewModel.old";

  // TODO: Delete this code
  let n = new DashboardViewModel();
  user.subscribe(async (value) => {
    await n.refreshTeams(value._id);
    await n.refreshWorkspaces(value._id);
  });

  export let tab;
  const _viewModel = new RestExplorerViewModel(tab);
  let response = _viewModel.response;
  let requestState = _viewModel.requestState;
  let method = _viewModel.httpMethod;
  let name = _viewModel.requestName;
  let url = _viewModel.requestUrl;
  let description = _viewModel.requestDescription;
  let path = _viewModel.requestPath;

  const handleRequestNavigator = (event: CustomEvent<string>): void => {
    _viewModel.updateRequestState({ requestNavigation: event.detail });
  };
  const handleRequestAuth = (event: CustomEvent<string>): void => {
    _viewModel.updateRequestState({ requestAuthNavigation: event.detail });
  };
  const handleResponseNavigator = (event: CustomEvent<string>): void => {
    _viewModel.updateRequestState({ responseNavigation: event.detail });
  };
  let isExposeSaveAsRequest = false;
</script>

<div class="d-flex">
  <div class="w-100 d-flex flex-column h-100">
    <!-- Request Name Header -->
    <div class="d-flex justify-content-between w-100 p-3">
      <RequestName
        name={_viewModel.requestName}
        onUpdateRequestName={_viewModel.updateRequestName}
      />
      <!-- Save and Share Buttons -->
      <div class="d-flex justify-content-between">
        <Button
          title="Save Request"
          type="dark"
          loader={$requestState.isSaveRequestInProgress}
          buttonClassProp="ms-2"
          buttonStartIcon={floppyDisk}
          onClick={async () => {
            const x = await _viewModel.saveRequest();
            if (
              x.status === "error" &&
              x.message ===
                "request is not a part of any workspace or collection"
            ) {
              isExposeSaveAsRequest = true;
            } else if (x.status === "success") {
              notifications.success("API request saved");
            }
          }}
        />

        <span class="position-relative" style="width:35px;">
          <Dropdown
            disabled={false}
            dropdownId={"saveAsDropdown"}
            dropDownType={{ type: "img", title: angleDown }}
            data={[
              {
                name: "Save As",
                id: "collection",
                dynamicClasses: "text-whiteColor",
              },
            ]}
            onclick={() => {
              isExposeSaveAsRequest = true;
            }}
            staticCustomStyles={[
              {
                id: "saveAsDropdown-options-container",
                styleKey: "minWidth",
                styleValue: "180px",
              },
            ]}
            staticClasses={[
              {
                id: "saveAsDropdown-img",
                classToAdd: ["btn", "bg-dullBackground", "px-2", "py-1"],
              },
              {
                id: "saveAsDropdown-options-name",
                classToAdd: ["fs-6"],
              },
              {
                id: "saveAsDropdown-options-container",
                classToAdd: ["end-0", "mt-1", "rounded"],
              },
            ]}
          ></Dropdown>
        </span>
        <Button
          title="Share"
          type="dark"
          buttonClassProp="ms-2"
          onClick={() => {}}
        />
      </div>
    </div>

    <!-- HTTP URL Section -->
    <HttpUrlSection
      class="py-1 px-3"
      bind:requestUrl={_viewModel.requestUrl}
      bind:httpMethod={_viewModel.httpMethod}
      onSendButtonClicked={_viewModel.sendRequest}
      onUpdateRequestUrl={_viewModel.updateRequestUrl}
      onUpdateRequestMethod={_viewModel.updateRequestMethod}
    />

    <Splitpanes
      class=""
      id={"rest-splitter"}
      style="height: calc(100vh - 240px); margin-top:10px;"
      horizontal={$restSplitterDirection === "horizontal" ? true : false}
      dblClickSplitter={false}
      on:resize={(e) => {
        // _viewModel.updateRequestState({
        //   requestLeftSplitterWidthPercentage: e.detail[0].size,
        // });
        // _viewModel.updateRequestState({
        //   requestRightSplitterWidthPercentage: e.detail[0].size,
        // });
        restLeftPanelWidth.set(e.detail[0].size);
        restRightPanelWidth.set(e.detail[1].size);
      }}
    >
      <Pane minSize={30} size={$restLeftPanelWidth}>
        <!-- Request Pane -->
        <div class="px-3 pb-3 h-100 position-relative">
          <RequestNavigator
            requestStateSection={$requestState?.requestNavigation}
            on:change={handleRequestNavigator}
          />
          {#if $requestState?.requestNavigation === RequestSection.PARAMETERS}
            <RequestParameters
              params={_viewModel.requestParams}
              onUpdateRequestParams={_viewModel.updateParams}
              authParameter={_viewModel.authParameter}
            />
          {:else if $requestState?.requestNavigation === RequestSection.REQUEST_BODY}
            <RequestBody
              body={_viewModel.requestBody}
              method={_viewModel.httpMethod}
              requestState={$requestState}
              onUpdateRequestBody={_viewModel.updateRequestBody}
              onUpdateRequestState={_viewModel.updateRequestState}
            />
          {:else if $requestState?.requestNavigation === RequestSection.HEADERS}
            <RequestHeaders
              headers={_viewModel.requestHeaders}
              autoGeneratedHeaders={_viewModel.requestAutoGeneratedHeaders}
              onHeadersChange={_viewModel.updateHeaders}
              onAutoGeneratedHeadersChange={_viewModel.updateAutoGeneratedHeaders}
              authHeader={_viewModel.authHeader}
            />
          {:else if $requestState?.requestNavigation === RequestSection.AUTHORIZATION}
            <RequestAuth
              requestStateAuth={$requestState?.requestAuthNavigation}
              on:change={handleRequestAuth}
              auth={_viewModel.requestAuth}
              onUpdateRequestAuth={_viewModel.updateRequestAuth}
            />
          {/if}
        </div>
      </Pane>
      <Pane minSize={30} size={$restRightPanelWidth} class="position-relative">
        <!-- Response Pane -->
        <!-- <ResponsePane response={$response} /> -->
        <div class="d-flex flex-column h-100 px-3">
          {#if $requestState?.isSendRequestInProgress}
            <ResponseDefaultScreen />
            <div
              style="    
          top: 10px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index:3;
          position:absolute;
          "
            >
              <Loader loaderSize={"80px"} />
            </div>
          {:else if !$response?.status}
            <ResponseDefaultScreen />
          {:else if $response?.status === "Not Found"}
            <ResponseErrorScreen />
          {:else if $response?.status}
            <ResponseNavigator
              requestStateSection={$requestState?.responseNavigation}
              on:change={handleResponseNavigator}
            />
            {#if $requestState.responseNavigation === ResponseSection.RESPONSE}
              <ResponseBodyNavigator
                response={$response}
                apiState={$requestState}
                onUpdateRequestState={_viewModel.updateRequestState}
                onClearResponse={_viewModel.updateResponse}
              />
              <ResponseBody response={$response} apiState={$requestState} />
            {:else if $requestState.responseNavigation === ResponseSection.HEADERS}
              <ResponseHeaders responseHeader={$response?.headers} />
            {/if}
          {/if}
        </div></Pane
      >
    </Splitpanes>
  </div>
  <div>
    <RestExtensionPanel
      state={$requestState}
      requestMethod={$method}
      requestUrl={$url}
      requestName={$name}
      requestDescription={$description}
      requestPath={$path}
      collections={_viewModel.collection}
      onSaveRequest={_viewModel.saveRequest}
      readCollection={_viewModel.readCollection}
      readWorkspace={_viewModel.readWorkspace}
      onSaveAsRequest={_viewModel.saveAsRequest}
      onCreateFolder={_viewModel.createFolder}
      onCreateCollection={_viewModel.createCollection}
      onUpdateRequestState={_viewModel.updateRequestState}
      onUpdateRequestDescription={_viewModel.updateRequestDescription}
      readRequestOrFolderInCollection={_viewModel.readRequestOrFolderInCollection}
    />
  </div>
</div>
<ModalWrapperV1
  title={"Save Request"}
  type={"dark"}
  width={"55%"}
  zIndex={10000}
  isOpen={isExposeSaveAsRequest}
  handleModalState={(flag = false) => {
    isExposeSaveAsRequest = flag;
  }}
>
  <SaveAsRequest
    onClick={(flag = false) => {
      isExposeSaveAsRequest = flag;
    }}
    requestMethod={$method}
    requestUrl={$url}
    requestName={$name}
    requestDescription={$description}
    requestPath={$path}
    collections={_viewModel.collection}
    readCollection={_viewModel.readCollection}
    readWorkspace={_viewModel.readWorkspace}
    onSaveAsRequest={_viewModel.saveAsRequest}
    onCreateFolder={_viewModel.createFolder}
    onCreateCollection={_viewModel.createCollection}
  />
</ModalWrapperV1>
