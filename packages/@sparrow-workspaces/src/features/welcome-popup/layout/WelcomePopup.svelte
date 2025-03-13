<script>
  import { Button } from "@sparrow/library/ui";
  import SparrowLogo from "../icons/SparrowIconLogo.svelte";
  export let onClickExplore;
  export let onClickTour;
  export let loader = false;
</script>

<div class="d-flex row align-items-center" style="padding: 0; gap:2px;">
  <div class="d-flex row gap-2">
    <div class="d-flex justify-content-normal">
      <SparrowLogo />
    </div>

    <div class="d-flex align-items-center row" style="width: 274px;">
      <p class="title-text" style="margin: 0;">Welcome to Sparrow</p>
      <p class="description-text" style="margin: 0;">
        Sparrow simplifies workflows for fast, effortless API testing.
      </p>
    </div>
  </div>

  <div class="d-flex justify-content-end gap-2">
    <Button
      title="Explore Myself"
      size="small"
      type="secondary"
      onClick={onClickExplore}
    />
    <Button
      title="Take A Walkthrough"
      size="small"
      type="primary"
      {loader}
      onClick={onClickTour}
    />
  </div>
</div>

<style>
  .gradient-text {
    font-size: 18;
    font-weight: 500;
    display: inline-block;
    background: linear-gradient(270deg, #6147ff 2.55%, #1193f0 31.48%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: var(--text-ds-neutral-50);
  }
  .description-text {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: var(--text-ds-neutral-300);
  }
</style>
