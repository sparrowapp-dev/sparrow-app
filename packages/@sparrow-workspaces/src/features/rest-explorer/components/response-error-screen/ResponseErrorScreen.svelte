<script>
  import { DangerIcon } from "@sparrow/library/icons";
  import { SparrowLogo } from "@sparrow/common/images";
  import { Alert } from "@sparrow/library/ui";
  export let onSendButtonClicked;
  export let environmentVariables;

  const handleClickSendButton = () => {
    onSendButtonClicked(environmentVariables);
  };
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
        description="Unable to reach the API endpoint. Please verify the request URL and try again."
        ctaShow={true}
        onClick={handleClickSendButton}
      />
    </div>
  </div>
</div>

<style>
  .error-message {
    max-width: 480px;
  }
</style>
