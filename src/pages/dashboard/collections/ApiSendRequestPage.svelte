<script>
  import angleDown from "$lib/assets/angle-down.svg";
  import tableColumnIcon from "$lib/assets/table-column.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";

  import RequestResponse from "./request-response-section/RequestResponse.svelte";
</script>

<div class="d-flex flex-column">
  <div class="d-flex align-items-center justify-content-between px-4">
    <div class="d-flex gap-2">
      <div class="d-flex align-items-center justify-content-center">
        <button
          style="width: 71px; height:38px border:1px solid #313233"
          class="d-flex align-items-center bg-backgroundColor py-2 px-3 justify-content-center border-1 border-primary gap-2 rounded"
        >
          <p class="mb-0 text-getColor" style="font-size: 12px;">GET</p>
          <img src={angleDown} alt="" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Enter URL or paste text"
        class="bg-blackColor border-0 p-3"
        style="width:695px; height:38px; outline:none;font-size:14px; border-radius: 8px; gap: 8px;"
      />
      <button
        class="btn btn-primary text-whiteColor px-4 py-2"
        style="font-size: 16px;height:38px; font-weight:400">Send</button
      >
    </div>
    <div>
      <img src={lineIcon} alt="" />
    </div>

    <div class="d-flex gap-1">
      <button class="bg-backgroundColor border-0">
        <img src={tableColumnIcon} alt="" />
      </button>
      <button class="bg-backgroundColor border-0">
        <img src={barIcon} alt="" />
      </button>
    </div>
  </div>
  <div class="d-flex flex-column">
    <RequestResponse />
  </div>
</div>

<style>
  .btn-primary {
    background: var(--send-button);
    border-right: 1px solid #313233;
  }

  .btn-primary:hover {
    background: var(--send1-hoverbutton);
  }
</style>
