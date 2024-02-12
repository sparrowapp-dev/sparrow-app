<script lang="ts">
  import ComboText from "$lib/components/text/ComboText.svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  let isHorizontalMode: boolean;
  isHorizontal.subscribe((value) => (isHorizontalMode = value));
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
      <ComboText
        comboContainerClassProp={"d-flex align-items-center text-left justify-content-between gap-5 mb-2 mt-2"}
        key={"Send Request"}
        value={"ctrl + Enter"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
      <ComboText
        comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
        key={"Save Request"}
        value={"ctrl + S"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
      <ComboText
        comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
        key={"New Request"}
        value={"ctrl + N"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
    </div>
    <div class={isHorizontalMode ? "d-flex flex-column" : "d-flex flex-column"}>
      <ComboText
        comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
        key={"Edit link"}
        value={"alt + L"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
      <ComboText
        comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
        key={"Add Parameter"}
        value={"alt + P"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
      <ComboText
        comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
        key={"Add Header"}
        value={"alt + H"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
      <ComboText
        comboContainerClassProp={"d-flex align-items-center justify-content-between gap-5 mb-2"}
        key={"Edit Body"}
        value={"alt + B"}
        keyClassProp={"mb-0"}
        keyStyleProp={"min-width: 80px; width: auto;"}
        valueClassProp={"bg-buttonBackColor rounded text-buttonColor border-0 py-1 px-4"}
        valueStyleProp={"width: 120px;"}
        type="combo"
      />
    </div>
  </div>
</div>

<style>
  .shortcut-btn-api {
    width: 120px;
  }
  .shortcut-text {
    min-width: 80px;
    width: auto;
  }
</style>
