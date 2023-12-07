<script lang="ts">
  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import ColorDropdown from "$lib/components/dropdown/ColourDropdown.svelte";
  import { onDestroy } from "svelte";
  import { ApiSendRequestViewModel } from "./ApiSendRequestPage.ViewModel";
  import { createApiRequest } from "$lib/services/rest-api.service";
  import {
    RequestDataType,
    RequestMethod,
    RequestProperty,
  } from "$lib/utils/enums/request.enum";
  import type { RequestMethodType } from "$lib/utils/types/request.type";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";

  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  //this for expand and collaps condition
  const _apiSendRequest = new ApiSendRequestViewModel();

  let isCollaps: boolean;

  collapsibleState.subscribe((value) => (isCollaps = value));

  let isInputEmpty: boolean = false;
  let isInputValid: boolean = true;
  let inputElement: HTMLInputElement;

  let urlText: string = "";
  let method = "";
  let request;
  let disabledSend: boolean = false;

  const tabSubscribe = activeTab.subscribe((event: NewTab) => {
    urlText = event?.property.request?.url;
    method = event?.property.request?.method;
    disabledSend = event?.property.request?.requestInProgress;
    request = event?.property.request;
  });

  const handleSendRequest = async () => {
    isInputValid = true;
    const str = urlText;

    if (str.trim() === "") {
      isInputEmpty = true;
      inputElement.focus();
    } else {
      await collectionsMethods.updateRequestProperty(
        true,
        RequestProperty.REQUEST_IN_PROGRESS,
      );

      isInputEmpty = false;
      if (isInputValid) {
        let start = Date.now();
        let response = await createApiRequest(
          _apiSendRequest.decodeRestApiData(request),
        );
        let end = Date.now();

        const byteLength = new TextEncoder().encode(
          JSON.stringify(response),
        ).length;
        let responseSizeKB = byteLength / 1024;
        let duration = end - start;
        if (response.isSuccessful) {
          let responseBody = response.data.response;
          let responseHeaders = response.data.headers;
          let responseStatus = response.data.status;
          _apiSendRequest.setResponseContentType(
            responseHeaders,
            collectionsMethods,
          );
          await collectionsMethods.updateRequestProperty(
            false,
            RequestProperty.REQUEST_IN_PROGRESS,
          );
          await collectionsMethods.updateRequestProperty(
            {
              body: responseBody,
              headers: JSON.stringify(responseHeaders),
              status: responseStatus,
              time: duration,
              size: responseSizeKB,
            },
            RequestProperty.RESPONSE,
          );
        } else {
          await collectionsMethods.updateRequestProperty(
            false,
            RequestProperty.REQUEST_IN_PROGRESS,
          );
          await collectionsMethods.updateRequestProperty(
            {
              body: "",
              headers: "",
              status: "Not Found",
              time: 0,
              size: 0,
            },
            RequestProperty.RESPONSE,
          );
        }
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

  const handleDropdown = (tab: RequestMethodType) => {
    collectionsMethods.updateRequestProperty(tab, RequestProperty.METHOD);
  };
  let selectedView: string = "grid";

  let handleInputValue = () => {
    collectionsMethods.updateRequestProperty(urlText, RequestProperty.URL);
    collectionsMethods.updateRequestProperty(
      extractKeyValueFromUrl(urlText),
      RequestProperty.QUERY_PARAMS,
    );
  };

  onDestroy(() => {
    tabSubscribe();
  });

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    if (windowWidth <= 1300) {
      document.querySelector("#barIcon").click();
      isHorizontalVertical.set(true);
    } else {
      isHorizontalVertical.set(false);
    }
  };

  window.addEventListener("resize", handleResize);

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
  });

  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      handleSendRequest();
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
    <div class="d-flex gap-2 w-100">
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
        placeholder="Enter URL or paste text"
        class="form-control bg-blackColor border-0 p-3 rounded {isInputEmpty
          ? 'border-red'
          : ''}"
        style=" width:{isCollaps
          ? '100%'
          : '670px'}; height:34px; outline:none;font-size:14px;"
        bind:value={urlText}
        on:input={handleInputValue}
        bind:this={inputElement}
      />
      <button
        disabled={disabledSend}
        class="d-flex align-items-center justify-content-center btn btn-primary text-whiteColor px-4 py-2"
        style="font-size: 16px;height:34px; font-weight:400"
        on:click|preventDefault={handleSendRequest}>Send</button
      >
    </div>
    <div class="ps-2 {isCollaps ? 'ps-4' : 'ps-2'}">
      <img src={lineIcon} alt="" />
    </div>

    <div class="d-flex gap-1 ps-2">
      <span style="cursor:pointer;">
        <img
          on:click={() => isHorizontalVertical.set(false)}
          on:click={() => {
            selectedView = "grid";
          }}
          class:view-active={selectedView === "grid"}
          src={tableColumnIcon}
          alt=""
        />
      </span>
      <span style="cursor:pointer;">
        <img
          on:click={() => isHorizontalVertical.set(true)}
          on:click={() => {
            selectedView = "grid1";
          }}
          class:view-active={selectedView === "grid1"}
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
    background: var(--send-button);
  }

  .view-active {
    filter: invert(78%) sepia(86%) saturate(3113%) hue-rotate(177deg)
      brightness(100%) contrast(100%);
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
</style>
