<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isBodyBeautified = false;
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let updateBeautifiedState: (value: boolean) => void;

  // ToDo: the below values should also get updated when merge view disable or when content changed
  export let isMergeViewEnable = false;
  let newModifiedContent = `{ 
  key: "origion", 
  value: "1", 
  checked: true 
  }`;

  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };

  setTimeout(() => {
    console.log("calling toggleDiffView() :>> ");
    isMergeViewEnable = true;
  }, 10000);

  $: {
    if (isMergeViewEnable) {
      console.log("ismer :>> ", isMergeViewEnable);
    }
  }
  $: {
    if (newModifiedContent) {
      console.log("iscont :>> ", newModifiedContent);
    }
  }
</script>

<div class="request-body position-relative">
  <Editor
    bind:lang
    bind:value
    bind:showMergeView={isMergeViewEnable}
    bind:newModifiedContent
    on:change={handleCodeMirrorChange}
    isEditable={isMergeViewEnable ? false : true}
    {isBodyBeautified}
    beautifySyntaxCallback={updateBeautifiedState}
  />
</div>
