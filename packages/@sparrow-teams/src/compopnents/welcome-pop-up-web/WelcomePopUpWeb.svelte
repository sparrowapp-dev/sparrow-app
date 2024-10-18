<script>
  import { WelcomeLogo } from "@sparrow/common/images";
    import { DownloadIcon, DownloadIconWeb } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
</script>

<div class="pt-2 pb-4">
  <div class="d-flex">
    <WelcomeLogo />
    <p class="text-fs-18"
      style="margin-top: 3px; margin-left: 8px; color: var(--text-secondary-100);  font-weight:500;"
    >
      Welcome to <span class="gradient-text">Sparrow</span> !
    </p>
  </div>
  <p style=" color: var(--text-secondary-1000)" class="text-fs-16 pb-0">
    Your API journey awaits!<br /> Sparrow app allows you to simplify workflows effortlessly,
    saving time and effort.
  </p>
</div>
<div class="d-flex justify-content-start">
    
  <!-- <Button
    title={"Install Sparrow Desktop"}
    textStyleProp={"font-size:16px; font-weight:400;"}
    type={"primary"}
    buttonStartIcon={DownloadIconWeb}
    buttonStartIconStyle={"height:16px; width:16px;"}
  /> -->
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
