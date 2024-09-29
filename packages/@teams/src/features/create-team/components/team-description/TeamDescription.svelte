<script lang="ts">
  /**
   * Components
   */
  import { Textarea } from "@sparrow/library/forms";

  /**
   * Types
   */
  import type { TeamForm } from "../../types";

  /**
   * Constants
   */
  import { DESCRIPTION_CONFIG } from "../../constants";

  /**
   * Exports
   */
  export let teamForm: TeamForm;

  /**
   * Data
   */
  const TEXTAREA_ID: string = "team-description-area";
</script>

<div class="pb-4">
  <!-- 
    -- Title 
  -->
  <label for={TEXTAREA_ID} class="text-fs-14 text-secondary-1000"
    >{DESCRIPTION_CONFIG.TITLE}</label
  >

  <!-- 
    -- Description 
  -->
  {#if !teamForm?.description?.value?.length}
    <p class="mb-2 text-fs-12 text-secondary-200">
      {DESCRIPTION_CONFIG.DESCRIPTION}
    </p>
  {:else}
    <p class="mb-2 text-fs-12 text-secondary-200">
      {DESCRIPTION_CONFIG.MAX_TEXT_SIZE - teamForm?.description?.value?.length <
      0
        ? 0
        : DESCRIPTION_CONFIG.MAX_TEXT_SIZE -
          teamForm?.description?.value?.length} characters left
    </p>
  {/if}

  <!-- 
    -- Textarea 
  -->
  <Textarea
    id={TEXTAREA_ID}
    bind:value={teamForm.description.value}
    placeholder={DESCRIPTION_CONFIG.PLACEHOLDER}
    height={"77px"}
    defaultBorderColor="transparent"
    hoveredBorderColor="transparent"
    focusedBorderColor={"transparent"}
    class="text-fs-14 bg-tertiary-300 fw-normal px-2 py-2 border-radius-4"
    style="outline:none;"
    disabled={false}
    maxlength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
    placeholderColor={"var(--text-secondary-200)"}
  />
</div>
