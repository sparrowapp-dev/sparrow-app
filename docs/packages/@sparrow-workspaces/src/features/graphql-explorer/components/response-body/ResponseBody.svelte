<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import {
    RequestDataTypeEnum,
    type Response,
  } from "@sparrow/common/types/workspace";
  export let response: Response;
  let language = RequestDataTypeEnum.JSON;
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <div class="w-100 position-relative">
    <Editor
      bind:lang={language}
      bind:value={response.body}
      on:change={() => {}}
      isEditable={false}
      isFormatted={true}
    />
  </div>
</div>
