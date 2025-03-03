<script lang="ts">
  /**
   * Components
   */
  // import { Textarea } from "@sparrow/library/forms";

  /**
   * Types
   */
  import type { TeamForm } from "../../types";

  /**
   * Constants
   */
  import { DESCRIPTION_CONFIG } from "../../constants";
  import { Textarea } from "@sparrow/library/forms";
  import { SvelteComponent } from "svelte";

  /**
   * Exports
   */
  export let teamForm: TeamForm;
  export let iconComponent: typeof SvelteComponent;

  /**
   * Data
   */
  const TEXTAREA_ID: string = "team-description-area";
</script>

<div class="pb-4">
  <!-- 
    -- Title 
  -->
  <label for={TEXTAREA_ID} class="text-fs-14 text-secondary-1000 title-text"
    >{DESCRIPTION_CONFIG.TITLE}</label
  >

  <!-- 
    -- Description 
  -->

  <!-- 
    -- Textarea 
  -->
  <Textarea
    id={TEXTAREA_ID}
    bind:value={teamForm.description.value}
    placeholder={DESCRIPTION_CONFIG.PLACEHOLDER}
    defaultBorderColor="transparent"
    hoveredBorderColor="1px solid var(--border-ds-neutral-300)"
    focusedBorderColor="2px solid var(--border-ds-primary-300)"
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 py-2 border-radius-4"
    style="outline:none;"
    disabled={false}
    maxlength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
  />
  <div class="d-flex justify-content-between">
    <div>
      {#if iconComponent}
        {iconComponent}
      {/if}
    </div>
    <div>
      {#if !teamForm?.description?.value?.length}
        <p class="mb-2 text-fs-12 text-secondary-200">
          {DESCRIPTION_CONFIG.DESCRIPTION}
        </p>
      {:else}
        <p class="mb-2 text-fs-12 text-secondary-200">
          {DESCRIPTION_CONFIG.MAX_TEXT_SIZE -
            teamForm?.description?.value?.length <
          0
            ? 0
            : teamForm?.description?.value
                ?.length}/{DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  .title-name {
    color: var(--text-ds-neutral-200);
  }
</style>
