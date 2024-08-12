<script lang="ts">
  import BeautifyIcon from "$lib/assets/beautify.svg";
  import { RequestDataType, RequestDataset } from "$lib/utils/enums";
  import { Button } from "@library/ui";
  import { notifications } from "@library/ui/toast/Toast";
  import { WithSelect } from "@workspaces/common/hoc";
  export let onUpdateRequestState;
  export let requestState;
  export let onSendMessage;

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
  <Button title="Send" onClick={onSendMessage} type={"primary"} />
</div>
