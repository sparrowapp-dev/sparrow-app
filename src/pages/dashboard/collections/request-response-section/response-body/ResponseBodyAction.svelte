<script>
  import angleDown from "$lib/assets/angle-down.svg";
  import downloadIcon from "$lib/assets/download.svg";
  import copyIcon from "$lib/assets/copy.svg";
  import ResponseBody from "./ResponseBody.svelte";
</script>

<div class="d-flex flex-column">
  <div
    class="d-flex align-items-center justify-content-between py-3 ps-3"
  >
    <div class="d-flex gap-4">
      <button
        class="d-flex align-items-center justify-content-center bg-backgroundColor border-0 gap-2"
      >
        <p
          style="font-size: 12px;font-weight:400;Line-height:18px"
          class="mb-0 text-whiteColor"
        >
          Pretty
        </p>
        <img src={angleDown} alt="" class="w-100 h-100" />
      </button>

      <button
        class="d-flex align-items-center justify-content-center gap-2 bg-backgroundColor border-0"
      >
        <p
          style="font-size: 12px;font-weight:400;"
          class="mb-0 text-whiteColor"
        >
          JSON
        </p>
        <img src={angleDown} alt="" class="w-100 h-100" />
      </button>
    </div>
    <div class="d-flex gap-4">
      <button class=" bg-backgroundColor border-0">
        <img src={downloadIcon} alt="" />
      </button>

      <button class=" bg-backgroundColor border-0">
        <img src={copyIcon} alt="" />
      </button>
    </div>
  </div>
  <ResponseBody />
</div>

<style></style>
