<script lang="ts">
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import { TabularInput } from "@sparrow/workspaces/components";

  export let value;
  export let environmentVariables;
  export let onUpdateRequestBody;
  export let onUpdateEnvironment;

  const handleUrlEncodeChange = (pairs) => {
    onUpdateRequestBody({ urlencoded: pairs });
  };

  export let isMergeViewEnabled = false;
  export let newModifiedContent: KeyValuePair[];

  $: {
    if (isMergeViewEnabled) {
      console.log("in URLEnc - mergeviewenabled : ", isMergeViewEnabled);
    }
  }
  $: {
    if (newModifiedContent) {
      console.log("in URLEnc - newModifiedContent : ", newModifiedContent);
    }
  }
</script>

<section class="w-100">
  <TabularInput
    keyValue={value}
    callback={handleUrlEncodeChange}
    {environmentVariables}
    {onUpdateEnvironment}
    bind:showMergeView={isMergeViewEnabled}
    bind:newModifiedPairs={newModifiedContent}
  />
</section>
