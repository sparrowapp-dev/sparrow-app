<script lang="ts">
  import ComboText from "$lib/components/text/ComboText.svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  let isHorizontalMode: boolean;
  isHorizontal.subscribe((value) => (isHorizontalMode = value));
  const ctrlCommands = {
    "Send Request": "ctrl + Enter",
    "Save Request": "ctrl + S",
    "New Request": "ctrl + N",
  };
  const altCommands = {
    "Edit link": "alt + L",
    "Add Parameter": "alt + P",
    "Add Header": "alt + H",
    "Edit Body": "alt + B",
  };
</script>

<div
  class="d-flex text-requestBodyColor flex-column {isHorizontalMode
    ? 'align-items-start'
    : 'align-items-center'} justify-content-between py-3 ps-3"
>
  <div
    class="d-flex flex-column align-items-start {isHorizontalMode
      ? 'align-items-start '
      : 'align-items-center'} justify-content-start {isHorizontalMode
      ? 'mb-2 mt-3'
      : 'mb-3 mt-5'} "
  >
    <h4 style="font-weight: 500; text-align: center;">
      Click send to get a Response
    </h4>
    <h5 style="font-weight: 700;">Few shortcuts</h5>
  </div>
  <div
    style="font-family: Roboto Mono;font-size: 12px;font-weight: 400;line-height: 18px;letter-spacing: 0em;;"
    class={isHorizontalMode
      ? "d-flex align-items-start justify-content-between gap-4"
      : "d-flex flex-column"}
  >
    <div
      class={isHorizontalMode
        ? "d-flex flex-column align-items-start justify-content-between"
        : ""}
    >
      {#each Object.entries(ctrlCommands) as [key, value]}
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
          {key}
          {value}
          type="combo"
        />
      {/each}
    </div>
    <div class={isHorizontalMode ? "d-flex flex-column" : "d-flex flex-column"}>
      {#each Object.entries(altCommands) as [key, value]}
        <ComboText
          comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
          {key}
          {value}
          type="combo"
        />
      {/each}
    </div>
  </div>
</div>
