<script lang="ts">
  import { infoColorBlueIcon as infoIcon } from "@sparrow/library/assets";
  import { crossIcon } from "@sparrow/library/assets";
  import { Select } from "@sparrow/library/forms";
  import { RequestDataType, RequestDataset } from "@sparrow/common/enums";
  import { notifications } from "@sparrow/library/ui";
  import { WithSelect } from "@sparrow/workspaces/hoc";
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
  {#if method === "GET" && isGetMessage && false}
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
  {:else if method === "DELETE" && isDeleteMessage && false}
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
<div class="mb-2 d-flex align-items-center justify-content-between">
  <div class="d-flex" style="font-size: 12px;">
    <WithSelect
      id={"hash124"}
      data={[
        {
          name: "none",
          id: RequestDataset.NONE,
        },
        {
          name: "form-data",
          id: RequestDataset.FORMDATA,
        },
        {
          name: "x-www-form-urlencoded",
          id: RequestDataset.URLENCODED,
        },
        {
          name: "raw",
          id: RequestDataset.RAW,
        },
        {
          name: "binary",
          id: RequestDataset.BINARY,
          disabled: true,
        },
      ]}
      titleId={requestState.requestBodyNavigation}
      onclick={handleDropdown}
      zIndex={499}
      disabled={true}
    />
    <span class="pe-3" />
    {#if requestState.requestBodyNavigation === RequestDataset.RAW}
      <WithSelect
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
        zIndex={499}
        disabled={true}
      />
    {/if}
  </div>
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

  .icon-container {
    height: 24px;
    width: 24px;
  }
  .icon-container:hover {
    background-color: var(--bg-secondary-550);
  }
  .icon-container:active {
    background-color: var(--bg-secondary-600);
  }
</style>
