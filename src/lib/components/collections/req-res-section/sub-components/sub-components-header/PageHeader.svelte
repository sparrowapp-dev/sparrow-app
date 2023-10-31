<script lang="ts">
  import angleDown from "$lib/assets/angle-down.svg";
  import { collapsibleState } from "$lib/store/request-response-section";
  import floppyDisk from "$lib/assets/floppy-disk.svg";
  import ApiSendRequestPage from "./ApiSendRequestPage.svelte";
  import SaveRequest from "$lib/components/collections/req-res-section/sub-components/save-request/SaveRequest.svelte";
 
  let isCollaps : boolean;
  let display: boolean = false;
  collapsibleState.subscribe((value) => (isCollaps = value));
  
  window.addEventListener("click", () => {
    display = false;
  });
  let visibility : boolean = false;
  const handleBackdrop = (flag) =>{
    visibility = flag;
  } 
</script>

<div class="d-flex flex-column">
  <div
    class="pageheader d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-4 pe-3'
      : 'pt-4 px-3'}"
  >
    <div>
      <p class="mb-0 text-whiteColor" style="font-size: 18px; font-weight:400">
        create new booking
      </p>
    </div>

    <div class="d-flex gap-3">
      <div class="d-flex gap-1">
        <button
          class="btn btn-primary d-flex align-items-center py-1.6 justify-content-center gap-2 ps-3 pe-4 rounded border-0"
        >
          <img src={floppyDisk} alt="" class="w-100 h-100" />
          <p
            class="mb-0 text-whiteColor"
            style="font-size: 14px; font-weight:400;"
          >
            Save
          </p>
        </button>
        <span class="position-relative">
          <button
          on:click={
            ()=>{
              setTimeout(() => {
                display = true;
              }, 100);
            }
          }
            class="px-2 py-2  btn btn-primary d-flex align-items-center justify-content-center rounded border-0"
          >
            <img src={angleDown} alt="" class="w-100 h-100" />
          </button>
          <div class="rounded save-options {display ? 'd-block' : 'd-none'}">
            <p style="width:120px;" class="bg-black m-0 py-1 px-3 cursor-pointer" on:click={()=>{
              display = false;
              visibility = true;
            }}>Save As</p>
          </div>
          <SaveRequest visibility = {visibility} onClick={handleBackdrop} />
        </span>
      </div>
      <div>
        <button
          class="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-3 py-1.3 rounded border-0"
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
  .pageheader {
    /* margin-top: 30px; */
  }
  .btn-primary {
    background-color: #313233;
  }

  .btn-primary:hover {
    background-color: #616364;
  }
  .save-options{
    position: absolute;
    top:40px;
    right: 0;
  }
  .cursor-pointer{
    cursor: pointer;
  }
</style>
