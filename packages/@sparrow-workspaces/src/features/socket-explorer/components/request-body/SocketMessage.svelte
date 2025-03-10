<script lang="ts">
  import { BroomRegular } from "@sparrow/library/icons";
  import { Raw, SocketMessageNavigator } from "./sub-body";
  import { Button } from "@sparrow/library/ui";

  export let body;
  export let requestState;
  export let onUpdateMessage;
  export let onUpdateRequestState;
  let isBodyBeautified = false;
  const updateBeautifiedState = (value: boolean) => {
    isBodyBeautified = value;
  };
  export let onSendMessage;
  export let onClearInput;
  export let webSocket;
</script>

<div class="ps-0 pe-0 d-flex flex-column rounded w-100 h-100 position-relative">
  <SocketMessageNavigator
    {onUpdateRequestState}
    {requestState}
    {onSendMessage}
    {webSocket}
    {body}
  />
  <div style="flex:1; overflow:auto;">
    <div class="d-flex flex-column h-100">
      <div style="flex:1; overflow:auto;">
        <Raw
          onUpdateRequestBody={onUpdateMessage}
          lang={requestState?.socketMessageLanguage}
          value={body}
          {isBodyBeautified}
          {updateBeautifiedState}
        />
      </div>
      <div
        style="border-top: 1px solid var(--border-secondary-400);"
        class="pt-2 pb-2 d-flex justify-content-between"
      >
        <div></div>
        <div>
          <Button
          type="teritiary-regular"
          startIcon={BroomRegular}
          onClick={onClearInput}
          title="Clear Inputs"
          size="small"
          />
        </div>
      </div>
    </div>
  </div>
</div>

