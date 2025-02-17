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

<div class="mb-2 gap-2 d-flex align-items-center justify-content-between">
  <div class="d-flex mt-1" style="font-size: 12px;">
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
    />
  </div>
  <Input
    bind:value={requestEventName}
    id="collection-list-search"
    width={"100%"}
    height={"28px"}
    type="text"
    on:input={() => {
      onUpdateRequestEventName(requestEventName);
    }}
    defaultBorderColor={"transparent"}
    hoveredBorderColor={"1px solid var(--border-ds-neutral-300)"}
    focusedBorderColor={"2px solid var(--border-ds-primary-300)"}
    class="text-fs-12 bg-tertiary-400 border-radius-2 ellipsis fw-normal px-2"
    style="outline:none;"
    placeholder="Event name"
  />
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
