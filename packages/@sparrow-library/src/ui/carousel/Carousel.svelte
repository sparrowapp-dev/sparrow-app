<script lang="ts">
  import type { CarouselDataType } from "./types/carousel-data.type";
  import { Ellipse } from "@sparrow/library/icons";
  export let data: CarouselDataType[] = [];
  let stepData = data[0];
  let currentStep = 0;
  let n = data.length;
  export let handleClosePopup: (flag: boolean) => void;

  const navigateStep = (direction: string) => {
    if (direction === "next" && currentStep < n - 1) {
      currentStep += 1;
    } else if (direction === "prev" && currentStep > 0) {
      currentStep -= 1;
    }
    stepData = data[currentStep];
  };
</script>

<div style="height: 509px;">
  <div class=" d-flex flex-column" style="gap:19.72px; height:480px;">
    <div style="height: 276px; padding:auto; padding-top:0px;">
      {#if !navigator.onLine}
        <div class="fallback-message">
          Failed to load Media, Please check your internet connection
        </div>
      {:else}
        <img
          style="height: 276px; width:100%; border-radius:4px;"
          src={stepData?.gif}
          alt="Description of the GIF"
        />
      {/if}
    </div>
    <div class="d-flex flex-column" style=" gap:19.72px; ">
      <div class=" d-flex flex-row justify-content-center" style=" gap:5.48px;">
        {#each data as element, index}
          <button
            class="border-0"
            style="background-color:transparent; outline:none;"
            on:click={() => {
              currentStep = index;
              stepData = data[currentStep];
            }}
          >
            <Ellipse
              color={index === currentStep
                ? "var(--text-primary-300)"
                : "var(--text-tertiary-200)"}
            />
          </button>
        {/each}
      </div>
      <div style=" padding-left: 12.88px; padding-right: 12.88px;">
        <h4 style="font-size: 15.75px; font-weight:600;">
          {stepData?.heading}
        </h4>
        <p
          style="font-size: 13.1px; color:var(--bg-secondary-1000); font-weight:500; "
        >
          {stepData?.subheading}
        </p>
      </div>
    </div>
  </div>
  <header class="d-flex" style=" height:auto; 	justify-content: space-between;">
    <div>
      {#if currentStep > 0}
        <button
          class="btn border-0"
          style=" background-color: var(--bg-primary-300) ; padding:3px 19px 3px 20px; border-radius:4.78px; outline:none; "
          on:click={() => {
            navigateStep("prev");
          }}>Previous</button
        >
      {/if}
    </div>
    {#if currentStep === n - 1}
      <button
        class="btn border-0"
        style="background-color: var(--bg-primary-300); padding:3px 19px 3px 20px; border-radius:4.78px; outline:none;"
        on:click={() => {
          handleClosePopup(false);
        }}
      >
        Close
      </button>
    {:else}
      <button
        class=" btn border-0"
        style="background-color: var(--bg-primary-300); padding:3px 19px 3px 20px; border-radius:4.78px; outline:none; "
        on:click={() => {
          navigateStep("next");
        }}
      >
        Next
      </button>
    {/if}
  </header>
</div>

<style>
  .btn:hover {
    background-color: var(--bg-primary-250) !important;
  }
  .btn:active {
    background-color: var(--bg-primary-500) !important;
  }

  .fallback-message {
    height: 276px;
    width: 100%;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    color: #333;
  }
</style>
