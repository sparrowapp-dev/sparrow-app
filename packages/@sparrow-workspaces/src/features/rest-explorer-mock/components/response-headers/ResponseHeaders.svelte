<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  export let responseHeader;
  import { TabularInput } from "@sparrow/workspaces/components";
  const headers = [{ key: "", value: "", checked: false }];

  // Minimal required props for TabularInput
  let environmentVariables = [];
  let onUpdateEnvironment = () => {};
  let handleHeaderChange = () => {};
</script>

<section class="w-100" style="">
  <TabularInput
    keyValue={headers}
    callback={handleHeaderChange}
    {environmentVariables}
    {onUpdateEnvironment}
    isCheckBoxEditable={true}
    isTopHeaderRequired={true}
    isInputBoxEditable={true}
  />
</section>

<style>
</style>
