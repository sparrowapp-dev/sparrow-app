<script>
  import { DangerIcon } from "@sparrow/library/icons";
  import { SparrowLogo } from "@sparrow/common/images";
  import { Alert } from "@sparrow/library/ui";

  export let response;
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
        heading="Error"
        varient="error"
        description={response?.body || "An unexpected error occurred."}
      />
    </div>
  </div>
</div>

<style>
  .error-message {
    max-width: 480px;
  }
</style>
