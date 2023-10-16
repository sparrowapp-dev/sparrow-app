<script>
  import doubleangleLeft from "$lib/assets/doubleangleLeft.svg";
  import searchIcon from "$lib/assets/search.svg";
  import filterIcon from "$lib/assets/filter.svg";
  import plusIcon from "$lib/assets/plus.svg";
  import angleRight from "$lib/assets/angleRight.svg";
</script>

<div
  style="width: 280px; height: calc(100vh - 50px); border-right: 1px solid #313233;padding:0px, 24px, 8px, 8px "
  class="d-flex flex-column bg-backgroundColor"
>
  <div
    class="d-flex justify-content-between align-items-center align-self-stretch ps-3 pe-3 pt-3"
  >
    <p class="mb-0 text-whiteColor" style="font-size: 18px;">Domigo</p>
    <button class="bg-backgroundColor border-0">
      <img src={doubleangleLeft} alt="" />
    </button>
  </div>
  <div
    class="d-flex align-items-center justify-content-between ps-3 pe-3 pt-3 gap-0"
  >
    <div
      style="height:32px; width:180px "
      class="inputField bg-blackColor ps-2 pe-1 gap-2 d-flex align-items-center justify-content-center rounded"
    >
      <img src={searchIcon} alt="" />
      <input
        type="search"
        class="inputField border-0 w-100 h-100 bg-blackColor"
        placeholder="Search APIs in Domigo"
      />
    </div>

    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-blackColor d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={filterIcon} alt="" />
      </button>
    </div>
    <div class="d-flex align-items-center justify-content-center">
      <button
        class="btn btn-plusButton py-0 d-flex align-items-center justify-content-center"
        style="width: 32px; height:32px;"
      >
        <img src={plusIcon} alt="" />
      </button>
    </div>
  </div>

  <div class="d-flex flex-column pt-3">
    <div class="d-flex flex-column justify-content-center gap-2">
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary hover-red d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
      <button
        class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 d-flex gap-3 py-1 ps-4"
      >
        <img src={angleRight} alt="angleRight" />
        <p class="mb-0">Bookings</p>
      </button>
    </div>
  </div>
</div>

<style>
  .inputField {
    outline: none;
  }

  .btn-primary {
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
    padding: 20px;
  }
</style>
