<script>
  import { isHorizontalVertical } from "$lib/store/request-response-section";
  let isHorizontalVerticalMode;
  isHorizontalVertical.subscribe((value) => (isHorizontalVerticalMode = value));
</script>

{#if isHorizontalVerticalMode}
  <div
    class="d-flex text-requestBodyColor flex-column align-items-center justify-content-between py-3 ps-3"
  >
    <div class="d-flex align-items-center justify-content-center mb-4 mt-5">
      <h4 style="font-weight: 500;">Click send to get a Response</h4>
    </div>
    <div
      style="font-family: Roboto Mono;font-size: 12px;font-weight: 400;line-height: 18px;letter-spacing: 0em;text-align: left;"
      class="d-flex flex-column"
    >
      <h5 style="font-weight: 700;text-align:center">Few shortcuts</h5>
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
{:else}
  <div
    class="d-flex text-requestBodyColor flex-column align-items-left justify-content-start py-1 ps-1"
  >
    <div
      class="d-flex flex-column align-items-left justify-content-start mb-2 mt-1"
    >
      <h4 style="font-weight: 500;text-align:left">
        Click send to get a Response
      </h4>
      <h5 style="font-weight: 700;text-align:left">Few shortcuts</h5>
    </div>
    <div
      style="font-family: Roboto Mono;font-size: 12px;font-weight: 400;line-height: 18px;letter-spacing: 0em;text-align: left;"
      class="d-flex align-items-center justify-content-start gap-4"
    >
      <div class="d-flex flex-column">
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
        <div
          class="d-flex align-items-center justify-content-between gap-5 mb-2"
        >
          <p class="mb-0">Save Request</p>
          <button
            disabled
            class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
          >
            ctrl + S
          </button>
        </div>
        <div
          class="d-flex align-items-center justify-content-between gap-5 mb-2"
        >
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
        class="d-flex flex-column align-items-center text-left justify-content-between"
      >
        <div
          class=" d-flex align-items-center justify-content-between gap-5 mb-2"
        >
          <p class="mb-0">Edit link</p>
          <button
            disabled
            class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
          >
            alt + L
          </button>
        </div>
        <div
          class="d-flex align-items-center justify-content-between gap-5 mb-2"
        >
          <p class="mb-0">Add Parameter</p>
          <button
            disabled
            class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
          >
            alt + P
          </button>
        </div>
        <div
          class="d-flex align-items-center justify-content-between gap-5 mb-2"
        >
          <p class="mb-0">Add Header</p>
          <button
            disabled
            class="bg-buttonBackColor text-buttonColor border-0 py-1 px-4"
          >
            alt + H
          </button>
        </div>
        <div
          class="d-flex align-items-center justify-content-between gap-5 mb-2"
        >
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
{/if}
