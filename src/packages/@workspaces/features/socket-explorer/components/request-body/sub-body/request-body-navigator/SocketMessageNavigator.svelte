<script lang="ts">
  import BeautifyIcon from "$lib/assets/beautify.svg";
  import { RequestDataType, RequestDataset } from "$lib/utils/enums";
  import { Button } from "@library/ui";
  import { notifications } from "@library/ui/toast/Toast";
  import { WithSelect } from "@workspaces/common/hoc";
  export let onUpdateRequestState;
  export let updateBeautifiedState: (value: boolean) => void;
  export let requestState;

  let handleRawDropDown = (tab: string) => {
    onUpdateRequestState({ socketMessageLanguage: tab });
  };
</script>

<div class="mb-2 d-flex align-items-center justify-content-between">
  <div class="d-flex" style="font-size: 12px;">
    <WithSelect
      id={"hash9872"}
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
      titleId={requestState.socketMessageLanguage}
      onclick={handleRawDropDown}
      zIndex={499}
      disabled={false}
    />
  </div>
  <!-- <div>
    <div
      on:click={() => {
        updateBeautifiedState(true);
        notifications.success("Code formatted successfully!");
      }}
      role="button"
      class="icon-container d-flex align-items-center justify-content-center border-radius-2"
    >
      <img src={BeautifyIcon} style="height:10px; width:10px;" />
    </div>
  </div> -->
  <Button title="Send" onClick={() => {}}
    type={"primary"} />
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
