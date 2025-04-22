<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;

  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string;

  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    console.log("updating llkklkkl");
    onUpdateRequestBody({ raw: e.detail });
  };

  // Watch for changes and dispatch events
  // $: dispatch("mergeViewStateChange", isMergeViewEnabled);
  // $: dispatch("mergeViewContentChange", newModifiedContent);

  $: if (isMergeViewEnabled)
    console.log("in RAW - mergeviewenabled : ", isMergeViewEnabled);
  $: if (newModifiedContent)
    console.log("in RAW - newModifiedContent : ", newModifiedContent);
</script>

<div class="request-body position-relative">
  <Editor
    bind:lang
    bind:value
    bind:isMergeViewEnabled
    bind:newModifiedContent
    bind:isMergeViewLoading
    on:change={handleCodeMirrorChange}
    isEditable={isMergeViewEnabled ? false : true}
    {isBodyBeautified}
    beautifySyntaxCallback={updateBeautifiedState}
  />
</div>
