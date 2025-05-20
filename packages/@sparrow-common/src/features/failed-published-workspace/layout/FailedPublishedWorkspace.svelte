<script lang="ts">
  import { fallingConfetti } from "@sparrow/common/images";
  import { DismissCircleFilled } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";

  export let isFailedPublishedModalOpen;
  export let workspaceName: string;
</script>

<div
  class="d-flex flex-column align-items-center"
  style=" gap:8px; padding-bottom: 24px;"
>
  <div>
    <DismissCircleFilled size="24px" color="var(--icon-ds-danger-400)" />
  </div>
  <span
    class="d-flex align-items-center justify-content-center text-ds-font-weight-semi-bold text-ds-neutral-50 text-ds-font-size-16"
  >
    Oops! Something Went Wrong</span
  >
  <div class="d-flex flex-column align-items-center">
    <span
      class="text-align-center text-ds-font-weight-medium text-ds-neutral-50 text-ds-font-size-14"
      style="text-align: center;"
      >Your workspace “{workspaceName}” could not be published.

      <br />
      Please check your configuration and try again. <br /></span
    >
  </div>

  <Button
    title={"Retry"}
    type={"primary"}
    size={"small"}
    onClick={() => {
      isFailedPublishedModalOpen = false;
    }}
  ></Button>
</div>
