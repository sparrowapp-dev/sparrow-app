<script>
  import { WelcomeLogo } from "@sparrow/common/images";
  import { Button } from "@sparrow/library/ui";
  export let onClickExplore;
  export let onClickTour;
</script>

<div class="pt-2 pb-4">
  <div class="d-flex">
    <WelcomeLogo />
    <p
      style="margin-top: 3px; margin-left: 8px; color: var(--text-secondary-100); font-size:18px; font-weight:500;"
    >
      Welcome to <span class="gradient-text">Sparrow</span> !
    </p>
  </div>
  <p style="font-size: 16px; color: var(--text-secondary-1000)">
    Your API journey awaits!<br /> Sparrow app allows you to simplify workflows effortlessly,
    saving time and effort.
  </p>
</div>
<div class="d-flex justify-content-between">
  <Button
    title={"Explore Myself"}
    textStyleProp={"font-size:16px; font-weight:400;"}
    type={"dark"}
    onClick={() => {
      onClickExplore();
    }}
  />
  <Button
    title={"Take a Tour"}
    textStyleProp={"font-size:16px; font-weight:400;"}
    type={"primary"}
    onClick={() => {
      onClickTour();
    }}
  />
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
</style>
