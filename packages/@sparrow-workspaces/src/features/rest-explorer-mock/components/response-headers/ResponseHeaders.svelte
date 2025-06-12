<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import { TabularInput } from "@sparrow/workspaces/components";
  export let responseHeaders;
  export let onUpdateResponseHeaders;
  export let responseId;

  const handleHeaderChange = (pairs: KeyValuePair[]): void => {
    onUpdateResponseHeaders(pairs, responseId);
  };
</script>

<section class="w-100" style="">
  <TabularInput
    keyValue={responseHeaders}
    callback={handleHeaderChange}
    isCheckBoxEditable={true}
    isTopHeaderRequired={true}
    isInputBoxEditable={true}
  />
</section>

<style>
</style>
