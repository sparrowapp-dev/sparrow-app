<script lang="ts">
  import { DangerIcon } from "@sparrow/library/icons";
  import { SparrowLogo } from "@sparrow/common/images";
  import { Alert } from "@sparrow/library/ui";
  import type { Response } from "@sparrow/common/types/workspace";
  export let onSendButtonClicked;
  export let response: Response;
</script>

<div class="response-default">
  <div class="">
    <div class="d-flex align-items-center flex-column justify-content-center">
      <div class="my-4">
        <SparrowLogo />
      </div>
      <div class="d-flex flex-column align-items-center">
        <p class="text-secondary-200 text-fs-14 fw-bold">
          Could not Send Request
        </p>
      </div>
      <Alert
        varient="error"
        heading="Error"
        description={response?.body.length > 0
          ? response.body
          : "Unable to reach the API endpoint. Please verify the request URL and try again."}
        ctaShow={true}
        onClick={onSendButtonClicked}
      />
    </div>
  </div>
</div>

<style>
  .error-message {
    max-width: 480px;
  }
</style>
