<script lang="ts">
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import Button from "$lib/components/buttons/Button.svelte";
  import floppyDisk from "$lib/assets/floppy-disk.svg";

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
  } from "@rest-explorer/components";

  import RestExplorerViewModel from "./RestExplorer.ViewModel";
  import { RequestSection, ResponseSection } from "$lib/utils/enums";
  import Loader from "$lib/components/Transition/loader/Loader.svelte";
  // import  from "@rest-explorer/components/response-body/ResponseBody.svelte";
  // import  from "@rest-explorer/components/request-parameters/RequestParameters.svelte";
  import {
    restLeftPanelWidth,
    restRightPanelWidth,
  } from "@rest-explorer/store";
  import { restSplitterDirection } from "@rest-explorer/store/splitpanes";
  import { ModalWrapperV1 } from "$lib/components";
  // import  from "@rest-explorer/components/save-as-request/SaveAsRequest.svelte";
  import { onMount } from "svelte";
  import { DashboardViewModel } from "../Dashboard/Dashboard.ViewModel.old";
  import { user } from "$lib/store";
  import { notifications } from "$lib/components/toast-notification/ToastNotification";

  //////////////////////////////////
  // TODO: Delete this code
  // let n = new DashboardViewModel();
  // user.subscribe(async (value) => {
  //   await n.refreshTeams(value._id);
  //   await n.refreshWorkspaces(value._id);
  // });

  //////////////////////////////////

  const _viewModel = new RestExplorerViewModel();
  let response = _viewModel.response;
  let requestState = _viewModel.requestState;
  /////////////////////
  let _method = _viewModel.httpMethod;
  let _name = _viewModel.requestName;
  let _url = _viewModel.requestUrl;
  let _description = _viewModel.requestDescription;

  let _path = _viewModel.requestPath;

  let environmentVariables = [];

  const handleRequestNavigator = (event: CustomEvent<string>): void => {
    _viewModel.updateRequestState({ section: event.detail });
  };

  const handleRequestAuth = (event: CustomEvent<string>): void => {
    _viewModel.updateRequestState({ auth: event.detail });
  };

  const handleResponseNavigator = (event: CustomEvent<string>): void => {
    _viewModel.updateRequestState({ responseSection: event.detail });
  };

  /////  SAVE AS REQUEST
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
        restLeftPanelWidth.set(e.detail[0].size);
        restRightPanelWidth.set(e.detail[1].size);
      }}
    >
      <Pane minSize={30} size={$restLeftPanelWidth}>
        <!-- Request Pane -->
        <div class="px-3 h-100 position-relative">
          <RequestNavigator
            requestStateSection={$requestState?.section}
            on:change={handleRequestNavigator}
          />
          {#if $requestState?.section === RequestSection.PARAMETERS}
            <RequestParameters
              params={_viewModel.requestParams}
              onUpdateRequestParams={_viewModel.updateParams}
            />
          {:else if $requestState?.section === RequestSection.REQUEST_BODY}
            <RequestBody
              body={_viewModel.requestBody}
              method={_viewModel.httpMethod}
              requestState={$requestState}
              onUpdateRequestBody={_viewModel.updateRequestBody}
              onUpdateRequestState={_viewModel.updateRequestState}
            />
          {:else if $requestState?.section === RequestSection.HEADERS}
            <RequestHeaders
              headers={_viewModel.requestHeaders}
              autoGeneratedHeaders={_viewModel.requestAutoGeneratedHeaders}
              onHeadersChange={_viewModel.updateHeaders}
              onAutoGeneratedHeadersChange={_viewModel.updateAutoGeneratedHeaders}
            />
          {:else if $requestState?.section === RequestSection.AUTHORIZATION}
            <RequestAuth
              requestStateAuth={$requestState?.auth}
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
          {#if $requestState?.requestInProgress}
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
              requestStateSection={$requestState?.responseSection}
              on:change={handleResponseNavigator}
            />
            {#if $requestState.responseSection === ResponseSection.RESPONSE}
              <ResponseBodyNavigator
                response={$response}
                apiState={$requestState}
                onUpdateRequestState={_viewModel.updateRequestState}
                onClearResponse={_viewModel.updateResponse}
              />
              <ResponseBody response={$response} apiState={$requestState} />
            {:else if $requestState.responseSection === ResponseSection.HEADERS}
              <ResponseHeaders responseHeader={$response?.headers} />
            {/if}
          {/if}
        </div></Pane
      >
    </Splitpanes>
  </div>
  <div>
    <RestExtensionPanel
      method={$_method}
      state={$requestState}
      name={$_name}
      description={$_description}
      path={$_path}
      url={$_url}
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
    _method={$_method}
    _url={$_url}
    _name={$_name}
    _description={$_description}
    _path={$_path}
    collections={_viewModel.collection}
    readCollection={_viewModel.readCollection}
    readWorkspace={_viewModel.readWorkspace}
    onSaveAsRequest={_viewModel.saveAsRequest}
    onCreateFolder={_viewModel.createFolder}
    onCreateCollection={_viewModel.createCollection}
  />
</ModalWrapperV1>
