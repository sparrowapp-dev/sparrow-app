<script lang="ts">
  import { Splitpanes, Pane } from "svelte-splitpanes";

  import Button from "$lib/components/buttons/Button.svelte";
  import Input from "$lib/components/inputs/Input.svelte";

  import floppyDisk from "$lib/assets/floppy-disk.svg";

  import HttpUrlSection from "$lib/components/rest-tool/http-url-section/HttpUrlSection.svelte";

  import RequestPane from "$lib/components/rest-tool/request-pane/RequestPane.svelte";
  import ResponsePane from "$lib/components/rest-tool/response-pane/ResponsePane.svelte";

  import RestExplorerViewModel from "./RestExplorer.ViewModel";

  const _viewModel = new RestExplorerViewModel();
</script>

<div class="w-100 d-flex flex-column h-100">
  <!-- Request Name Header -->
  <div class="d-flex justify-content-between w-100 p-3">
    <Input
      value="New Request"
      noBackground={true}
      inputStyleProp="font-size: 1.5rem; font-weight: 500;"
      class="flex-1"
    />
    <!-- Save and Share Buttons -->
    <div class="d-flex justify-content-between">
      <Button
        title="Save Request"
        type="dark"
        buttonClassProp="ms-2"
        buttonStartIcon={floppyDisk}
      />
      <Button title="Share" type="dark" buttonClassProp="ms-2" />
    </div>
  </div>

  <!-- HTTP URL Section -->
  <HttpUrlSection
    class="py-1 px-3"
    bind:requestUrl={_viewModel.requestUrl}
    bind:httpMethod={_viewModel.httpMethod}
    onSendButtonClicked={_viewModel.sendRequest}
  />

  <Splitpanes class="h-100" dblClickSplitter={false}>
    <Pane>
      <!-- Request Pane -->
      <RequestPane />
    </Pane>
    <Pane>
      <!-- Response Pane -->
      <ResponsePane />
    </Pane>
  </Splitpanes>
</div>

<style></style>
