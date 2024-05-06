<script lang="ts">
  import infoIcon from "$lib/assets/info-color-blue.svg";
  import BeautifyIcon from "$lib/assets/beautify.svg";
  import crossIcon from "$lib/assets/cross.svg";
  import { Select } from "$lib/components/inputs";
  import { RequestDataType, RequestDataset } from "$lib/utils/enums";
  export let method = "";
  export let onUpdateRequestState;
  export let updateBeautifiedState: (value: boolean) => void;
  export let requestState;
  let handleDropdown = (tab: string) => {
    // collectionsMethods.updateRequestState(tab, "dataset");
    onUpdateRequestState({ requestBodyNavigation: tab });
  };

  let handleRawDropDown = (tab: string) => {
    // collectionsMethods.updateRequestState(tab, "raw");
    onUpdateRequestState({ requestBodyLanguage: tab });
  };
  let isDeleteMessage = true;
  let isGetMessage = true;
</script>

<div>
  {#if method === "GET" && isGetMessage}
    <div class="d-flex error-message py-1 mb-2">
      <div class="info-button d-flex align-items-center justify-content-center">
        <img src={infoIcon} alt="info" />
      </div>
      <small class="w-100"
        >For GET requests, it's uncommon to use a request body. Some frameworks
        support the request body for GET method, but it is generally not
        recommended to use.</small
      >
      <div
        class="cross-button d-flex align-items-center justify-content-center"
      >
        <img
          src={crossIcon}
          alt="info"
          class="cursor-pointer"
          on:click={() => {
            isGetMessage = false;
          }}
        />
      </div>
    </div>
  {:else if method === "DELETE" && isDeleteMessage}
    <div class="d-flex error-message py-1 mb-2">
      <div class="info-button d-flex align-items-center justify-content-center">
        <img src={infoIcon} alt="info" />
      </div>
      <small class="w-100"
        >For DELETE requests, it's uncommon to use a request body. Some
        frameworks support the request body for DELETE method, but it is
        generally not recommended to use.</small
      >
      <div
        class="cross-button d-flex align-items-center justify-content-center"
      >
        <img
          src={crossIcon}
          alt="info"
          class="cursor-pointer"
          on:click={() => {
            // deleteMessage = false;
            isDeleteMessage = false;
          }}
        />
      </div>
    </div>
  {/if}
</div>
<div class="mb-2 d-flex">
  <Select
    id={"hash124"}
    data={[
      {
        name: "None",
        id: RequestDataset.NONE,
      },
      {
        name: "Form Data",
        id: RequestDataset.FORMDATA,
      },
      {
        name: "Encoded URL",
        id: RequestDataset.URLENCODED,
      },
      {
        name: "Raw",
        id: RequestDataset.RAW,
      },
      {
        name: "Binary",
        id: RequestDataset.BINARY,
        disabled: true,
      },
    ]}
    titleId={requestState.requestBodyNavigation}
    onclick={handleDropdown}
    headerTheme={"grey"}
    borderType={"none"}
    borderActiveType={"none"}
    borderHighlight={"hover-active"}
    headerHighlight={"hover-active"}
    minBodyWidth={"150px"}
    borderRounded={true}
    bodyTheme={"grey"}
    checkIconColor={"var(--text-primary-200)"}
    menuItem={"v2"}
  />
  <span class="pe-3" />
  {#if requestState.requestBodyNavigation === RequestDataset.RAW}
    <Select
      id={"hash987"}
      data={[
        {
          name: "HTML",
          id: RequestDataType.HTML,
        },
        {
          name: "JSON",
          id: RequestDataType.JSON,
        },
        {
          name: "JavaScript",
          id: RequestDataType.JAVASCRIPT,
        },
        {
          name: "Text",
          id: RequestDataType.TEXT,
        },
        {
          name: "XML",
          id: RequestDataType.XML,
        },
      ]}
      titleId={requestState.requestBodyLanguage}
      onclick={handleRawDropDown}
      headerTheme={"grey"}
      borderType={"none"}
      borderActiveType={"none"}
      borderHighlight={"hover-active"}
      headerHighlight={"hover-active"}
      minBodyWidth={"150px"}
      borderRounded={true}
      bodyTheme={"grey"}
      checkIconColor={"var(--text-primary-200)"}
      menuItem={"v2"}
    />
    <div
      style="margin-left: auto; cursor:pointer; width: 30px"
      on:click={() => updateBeautifiedState(true)}
      class="beauty-icon"
    >
      <img src={BeautifyIcon} alt="Beautify" class="beauty-img" />
    </div>
  {/if}
</div>

<style>
  .error-message {
    background-color: #11253a;
  }
  .error-message small {
    font-size: 12px;
  }
  .info-button,
  .cross-button {
    width: 36px;
  }
  .cursor-ppinter {
    cursor: pointer;
  }
  .beauty-icon {
    padding-left: 10px;
    align-self: center;
    border-radius: 4px;
  }
  .beauty-icon:hover {
    background-color: var(--dropdown-container);
    align-self: center;
    border-radius: 4px;
    padding-left: 10px;
  }
  .beauty-icon:active {
    background-color: var(--bg-secondary-500);
    align-self: center;
    border-radius: 4px;
    padding-left: 10px;
  }
</style>
