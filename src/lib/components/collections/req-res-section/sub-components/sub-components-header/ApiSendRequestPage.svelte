<script lang="ts">
  // import angleDown from "$lib/assets/angle-down.svg";
  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";
  import {
    apiRequest,
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";
  import CrudDropdown from "$lib/components/dropdown/CrudDropdown.svelte";
  import RequestParam from "../request-body-section/RequestParam.svelte";
  import { crudMethod } from "$lib/services/collection";
  import { apiEndPoint, methodText } from "$lib/store/api-request";
  import { keyStore, valueStore } from "$lib/store/parameter";
  import { onMount } from "svelte";

  import SaveRequest from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
  //this for expand and collaps condition
  let isCollaps;
  let visibility : boolean = true;
  const handleBackdrop = (flag) =>{
    visibility = flag;
  } 
  collapsibleState.subscribe((value) => (isCollaps = value));

  let isInputEmpty: boolean = false;
  let inputElement: HTMLInputElement;

  let urlText: string = "";
  const handleSendRequest = async () => {
    if (urlText.trim() === "") {
      isInputEmpty = true;
      inputElement.focus();
    } else {
      isInputEmpty = false;
      await crudMethod();
    }
  };

  let keyText: string;
  let valueText: string;

  keyStore.subscribe((value) => {
    keyText = value;
    updateUrlText();
  });

  let urlInputField: string = "";
  function handleInputValue() {
    updateUrlText();
  }
  function setValueText(newValue: string) {
    valueText = newValue;
    handleInputValue();
  }

  function updateUrlText() {
    urlText = keyStore && valueStore ? "?" + keyText + "=" + valueText : "";
  }
  apiEndPoint.set(urlInputField + urlText);

  valueStore.subscribe(setValueText);

  const handleDropdown = (tab: string) => {
    methodText.set(tab);
    apiRequest.update(value => {
      if(value.length === 1) {
        let temp = value;
        temp[0].method = tab;
        return temp;
      }
    });
  };

  onMount(updateUrlText);

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
      <button
        class="d-flex align-items-center justify-content-center btn btn-primary text-whiteColor px-4 py-2"
        style="font-size: 16px;height:34px; font-weight:400"
        on:click|preventDefault={handleSendRequest}>Send</button
      >
      <SaveRequest visibility = {visibility} onClick={handleBackdrop} />
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
