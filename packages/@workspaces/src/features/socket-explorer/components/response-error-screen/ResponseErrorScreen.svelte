<script>
  import { DangerIcon } from "@sparrow/library/icons";
  import { SparrowLogo } from "@sparrow/common/images";
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
      <div
        class="d-flex align-items-center error-message bg-danger-1000 border-radius-2"
      >
        <div class="error-icon p-3">
          <DangerIcon />
        </div>
        <div class="error-content">
          <p class="mb-0 text-fs-12 pe-3">
            Cloud Agent error: Please check the URL .Try again. Make sure that
            the domain is publicly accessible
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .error-message {
    max-width: 480px;
  }
</style>
