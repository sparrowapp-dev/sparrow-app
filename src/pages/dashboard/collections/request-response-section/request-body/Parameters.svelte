<script>
  import dragIcon from "$lib/assets/drag.svg";
</script>

<div class=" pt-3 ps-2">
  <div
    class="d-flex ps-5 align-items-center justify-content-between text-requestBodyColor"
    style="font-size: 12px;font-weight:500"
  >
    <div class="d-flex align-items-center justify-content-between gap-4">
      <p>Key</p>
      <p>Value</p>
    </div>
  </div>
  <div class="d-flex align-items-center gap-2">
    <img src={dragIcon} alt="" />
    <input type="checkbox" class="form-check-input bg-black" />
    <input
      class="border-0 px-2 py-1 no-outline bg-black"
      style="outline: none;font-size:12px"
      type="text"
      id="password"
      placeholder="Enter Key"
      required
    />
    <input
      class="border-0 px-2 py-1 bg-black"
      style="outline: none;font-size:12px"
      type="text"
      id="password"
      placeholder="Enter Value"
      required
    />
  </div>
</div>

<style>
</style>
