<script>
  // import angleDown from "$lib/assets/angle-down.svg";
  import tableColumnIcon from "$lib/assets/tableColumn.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/request-response-section";

  // import RequestResponse from "$lib/components/collections/req-res-section/RequestResponse.svelte";
  import CrudDropdown from "$lib/components/dropdown/CrudDropdown.svelte";
  import RequestParam from "../request-body-section/RequestParam.svelte";
  import { crudMethod } from "$lib/services/collection";
  import { apiEndPoint } from "$lib/store/api-request";
  import { methodText } from "$lib/store/api-request";

  import SaveRequest from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
  //this for expand and collaps condition
  let isCollaps;
  collapsibleState.subscribe((value) => (isCollaps = value));

  let sendText = "Send";
  let isSending = false;
  const handleSendRequest = () => {
    if (!isSending) {
      // If not currently sending, change to "Cancel" and start sending
      sendText = "Cancel";
      isSending = true;

      // Here you can call your send request function (e.g., handleSendRequest)
      crudMethod();

      // Automatically change back to "Send" after 2 seconds
      setTimeout(() => {
        sendText = "Send";
        isSending = false;
      }, 3000);
    } else {
      // If currently sending, handle the cancel action (you can add your logic here)
      // Reset the button text and state
      sendText = "Send";
      isSending = false;
    }
  };

  //store for storing api endpoint url
  let urlText = "";
  const handleInputValue = () => {
    apiEndPoint.set(urlText);
  };

  //store for storing method
  let handleDropdown = (tab) => {
    methodText.set(tab);
  };

  let selectedView = "grid";
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
        type="text"
        placeholder="Enter URL or paste text"
        class="form-control bg-blackColor border-0 p-3 rounded"
        style=" width:{isCollaps
          ? '100%'
          : '670px'}; height:34px; outline:none;font-size:14px;"
        bind:value={urlText}
        on:input={handleInputValue}
      />

      <button
        class="d-flex align-items-center justify-content-center btn btn-primary text-whiteColor px-4 py-2"
        style="font-size: 16px;height:34px; font-weight:400"
        on:click={handleSendRequest}>{sendText}</button
      >
      <SaveRequest visibility = {true} />
    </div>
    <div class="ps-2 {isCollaps ? 'ps-4' : 'ps-2'}">
      <img src={lineIcon} alt="" />
    </div>

    <div class="d-flex gap-1 ps-2">
      <span style="cursor:pointer;">
        <img
          on:click={() => isHorizontalVertical.set(true)}
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
          on:click={() => isHorizontalVertical.set(false)}
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

  .btn-primary1:hover {
    background: var(--border-color);
  }
</style>
