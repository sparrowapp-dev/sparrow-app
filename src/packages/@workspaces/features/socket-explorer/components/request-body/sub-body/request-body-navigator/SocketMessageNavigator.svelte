<script lang="ts">
  import BeautifyIcon from "$lib/assets/beautify.svg";
  import { RequestDataType, RequestDataset } from "$lib/utils/enums";
  import { Button } from "@library/ui";
  import { notifications } from "@library/ui/toast/Toast";
  import { WithSelect } from "@workspaces/common/hoc";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums/mixpanel-events.enum";
  export let onUpdateRequestState;
  export let requestState;
  export let onSendMessage;
  export let webSocket;
  export let body;

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
          name: "Text",
          id: RequestDataType.TEXT,
        },
        {
          name: "JSON",
          id: RequestDataType.JSON,
        },
        {
          name: "HTML",
          id: RequestDataType.HTML,
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
  <Button
    title="Send"
    disable={webSocket?.status !== "connected" || !body}
    onClick={() => {
      onSendMessage();
      MixpanelEvent(Events.Send_WebSocket_Request);

    }}
    type={"primary"}
  />
</div>
