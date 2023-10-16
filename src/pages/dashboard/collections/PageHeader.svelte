<script>

  import angleDown from "$lib/assets/angle-down.svg";

  import floppyDisk from "$lib/assets/floppy-disk.svg";
  import ApiSendRequestPage from "./ApiSendRequestPage.svelte";
</script>

<div class="d-flex flex-column">
  <div class="d-flex align-items-center justify-content-between p-4">
    <div>
      <p class="mb-0 text-whiteColor" style="font-size: 18px; font-weight:400">
        create new booking
      </p>
    </div>

    <div class="d-flex gap-3">
      <div class="d-flex gap-1">
        <button
          class="btn btn-primary d-flex align-items-center justify-content-center gap-2 ps-3 pe-4 rounded border-0"
        >
          <img src={floppyDisk} alt="" class="w-100 h-100" />
          <p
            class="mb-0 text-whiteColor"
            style="font-size: 14px; font-weight:400"
          >
            Save
          </p>
        </button>
        <button
          class="btn btn-primary d-flex align-items-center justify-content-center p-2 rounded border-0"
        >
          <img src={angleDown} alt="" class="w-100 h-100" />
        </button>
      </div>
      <div>
        <button
          class="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded border-0"
        >
          <p
            class="mb-0 text-whiteColor"
            style="font-size: 14px; font-weight:400"
          >
            Share
          </p>
        </button>
      </div>
    </div>
  </div>
  <div>
    <ApiSendRequestPage />
  </div>
</div>

<style>
  .btn-primary {
    background-color: #313233;
  }

  .btn-primary:hover {
    background-color: #616364;
  }
</style>
