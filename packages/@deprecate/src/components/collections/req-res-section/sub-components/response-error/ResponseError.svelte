<script>
  import infoIcon from "@deprecate/assets/infoIcon.svg";
</script>

<div
  class="api-error-container d-flex flex-column align-items-center justify-content-center"
>
  <div class="d-flex align-items-center mb-3">
    <img src={infoIcon} alt="" />
    <h4 class="mb-0 heading text-dangerColor mx-2">
      Could not send a request.
    </h4>
  </div>
  <small class="text-center text-requestBodyColor"
    >Please check the request URL and try again. Make sure that the domain
    exists. Please refer to your API provider documentation for further help.</small
  >
</div>

<style>
  .api-error-container {
    height: calc(100vh - 400px);
  }
  .api-error-container .heading {
    font-size: 18px;
  }
</style>
