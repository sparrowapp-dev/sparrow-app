<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody(e.detail);
  };
</script>

<div class="request-body position-relative h-100">
  <Editor
    bind:lang
    bind:value
    on:change={handleCodeMirrorChange}
    isEditable={true}
    {isBodyBeautified}
    beautifySyntaxCallback={updateBeautifiedState}
    placeholder={"Message"}
  />
</div>
