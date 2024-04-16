<script lang="ts">
  import infoIcon from "$lib/assets/info-color-blue.svg";
  import crossIcon from "$lib/assets/cross.svg";
  import { Select } from "$lib/components/inputs";
  import { RequestDataType, RequestDataset } from "$lib/utils/enums";
  export let method = "";
  export let onUpdateRequestState;
  export let requestState;
  let handleDropdown = (tab: string) => {
    // collectionsMethods.updateRequestState(tab, "dataset");
    onUpdateRequestState({ dataset: tab });
  };

  let handleRawDropDown = (tab: string) => {
    // collectionsMethods.updateRequestState(tab, "raw");
    onUpdateRequestState({ raw: tab });
  };
</script>

<div>
  {#if method === "GET"}
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
        class="cross-button d-flex align-items-center justify-content-center d-none"
      >
        <img
          src={crossIcon}
          alt="info"
          class="cursor-pointer"
          on:click={() => {
            // getMessage = false;
          }}
        />
      </div>
    </div>
  {:else if method === "DELETE"}
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
        class="cross-button d-flex align-items-center justify-content-center d-none"
      >
        <img
          src={crossIcon}
          alt="info"
          class="cursor-pointer"
          on:click={() => {
            // deleteMessage = false;
          }}
        />
      </div>
    </div>
  {/if}
</div>
<div class="mb-2 d-flex">
  <p
    class="team-menu__link pb-1 mb-0 d-flex align-items-center"
    style="font-size: 12px; margin-top:4px;"
  >
    Data Types:
  </p>
  <span class="pe-3" />
  <Select
    id={"hash124"}
    data={[
      {
        name: "Raw",
        id: RequestDataset.RAW,
      },
      {
        name: "Form data",
        id: RequestDataset.FORMDATA,
      },
      {
        name: "Form Encoded URL",
        id: RequestDataset.URLENCODED,
      },
      {
        name: "None",
        id: RequestDataset.NONE,
      },
    ]}
    titleId={requestState.dataset}
    onclick={handleDropdown}
    headerTheme={"transparent"}
    borderType={"none"}
    borderActiveType={"bottom"}
    borderHighlight={"hover-active"}
    headerHighlight={"active"}
    minBodyWidth={"150px"}
    borderRounded={false}
    menuItem={"v2"}
  />
  <span class="pe-3" />
  {#if requestState.dataset === RequestDataset.RAW}
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
      titleId={requestState.raw}
      onclick={handleRawDropDown}
      headerTheme={"transparent"}
      borderType={"none"}
      borderActiveType={"bottom"}
      borderHighlight={"hover-active"}
      headerHighlight={"active"}
      minBodyWidth={"150px"}
      borderRounded={false}
      menuItem={"v2"}
    />
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
</style>
