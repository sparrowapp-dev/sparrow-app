<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { SocketDataTypeEnum } from "@sparrow/common/types/workspace/web-socket";
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
          id: SocketDataTypeEnum.TEXT,
        },
        {
          name: "JSON",
          id: SocketDataTypeEnum.JSON,
        },
        {
          name: "HTML",
          id: SocketDataTypeEnum.HTML,
        },
        {
          name: "XML",
          id: SocketDataTypeEnum.XML,
        },
      ]}
      titleId={requestState.socketMessageLanguage}
      onclick={handleRawDropDown}
      zIndex={499}
      disabled={false}
      minHeaderWidth={"70px"}
      headerHeight={"28px"}
      minBodyWidth={"104px"}
    />
  </div>
  <Button
    title="Send"
    size="small"
    buttonStyleProp="width: 48px; position: relative; top: 1px; height: 24px; font-size: 12px; padding: 11px !important; border-radius: 2px !important; "
    disable={webSocket?.status !== "connected" || !body}
    onClick={() => {
      onSendMessage();
      MixpanelEvent(Events.Send_WebSocket_Request);
    }}
    type={"primary"}
    customWidth={"70px"}
  />
</div>
