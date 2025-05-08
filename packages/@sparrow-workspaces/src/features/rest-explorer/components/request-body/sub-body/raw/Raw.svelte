<script lang="ts">
  import { Editor } from "@sparrow/library/forms";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;

  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string;

  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };
</script>

<div class="request-body position-relative h-100">
  <Editor
    bind:lang
    bind:value
    bind:isMergeViewEnabled
    bind:newModifiedContent
    bind:isMergeViewLoading
    on:change={handleCodeMirrorChange}
    isEditable={true}
    autofocus={true}
    {isBodyBeautified}
    beautifySyntaxCallback={updateBeautifiedState}
  />
</div>
