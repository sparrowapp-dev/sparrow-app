<script>
  import { SparrowLogo } from "@sparrow/common/images";
  import { Button } from "@sparrow/library/ui";
  import { AddRegular } from "@sparrow/library/icons";

  export let onCreateMockResponse;
</script>

<div
  class="d-flex flex-column justify-content-center align-items-center w-100 h-100"
  style="flex:1;"
>
  <div class="container">
    <SparrowLogo width={"120px"} height={"120px"} />
  </div>
  <p
    style="color:var(--text-ds-neutral-400); font-size: 12px;font-weight:500;text-align:center"
  >
    This mock request has no responses. Add a mock response to begin testing.
  </p>
  <Button
    title="Add Mock Response"
    size="small"
    type="outline-secondary"
    onClick={onCreateMockResponse}
    startIcon={AddRegular}
  />
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 78px 24px;
  }
</style>
