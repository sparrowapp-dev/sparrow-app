<script lang="ts">
  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";
  import {
    collapsibleState,
    isHorizontal,
    leftPanelWidth,
    rightPanelWidth,
  } from "$lib/store/request-response-section";
  import { onDestroy } from "svelte";
  import { ApiSendRequestViewModel } from "./ApiSendRequestPage.ViewModel";
  import { createApiRequest } from "@app/services/rest-api.service";
  import ColorDropdown from "$lib/components/dropdown/ColourDropdown.svelte";
  import {
    RequestMethod,
    RequestProperty,
  } from "$lib/utils/enums/request.enum";
  import type { RequestMethodType } from "$lib/utils/types/request.type";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import EnvironmentPicker from "../environment-picker/EnvironmentPicker.svelte";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  import CodeMirrorInput from "./CodeMirrorInput.svelte";
  import type { EditorSelection } from "@codemirror/state";
  import AddEnvironment from "../add-environment-popup/AddEnvironment.svelte";
  import type {
    EnvironmentDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import type { Observable } from "rxjs";
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { editLink } from "$lib/store/api-request";
  import { v4 as uuidv4 } from "uuid";
  import { Select } from "@library/forms";

  export const loaderColor = "default";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  export let environmentVariables;
  //this for expand and collapse condition
  const _apiSendRequest = new ApiSendRequestViewModel();

  let isCollaps: boolean;

  collapsibleState.subscribe((value) => (isCollaps = value));
  const environmentHelper = new EnvironmentHeper();

  let isInputEmpty: boolean = false;
  let isInputValid: boolean = true;
  let inputElement: HTMLInputElement;
  let isHorizontalMode: boolean;

  let urlText: string = "";
  let method = "";
  let request;
  let disabledSend: boolean = false;
  let isLoading: boolean = false;
  let currentTabId: string = "";
  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let environmentAxisY: number;
  let environmentAxisX: number;
  let envMissing = false;
  const activeWorkspace: Observable<WorkspaceDocument> =
    collectionsMethods.getActiveWorkspace();
  let activeWorkspaceRxDoc: WorkspaceDocument;
  let currentWorkspaceName: string;
  let currentWorkspaceId: string;
  let globalEnvironment;
  let currentEnvironment;
  let localEnvKey: string;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    if (event) {
      currentTabId = event?.id;
      urlText = event?.property?.request?.url;
      method = event?.property?.request?.method;
      disabledSend = event?.property?.request?.requestInProgress;
      request = event?.property?.request;
    }
  });
  let filterData = [];
  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          urlText,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          urlText,
          trackParanthesis,
          trackCursor,
        );
    }
  }

  const handleSendRequest = async () => {
    isInputValid = true;
    const str = urlText;

    if (str.trim() === "") {
      isInputEmpty = true;
      inputElement?.focus();
    } else {
      collectionsMethods.updateRequestProperty(
        true,
        RequestProperty.REQUEST_IN_PROGRESS,
        currentTabId,
      );

      isInputEmpty = false;
      if (isInputValid) {
        let start = Date.now();
        isLoading = true;

        createApiRequest(
          _apiSendRequest.decodeRestApiData(request, environmentVariables),
          currentTabId,
        )
          .then((response) => {
            if (response.isSuccessful === false) {
              collectionsMethods.updateRequestProperty(
                false,
                RequestProperty.REQUEST_IN_PROGRESS,
                currentTabId,
              );
              collectionsMethods.updateRequestProperty(
                {
                  body: "",
                  headers: "",
                  status: "Not Found",
                  time: 0,
                  size: 0,
                },
                RequestProperty.RESPONSE,
                currentTabId,
              );
              isLoading = false;
            } else {
              let end = Date.now();
              const byteLength = new TextEncoder().encode(
                JSON.stringify(response),
              ).length;
              let responseSizeKB = byteLength / 1024;
              let duration = end - start;

              let responseBody = response.data.response;
              let responseHeaders = response.data.headers;
              let responseStatus = response.data.status;
              _apiSendRequest.setResponseContentType(
                responseHeaders,
                collectionsMethods,
              );
              collectionsMethods.updateRequestProperty(
                false,
                RequestProperty.REQUEST_IN_PROGRESS,
                response.tabId,
              );
              collectionsMethods.updateRequestProperty(
                {
                  body: responseBody,
                  headers: JSON.stringify(responseHeaders),
                  status: responseStatus,
                  time: duration,
                  size: responseSizeKB,
                },
                RequestProperty.RESPONSE,
                response.tabId,
              );
              isLoading = false;
            }
          })
          .catch((error) => {
            collectionsMethods.updateRequestProperty(
              false,
              RequestProperty.REQUEST_IN_PROGRESS,
              currentTabId,
            );
            collectionsMethods.updateRequestProperty(
              {
                body: "",
                headers: "",
                status: "Not Found",
                time: 0,
                size: 0,
              },
              RequestProperty.RESPONSE,
              currentTabId,
            );
            isLoading = false;
          });
      }
    }
  };

  const extractKeyValueFromUrl = (url: string) => {
    let queryString: string = "";
    let flag: boolean = false;

    for (let i = 0; i < url.length; i++) {
      if (flag) {
        queryString += url[i];
      }
      if (url[i] === "?") {
        flag = true;
      }
    }

    if (queryString === "") {
      return [{ key: "", value: "", checked: false }];
    }

    let paramsArray = queryString.split("&");
    let params = paramsArray.map((param) => {
      let keyValue = param.split("=");
      if (keyValue.length === 1) {
        return { key: keyValue[0], value: "", checked: true };
      } else if (keyValue.length === 2) {
        return { key: keyValue[0], value: keyValue[1], checked: true };
      }
    });

    return [...params, { key: "", value: "", checked: false }];
  };
  const isHorizontalUnsubscribe = isHorizontal.subscribe((value) => {
    isHorizontalMode = value;
  });

  const handleDropdown = (tab: string) => {
    collectionsMethods.updateRequestProperty(
      tab as RequestMethodType,
      RequestProperty.METHOD,
      currentTabId,
    );
  };
  let selectedView: string = isHorizontalMode ? "horizontal" : "vertical";

  let handleInputValue = () => {
    collectionsMethods.updateRequestProperty(
      urlText,
      RequestProperty.URL,
      currentTabId,
    );
    collectionsMethods.updateRequestProperty(
      extractKeyValueFromUrl(urlText),
      RequestProperty.QUERY_PARAMS,
      currentTabId,
    );
    trackParanthesis = environmentHelper.balanceParanthesis(urlText);
  };
  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      globalEnvironment = await collectionsMethods.getGlobalEnvironment();
      activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        const env: EnvironmentDocument =
          await collectionsMethods.currentEnvironment(
            activeWorkspaceRxDoc.get("environmentId"),
          );
        if (env) {
          currentEnvironment = env.toMutableJSON();
        } else {
          currentEnvironment = {
            name: "None",
            id: "none",
          };
        }
        currentWorkspaceName = activeWorkspaceRxDoc.get("name");
        currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
      }
    },
  );
  let handleFocusValue = () => {
    handleInputValue();
    const elem = document.getElementById("input-request-url");
    if (elem) {
      environmentAxisY = elem.getBoundingClientRect().top + 40;
      environmentAxisX = elem.getBoundingClientRect().left;
    }
  };
  let handleBlurValue = () => {
    setTimeout(() => {
      trackParanthesis = [];
      trackCursor = undefined;
      filterData = [];
    }, 300);
  };
  let handleInputChange = (text: string) => {
    urlText = text;
  };
  let handleKeyUpValue = (e: EditorSelection) => {
    trackCursor = e.main.head;
  };
  let handleKeyDownChange = onDestroy(() => {
    isHorizontalUnsubscribe();
    tabSubscribe();
  });
  const handleResize = () => {
    const windowWidth = window.innerWidth;

    if (windowWidth <= 1300) {
      document.querySelector<HTMLElement>("#barIcon").click();
      isHorizontal.set(true);
    } else {
      document.querySelector<HTMLElement>("#lineIcon").click();
      isHorizontal.set(false);
    }
  };
  window.addEventListener("resize", handleResize);

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
    activeWorkspaceSubscribe.unsubscribe();
  });

  const handleKeyPress = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!disabledSend) handleSendRequest();
    } else if (event.altKey && event.code === "KeyL") {
      inputElement?.focus();
      editLink.set(uuidv4());
    }
  };

  const handleEnvironmentBox = (change: boolean, envKey: string) => {
    envMissing = change;
    localEnvKey = envKey;
  };
</script>

<div class="d-flex flex-column">
  <div
    class="d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-3 pe-3'
      : 'pt-3 px-3'}"
    style="width:calc(100%-302px);"
  >
    <div class="d-flex gap-2 w-100 position-relative">
      <Select
        id={"api-request"}
        data={[
          {
            name: "GET",
            id: RequestMethod.GET,
            color: "success",
          },
          {
            name: "POST",
            id: RequestMethod.POST,
            color: "warning",
          },
          {
            name: "PUT",
            id: RequestMethod.PUT,
            color: "secondary",
          },
          {
            name: "DELETE",
            id: RequestMethod.DELETE,
            color: "danger",
          },
          {
            name: "PATCH",
            id: RequestMethod.PATCH,
            color: "patch",
          },
        ]}
        titleId={method}
        onclick={handleDropdown}
        headerTheme={"transparent"}
        borderHighlight={"active"}
        headerHighlight={"hover"}
        minBodyWidth={"150px"}
        zIndex={2}
        menuItem={"v2"}
      />

      <CodeMirrorInput
        rawValue={urlText}
        handleRawChange={handleInputValue}
        handleFocusChange={handleFocusValue}
        handleBlurChange={handleBlurValue}
        {handleInputChange}
        handleKeyUpChange={handleKeyUpValue}
        handleKeyDownChange={handleKeyPress}
        codeMirrorEditorDiv={inputElement}
        {currentTabId}
        filterData={environmentVariables}
        {handleEnvironmentBox}
      />
      {#if trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {environmentAxisX}
          {environmentAxisY}
          {filterData}
          inputText={urlText}
          {trackCursor}
          {trackParanthesis}
          updateText={(txt) => {
            urlText = txt;
          }}
          {handleInputValue}
        />
      {/if}
      {#if envMissing && trackParanthesis.length == 0}
        <AddEnvironment
          {environmentAxisX}
          {environmentAxisY}
          updateEnvironment={collectionsMethods.updateEnvironment}
          {currentWorkspaceId}
          {currentEnvironment}
          {globalEnvironment}
          {handleEnvironmentBox}
          {localEnvKey}
        />
      {/if}
      <button
        disabled={disabledSend}
        class="d-flex align-items-center justify-content-center btn btn-primary text-whiteColor ps-4 pe-4 py-2"
        style="font-size: 15px;height:34px; font-weight:400"
        on:click|preventDefault={handleSendRequest}>Send</button
      >
    </div>
    <div class="ps-2 text-secondary fs-2 {isCollaps ? 'ps-4' : 'ps-2'}">|</div>

    <div class="d-flex gap-1 ps-2">
      <span style="cursor:pointer;">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          on:click={() => isHorizontal.set(false)}
          on:click={() => {
            selectedView = "vertical";
            const splitter = document.querySelector(
              ".splitter-request .splitpanes__splitter",
            );
            const leftPanel = document.querySelector(
              ".splitter-request .left-panel",
            );
            const rightPanel = document.querySelector(
              ".splitter-request .right-panel",
            );
            leftPanel.style.width = `${leftPanelWidth}%`;
            rightPanel.style.width = `${rightPanelWidth}%`;
            splitter.style.height = "85vh";
            splitter.style.width = "0%";
          }}
          class:view-active={selectedView === "vertical"}
          src={tableColumnIcon}
          alt=""
          id="lineIcon"
        />
      </span>
      <span style="cursor:pointer;">
        <img
          on:click={() => isHorizontal.set(true)}
          on:click={() => {
            selectedView = "horizontal";
            const splitter = document.querySelector(
              ".splitter-request .splitpanes__splitter",
            );
            const leftPanel = document.querySelector(
              ".splitter-request .left-panel",
            );
            const rightPanel = document.querySelector(
              ".splitter-request .right-panel",
            );
            splitter.style.height = "0%";
            splitter.style.width = "100%";
            rightPanel.style.width = `${rightPanelWidth}%`;
            leftPanel.style.width = `${leftPanelWidth}%`;
            MixpanelEvent(Events.CHANGE_DEFAULT_VIEW);
          }}
          class:view-active={selectedView === "horizontal"}
          src={barIcon}
          alt=""
          id="barIcon"
        />
      </span>
    </div>
  </div>
</div>
<svelte:window on:keydown={handleKeyPress} />

<style>
  .btn-primary {
    background: var(--sparrow-blue);
  }

  .view-active {
    filter: invert(60%) sepia(99%) saturate(302%) hue-rotate(183deg)
      brightness(102%) contrast(105%);
  }

  .btn-primary:hover {
    background: var(--send1-hoverbutton);
  }

  .btn-primary1 {
    background: var(--background-color);
    border: 1px solid var(--border-color);
  }

  .border-red:focus {
    border: 5px solid black;
  }

  .btn-primary1:hover {
    background: var(--border-color);
  }

  .input-outline {
    border-radius: 0%;
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }
  .url-input {
    background-color: var(--background-dark);
    border: 1px solid #272727 !important;
    font-size: 12px;
  }
</style>
