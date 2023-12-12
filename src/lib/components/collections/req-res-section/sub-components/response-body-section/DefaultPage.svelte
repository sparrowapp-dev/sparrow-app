<script lang="ts">
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
    <h4 style="font-weight: 500;">Click send to get a Response</h4>
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
      <div
        class="d-flex align-items-center text-left justify-content-between gap-5 mb-2 mt-2"
      >
        <p class="mb-0">Send Request</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          ctrl + Enter
        </button>
      </div>
      <div class="d-flex align-items-center justify-content-between gap-5 mb-2">
        <p class="mb-0">Save Request</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          ctrl + S
        </button>
      </div>
      <div class="d-flex align-items-center justify-content-between gap-5 mb-2">
        <p class="mb-0">New Request</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          ctrl + N
        </button>
      </div>
    </div>
    <div
      class={isHorizontalMode
        ? "d-flex flex-column"
        : "d-flex flex-column"}
    >
      <div class="d-flex align-items-center justify-content-between gap-5 mb-2">
        <p class="mb-0">Edit link</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          alt + L
        </button>
      </div>
      <div class="d-flex align-items-center justify-content-between gap-5 mb-2">
        <p class="mb-0">Add Parameter</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          alt + P
        </button>
      </div>
      <div class="d-flex align-items-center justify-content-between gap-5 mb-2">
        <p class="mb-0">Add Header</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          alt + H
        </button>
      </div>
      <div class="d-flex align-items-center justify-content-between gap-5 mb-2">
        <p class="mb-0">Edit Body</p>
        <button
          disabled
          class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
        >
          alt + B
        </button>
      </div>
    </div>
  </div>
</div>
