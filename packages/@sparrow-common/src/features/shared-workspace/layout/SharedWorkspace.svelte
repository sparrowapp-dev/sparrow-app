<script>
  import { LinkRegular } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";

  export let isWorkspaceSharing = false;
  export let onCopyLink;
  export let workspaceLink;
</script>

<div
  class="d-flex flex-column"
  style="gap: 8px; margin-top: 16px; padding-bottom: 24px;"
>
  <div class="d-flex flex-row align-items-center justify-content-between">
    <div
      class="d-flex flex-row align-items-center justify-content-between"
      style="gap: 4px;"
    >
      <LinkRegular />
      <span
        class="text-ds-font-size-14 text-ds-font-weight-medium text-decoration-underline text-truncate"
        style="max-width: 270px;"
      >
        {workspaceLink}
      </span>
    </div>
    <Button
      title={isWorkspaceSharing ? "Copied" : "Copy link"}
      type={"primary"}
      size={"small"}
      onClick={async () => {
        await onCopyLink();
        isWorkspaceSharing = true;
        setTimeout(() => {
          isWorkspaceSharing = false;
        }, 3000);
      }}
    ></Button>
  </div>
  <span
    class="text-ds-font-size-12 text-ds-font-weight-medium text-ds-neutral-50"
    >Anyone with this link can view the public workspace.</span
  >
</div>
