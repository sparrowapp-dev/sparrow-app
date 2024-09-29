<script lang="ts">
  import { SparrowLogo } from "@sparrow/common/images";
  export let isMainScreen = false;
</script>

<div
  class="{isMainScreen
    ? 'pt-5 pb-3'
    : ''} response-default h-100 d-flex flex-column justify-content-between align-items-center"
>
  <div class="">
    <div
      class="d-flex align-items-center flex-column justify-content-center pt-5"
    >
      <div class="my-4">
        <SparrowLogo />
      </div>
      <div class="d-flex flex-column align-items-center">
        <p class="text-secondary-200 fw-bold text-fs-14 mb-5">
          Make a connection to send and get messages.
        </p>
      </div>
    </div>
  </div>
</div>
