<script>
  import ResponseBodyAction from "./ResponseBodyAction.svelte";
</script>

<div
  class="d-flex flex-column"
  style="width: 480px; height: 64vh;border-left:2px solid #313233;"
>
  <div
    class="d-flex align-items-center justify-content-between ps-3"
    style="d-flex;align-items:center; justify-content:center;width:480px;height:28px;gap: 12px;"
  >
    <div class="d-flex gap-4 text-requestBodyColor">
      <a
        href="/responsebody"
        style="font-size: 12px;font-weight:500"
        class="d-flex text-requestBodyColor text-decoration-none"
        >Response Body
      </a>

      <a
        href="/headers"
        style="font-size: 12px;font-weight:500"
        class="d-flex text-requestBodyColor text-decoration-none"
        >Headers
        <p style="font-size: 13px;" class="mb-0 text-labelColor ps-1">(8)</p></a
      >
    </div>
    <div class="d-flex gap-3">
      <button
        class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary1"
        style="font-size: 12px; font-weight:600"
      >
        <span>200</span>
        <p class="mb-0">OK</p>
      </button>
      <button
        class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary2"
        style="font-size: 12px;font-weight:600"
      >
        <span>300</span>
        <p class="mb-0">ms</p>
      </button>
      <button
        class="d-flex align-items-center justify-content-center text-backgroundColor gap-1 btn btn-primary3"
        style="font-size: 12px;font-weight:600"
      >
        <span>6.8</span>
        <p class="mb-0">KB</p>
      </button>
    </div>
  </div>
  <ResponseBodyAction />
</div>

<style>
  .btn-primary1 {
    background: var(--success-color);
  }

  .btn-primary2 {
    background: var(--button-color);
  }
  .btn-primary3 {
    background: var(--button-color);
  }
</style>
