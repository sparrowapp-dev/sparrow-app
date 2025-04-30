<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { MathFormulaRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;

  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody(e.detail);
  };

  export let handleOpenCurrentDynamicExpression;
  export let dispatcher;
</script>

<div class="request-body position-relative">
  <Editor
    bind:lang
    bind:value
    on:change={handleCodeMirrorChange}
    isEditable={true}
    {isBodyBeautified}
    beautifySyntaxCallback={updateBeautifiedState}
    bind:dispatcher
    handleOpenDE={(obj) => {
      handleOpenCurrentDynamicExpression({
        ...obj,
        type: "raw",
      });
    }}
  />
</div>
