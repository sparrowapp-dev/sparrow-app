<script lang="ts">
  import { Editor } from "@library/forms";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };
</script>

<div class="request-body position-relative">
  <Editor
    bind:lang
    bind:value
    on:change={handleCodeMirrorChange}
    isEditable={false}
    {isBodyBeautified}
    beautifySyntaxCallback={updateBeautifiedState}
  />
</div>
