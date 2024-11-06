<script lang="ts">
  import { RequestDataType, RequestDataset } from "@sparrow/common/enums";
  import { Button } from "@sparrow/library/ui";
  import { notifications } from "@sparrow/library/ui";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { Input } from "@sparrow/library/forms";
  export let onUpdateRequestState;
  export let requestState;
  export let onSendMessage;
  export let webSocket;
  export let body;

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
      titleId={requestState.messageLanguage}
      onclick={handleRawDropDown}
      zIndex={499}
      disabled={false}
    />
  </div>
  <Input
  id="collection-list-search"
  width={"65%"}
  height={"24px"}
  type="teritiary"
  
  defaultBorderColor="transparent"
  hoveredBorderColor="var(--border-primary-300)"
  focusedBorderColor={"var(--border-primary-300)"}
  class="text-fs-12 bg-tertiary-400 border-radius-2 ellipsis fw-normal px-2"
  style="outline:none;"
  placeholder="Enter name"
/>
<Button
  title="Send"
  buttonStyleProp="width: 48px; position: relative; top: 1px; height: 24px; font-size: 12px; padding: 11px !important; border-radius: 2px !important; " 
  disable={webSocket?.status !== "connected" || !body}
  onClick={() => {
    onSendMessage();
    MixpanelEvent(Events.Send_WebSocket_Request);
  }}
  type={"primary"}
/>
</div>



<!-- bind:value={searchData}
on:input={(e) => {
  handleSearch();
  isExpandCollection = true;
  isExpandEnvironment = true;
  isExpandTestflow = true;
}} -->