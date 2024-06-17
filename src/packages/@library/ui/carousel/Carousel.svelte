<script lang="ts">
  import Ellipse from "@library/icons/Ellipse.svelte";
  export let data = [];
  let stepData = data[0];
  let currentStep = 0;
  let n = data.length;
  export let handleClosePopup: (flag: boolean) => void;

  function navigateStep(direction) {
  if (direction === 'next' && currentStep < n - 1) {
    currentStep += 1;
  } else if (direction === 'prev' && currentStep > 0) {
    currentStep -= 1;
  }
  stepData = data[currentStep];
}
</script>

<div style="max-height: 509px;">
  <div class=" d-flex flex-column" style="gap:19.72px;">
    <div style="height: 276px; padding:auto; padding-top:4px;">
      <img
    style="height: 276px; width:100%; border-radius:4px;" 
        src="{stepData?.gif}"
        alt="Description of the GIF"
      />
    </div>
    <div class="d-flex flex-column" style=" gap:19.72px;">
      <div class="d-flex flex-row justify-content-center" style="gap:5.48px;">
        {#each data as element, index}
          <Ellipse
            color={index === currentStep
              ? "var(--text-primary-300)"
              : "var(--text-tertiary-200)"}
          />
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
      <header
        class="d-flex"
        style=" height:auto; 	justify-content: space-between;"
      >
        <div>
          {#if currentStep > 0}
            <button
              class="border-0"
              style=" background-color: var(--bg-primary-300) ; padding:3px 19px 3px 20px; border-radius:4.78px; outline:none; "
              on:click={()=>{navigateStep('prev')}}>Previous</button
            >
          {/if}
        </div>
        {#if currentStep === n - 1}
          <button
            class="border-0"
            style="background-color: var(--bg-primary-300); padding:3px 19px 3px 20px; border-radius:4.78px; outline:none;"
            on:click={() => {
              handleClosePopup(false);
            }}
          >
            Close
          </button>
        {:else}
          <button
            class="border-0"
            style="background-color: var(--bg-primary-300); padding:3px 19px 3px 20px; border-radius:4.78px; outline:none;"
            on:click={()=>{navigateStep('next')}}
          >
            Next
          </button>
        {/if}
      </header>
    </div>
  </div>
</div>
