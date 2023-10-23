<script>
  import angleDown from "$lib/assets/angle-down.svg";
  import tableColumnIcon from "$lib/assets/table-column.svg";
  import barIcon from "$lib/assets/barIcon.svg";
  import lineIcon from "$lib/assets/line.svg";
  import {
    collapsibleState,
    isHorizontalVertical,
  } from "$lib/store/requestSection";

  // import RequestResponse from "$lib/components/collections/req-res-section/RequestResponse.svelte";
  import CrudDropdown from "$lib/components/dropdown/CrudDropdown.svelte";
  import RequestParam from "../request-body-section/RequestParam.svelte";

  let onclickState = false;

  const toggleClick = () => {
    onclickState = !onclickState;
    isHorizontalVertical.set(onclickState);
  };

  let handleDropdown = (tab) => {
    // currentTab = tab;
    // console.log(currentTab);
    // console.log(tab);
  };

  //this for expand and collaps condition
  let isCollaps;
  collapsibleState.subscribe((value) => (isCollaps = value));
</script>

<div class="d-flex flex-column w-100">
  <div
    class="d-flex align-items-center justify-content-between {isCollaps
      ? 'ps-5 pt-3 pe-3'
      : 'pt-3 px-3'}"
    style="width:calc(100%-312px);"
  >
    <div class="d-flex gap-2">
      <div class="d-flex align-items-center justify-content-center">
        <p
          class="d-flex mb-0 w-100 h-100 pe-3 py-0 align-items-center btn btn-primary1 justify-content-center justify-content-center rounded"
        >
          <CrudDropdown
            data={[
              "GET",
              "POST",
              "PUT",
              "DEL",
              "TRAC",
              "PATC",
              "HEAD",
              "OPT",
              "CON",
            ]}
            onclick={handleDropdown}
          />
        </p>
      </div>

      <input
        type="text"
        placeholder="Enter URL or paste text"
        class="bg-blackColor border-0 p-3 rounded"
        style=" width:{isCollaps
          ? '918px'
          : '670px'}; height:38px; outline:none;font-size:14px;"
      />

      <button
        class="btn btn-primary text-whiteColor px-4 py-2"
        style="font-size: 16px;height:38px; font-weight:400">Send</button
      >
    </div>
    <div class="ps-1">
      <img src={lineIcon} alt="" />
    </div>

    <div class="d-flex gap-1">
      <button class="bg-backgroundColor border-0" on:click={toggleClick}>
        <img src={tableColumnIcon} alt="" />
      </button>
      <button class="bg-backgroundColor border-0" on:click={toggleClick}>
        <img src={barIcon} alt="" />
      </button>
    </div>
  </div>

  <RequestParam />
</div>

<style>
  .btn-primary {
    background: var(--send-button);
  }

  .btn-primary:hover {
    background: var(--send1-hoverbutton);
  }

  .btn-primary1 {
    background: var(--background-color);
    border: 1px solid var(--border-color);
  }

  .btn-primary1:hover {
    background: var(--border-color);
  }
</style>
