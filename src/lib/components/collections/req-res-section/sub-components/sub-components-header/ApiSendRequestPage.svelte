<script lang="ts">
  // import angleDown from "$lib/assets/angle-down.svg";
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
  import { keyStore, valueStore } from "$lib/store/parameter";
  import { onDestroy } from "svelte";
  import { makeRequestforCrud } from "$lib/api/api.common";
    import type { NewTab } from "$lib/utils/interfaces/request.interface";

  //this for expand and collaps condition
  let isCollaps;

  collapsibleState.subscribe((value) => (isCollaps = value));

  let isInputEmpty: boolean = false;
  let inputElement: HTMLInputElement;

  let currentTabId = null;
  let tabList : NewTab[] = [];
  let urlText: string = "";
  let method = "";
  let requestData;
  let disabledSend : boolean = false;
  let componentData: NewTab;

  const testJSON : (text : string) => string = (text) => {
    try {
        JSON.parse(text);
        return text;
    } catch (error) {
        return '{}';
    }
}

  const handleSendRequest = async () => {
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
      let response = await makeRequestforCrud(
        requestData.request.url,
        requestData.request.method,
        "Content-Type=application/json&User-Agent=PostmanRuntime/7.33.0&Accept=*/*&Connection=keep-alive",
        testJSON(requestData.request.body),
        "JSON",
      );

      if (response.isSuccessful) {
          let responseBody = response.data.response.data;
          let responseHeaders = response.data.headers;
          let responseStatus = response.data.status;
          tabs.update((value) => {
          let temp = value.map((elem) => {
            if (elem.id === currentTabId) {
              elem.request.response = {
                body: JSON.stringify(responseBody),
                headers: JSON.stringify(responseHeaders),
                status: responseStatus
              }
              elem.requestInProgress = false;
            }
            return elem;
          });
          return temp;
        }); 
      }
      else {
        tabs.update((value) => {
        let temp = value.map((elem) => {
          if (elem.id === currentTabId) {
            elem.requestInProgress = false;
          }
          return elem;
        });
        return temp;
      });
      }
    }
  };
 
  const extractKeyValueFromUrl = (url : string) => {
    let queryString : string = "";
    let flag : boolean = false;

    for (let i = 0; i < url.length; i++) {
        if (flag) {
            queryString += url[i];
        }
        if (url[i] === '?') {
            flag = true;
        }
    }

    if (queryString === "") {
        return [{ name: "", description: "", checked: false }];
    }

    let paramsArray = queryString.split('&');
    let params = paramsArray.map((param) => {
        let keyValue = param.split("=");
        if (keyValue.length === 1) {
            return { name: keyValue[0], description: "", checked: true };
        } else if (keyValue.length === 2) {
            return { name: keyValue[0], description: keyValue[1], checked: true };
        }
    });

    return [...params, { name: "", description: "", checked: false }];
  }

  const handleDropdown = (tab: string) => {
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

  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      // Enter key is pressed, set keyText and valueText
      const inputValue = inputElement.value.trim();
      if (inputValue.includes("=")) {
        const [key, value] = inputValue.split("=");
        keyStore.set(key);
        valueStore.set(value);
        inputElement.value = "";
      }
    }
  }
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
</script>

<div class="d-flex flex-column w-100">
  <div
    class="d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-3 pe-3'
      : 'pt-3 px-3'}"
    style="width:calc(100%-312px);"
  >
    <div class="d-flex gap-2 w-100">
      <div class="d-flex align-items-center justify-content-center">
        <p
          class="d-flex mb-0 w-100 h-100 pe-3 py-0 align-items-center btn btn-primary1 justify-content-center justify-content-center rounded"
        >
          <CrudDropdown
            data={[
              "GET",
              "POST",
              "PUT",
              "DEL",
              "TRAC",
              "PATC",
              "HEAD",
              "OPT",
              "CON",
            ]}

            method = {componentData ? componentData.request.method : ""}
            onclick={handleDropdown}
          />
        </p>
      </div>

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
        on:keydown={handleInputKeyDown}
      />
      <button disabled={disabledSend}
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
