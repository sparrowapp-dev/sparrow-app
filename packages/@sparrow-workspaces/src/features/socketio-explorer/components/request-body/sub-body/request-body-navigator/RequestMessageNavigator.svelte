<script lang="ts">
  import { Button } from "@sparrow/library/ui";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { Input } from "@sparrow/library/forms";
  import { SocketDataTypeEnum } from "@sparrow/common/types/workspace/socket-io-request-tab";
  export let onUpdateRequestState;
  export let requestState;
  export let onSendMessage;
  export let webSocket;
  export let onUpdateRequestEventName;
  export let requestEventName;

  let handleRawDropDown = (tab: string) => {
    onUpdateRequestState({ messageLanguage: tab });
  };
</script>

<div
  class="d-flex align-items-center justify-content-between"
  style="gap:6px;margin-bottom: 10px"
>
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
      titleId={requestState.messageLanguage}
      onclick={handleRawDropDown}
      zIndex={499}
      disabled={false}
      minHeaderWidth={"70px"}
      headerHeight={"28px"}
      minBodyWidth={"104px"}
    />
  </div>
  <div class="w-100">
    <Input
      bind:value={requestEventName}
      id="collection-list-search"
      variant="primary"
      size="small"
      on:input={() => {
        onUpdateRequestEventName(requestEventName);
      }}
      defaultBorderColor="transparent"
      hoveredBorderColor="var(--border-primary-300)"
      focusedBorderColor={"var(--border-primary-300)"}
      class="text-fs-12 border-radius-2 ellipsis fw-normal px-2 inputField"
      style="outline:none;"
      placeholder="Event Name"
      width="100%"
    />
  </div>
  <Button
    title="Send"
    size="small"
    buttonStyleProp="width: 48px; position: relative; top: 1px; height: 24px; font-size: 12px; padding: 11px !important; border-radius: 2px !important; "
    disable={webSocket?.status !== "connected"}
    onClick={() => {
      onSendMessage();
      MixpanelEvent(Events.Send_SocketIO_Request, {
        description: "Clicked on Send message button in Socket.IO.",
      });
    }}
    type={"primary"}
  />
</div>
