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
  import ColorDropdown from "$lib/components/dropdown/ColourDropdown.svelte";
  import { onDestroy } from "svelte";
  import { ApiSendRequestViewModel } from "./ApiSendRequestPage.ViewModel";
  import { createApiRequest } from "$lib/services/rest-api.service";
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
      inputElement.focus();
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
          })
          .catch((error) => {
            collectionsMethods.updateRequestProperty(
              false,
              RequestProperty.REQUEST_IN_PROGRESS,
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

  const handleDropdown = (tab: RequestMethodType) => {
    collectionsMethods.updateRequestProperty(
      tab,
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
  onDestroy(() => {
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
  });

  const handleKeyPress = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
    if (event.ctrlKey && event.key === "Enter") {
      if (!disabledSend) handleSendRequest();
    } else if (event.altKey && event.code === "KeyL") {
      inputElement.focus();
    }
  };
</script>

<div class="d-flex flex-column w-100">
  <div
    class="d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-3 pe-3'
      : 'pt-3 px-3'}"
    style="width:calc(100%-312px);"
  >
    <div class="d-flex gap-2 w-100 position-relative">
      <ColorDropdown
        data={[
          {
            name: "GET",
            id: RequestMethod.GET,
            color: "getColor",
          },
          {
            name: "POST",
            id: RequestMethod.POST,
            color: "postColor",
          },
          {
            name: "PUT",
            id: RequestMethod.PUT,
            color: "putColor",
          },
          {
            name: "DELETE",
            id: RequestMethod.DELETE,
            color: "deleteColor",
          },
          {
            name: "PATCH",
            id: RequestMethod.PATCH,
            color: "patchColor",
          },
        ]}
        method={method ? method : ""}
        onclick={handleDropdown}
      />
      <input
        required
        type="text"
        id="input-request-url"
        placeholder="Enter URL or paste text"
        class="url-input form-control input-outline border-0 p-3 rounded {isInputEmpty
          ? 'border-red'
          : ''}"
        autocomplete="off"
        spellcheck="false"
        autocorrect="off"
        autocapitalize="off"
        style="width:{isCollaps ? '100%' : ''}; height:34px;"
        bind:value={urlText}
        on:input={handleInputValue}
        on:keydown={(e) => handleKeyPress(e)}
        on:keyup={(e) => {
          trackCursor = e.target.selectionStart;
        }}
        on:blur={() => {
          setTimeout(() => {
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }, 300);
        }}
        on:focus={(e) => {
          handleInputValue();
          const elem = document.getElementById("input-request-url");
          environmentAxisY = elem.getBoundingClientRect().top + 40;
          environmentAxisX = elem.getBoundingClientRect().left;
        }}
        bind:this={inputElement}
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

      <button
        disabled={disabledSend}
        class="d-flex align-items-center justify-content-center btn btn-primary text-whiteColor ps-3 pe-3 py-2"
        style="font-size: 15px;height:34px; font-weight:400"
        on:click|preventDefault={handleSendRequest}>Send</button
      >
    </div>
    <div class="ps-2 {isCollaps ? 'ps-4' : 'ps-2'}">
      <img src={lineIcon} alt="" />
    </div>

    <div class="d-flex gap-1 ps-2">
      <span style="cursor:pointer;">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          on:click={() => isHorizontal.set(false)}
          on:click={() => {
            selectedView = "vertical";
            const splitter = document.querySelector(".splitpanes__splitter");
            const leftPanel = document.querySelector(".left-panel");
            const rightPanel = document.querySelector(".right-panel");
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
            const splitter = document.querySelector(".splitpanes__splitter");
            const leftPanel = document.querySelector(".left-panel");
            const rightPanel = document.querySelector(".right-panel");
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
