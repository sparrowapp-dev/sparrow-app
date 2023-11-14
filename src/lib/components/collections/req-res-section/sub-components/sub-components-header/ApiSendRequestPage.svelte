<script lang="ts">
  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";
  import {
    collapsibleState,
    currentTab,
    isHorizontalVertical,
    tabs,
    updateQueryParams,
  } from "$lib/store/request-response-section";
  import CrudDropdown from "$lib/components/dropdown/CrudDropdown.svelte";
  import RequestParam from "../request-body-section/RequestParam.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { notification } from "@tauri-apps/api";
  import { notifications } from "$lib/utils/notifications"; 
  import { ApiSendRequestController } from "./ApiSendRequestPage.controller";
    import { createApiRequest } from "$lib/services/rest-api.service";
    import { RequestMethod } from "$lib/utils/enums/request.enum";
    import type { RequestMethodType } from "$lib/utils/types/request.type";
 
  //this for expand and collaps condition
  const _apiSendRequest = new ApiSendRequestController();

  let isCollaps: boolean;

  collapsibleState.subscribe((value) => (isCollaps = value));

  let isInputEmpty: boolean = false;
  let isInputValid: boolean = true;
  let inputElement: HTMLInputElement;

  let currentTabId = null;
  let tabList: NewTab[] = [];
  let urlText: string = "";
  let method = "";
  let requestData;
  let disabledSend: boolean = false;
  let componentData: NewTab;

  const testJSON: (text: string) => string = (text) => {
    try {
      JSON.parse(text);
      return text;
    } catch (error) {
      return "{}";
    }
  };

  function ensureHttpOrHttps(str) {
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return str;
    } else if (str.startsWith("//")) {
      return "http:" + str;
    } else {
      return "http://" + str;
    }
  }

  function isValidURL(string) {
    var res = string.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    );
    return res !== null;
  }

  const handleSendRequest = async () => {
    isInputValid = true;
    let isValidUrlText = isValidURL(urlText);
    let urlValue = "";
    
    // if (isValidUrlText) {
    //   urlValue = ensureHttpOrHttps(urlText);
    // } else {
    //   isInputValid = false;
    //   notifications.error("Invalid URL");
    //   return;
    // }
    const str = urlText;
    
    if (str.trim() === "") {
      isInputEmpty = true;
      inputElement.focus();
    } else {
      tabs.update((value) => {
        let temp = value.map((elem) => {
          if (elem.id === currentTabId) {
            elem.requestInProgress = true;
          }
          return elem;
        });
        return temp;
      });

      isInputEmpty = false;
      if (isInputValid) {
        let start = Date.now();
        let response = await createApiRequest(
          _apiSendRequest.decodeRestApiData(requestData)
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
          tabs.update((value) => {
            let temp = value.map((elem) => {
              if (elem.id === currentTabId) {
                elem.request.response = {
                  body: responseBody,
                  headers: JSON.stringify(responseHeaders),
                  status: responseStatus,
                  time: duration,
                  size: responseSizeKB,
                };
                elem.requestInProgress = false;
              }
              return elem;
            });
            return temp;
          });
        } else {
          tabs.update((value) => {
            let temp = value.map((elem) => {
              if (elem.id === currentTabId) {
                elem.requestInProgress = false;
                let errorMessage : string = "Not Found";
                elem.request.response.status = errorMessage;
              }
              return elem;
            });
            return temp;
          });
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
    tabs.update((value) => {
      let temp = value.map((elem) => {
        if (elem.id === currentTabId) {
          elem.request.method = tab;
          elem.save = false;
        }
        return elem;
      });
      return temp;
    });
  };
  let selectedView: string = "grid";

  let handleInputValue = () => {
    tabs.update((value) => {
      let temp = value.map((elem) => {
        if (elem.id === currentTabId) {
          elem.request.url = urlText;
          elem.save = false;
        }
        return elem;
      });

      return temp;
    });
    updateQueryParams(extractKeyValueFromUrl(urlText), currentTabId);
  };

  const fetchUrlData = (id, list) => {
    list.forEach((elem) => {
      if (elem.id === id) {
        urlText = elem.request.url;
        method = elem.request.method;
        disabledSend = elem.requestInProgress;
        requestData = elem;
        componentData = elem;
      }
    });
  };

  const tabsUnsubscribe = tabs.subscribe((value) => {
    tabList = value;
    if (currentTabId && tabList) {
      fetchUrlData(currentTabId, tabList);
    }
  });

  const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      currentTabId = value.id;
      if (currentTabId && tabList) {
        fetchUrlData(currentTabId, tabList);
      }
    }
  });

  onDestroy(() => {
    tabsUnsubscribe();
    currentTabUnsubscribe();
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
</script>

<div class="d-flex flex-column w-100">
  <div
    class="d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-3 pe-3'
      : 'pt-3 px-3'}"
    style="width:calc(100%-312px);"
  >
    <div class="d-flex gap-2 w-100">

      <CrudDropdown
            data={[{
              name: "GET",
              id: RequestMethod.GET,
              color: "getColor"
            },
            {
              name: "POST",
              id: RequestMethod.POST,
              color: "postColor"
            },
            {
              name: "PUT",
              id: RequestMethod.PUT,
              color: "putColor"
            },
            {
              name: "DELETE",
              id: RequestMethod.DELETE,
              color: "deleteColor"
            },
            {
              name: "PATCH",
              id: RequestMethod.PATCH,
              color: "patchColor"
            },
            {
              name: "HEAD",
              id: RequestMethod.HEAD,
              color: "headColor"
            },
            {
              name: "OPTIONS",
              id: RequestMethod.OPTIONS,
              color: "optionsColor"
            },
            ]}
            method={componentData ? componentData.request.method : ""}
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

  <RequestParam />
</div>

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
