<script lang="ts">
  /**
   * Components
   */
  import { LabelField, Textarea } from "@sparrow/library/forms";

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
    -- Textarea with Labels 
  -->
<<<<<<< HEAD
  <LabelField
    inputLabelId={TEXTAREA_ID}
    headerLabelText={DESCRIPTION_CONFIG.TITLE}
    supportLabelText={DESCRIPTION_CONFIG.DESCRIPTION}
    type="textarea"
    maxTextLength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
    currentTextLength={teamForm?.description?.value?.length}
    helpLabel={true}
  >
    <Textarea
      id={TEXTAREA_ID}
      bind:value={teamForm.description.value}
      placeholder={DESCRIPTION_CONFIG.PLACEHOLDER}
      variant={"primary"}
      class="text-fs-14 bg-tertiary-300 fw-normal px-2 py-2 border-radius-4"
      style="outline:none;"
      disabled={false}
      maxlength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
    />
  </LabelField>
=======
  <label for={TEXTAREA_ID} class="text-fs-14 text-secondary-1000"
    ><span style="color: var(--text-ds-neutral-200);"
      >{DESCRIPTION_CONFIG.TITLE}</span
    ></label
  >

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
  <!-- 
    -- Description 
  -->
  {#if !teamForm?.description?.value?.length}
    <p style="padding-top:4px" class="mb-2 text-fs-12 text-secondary-200">
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
>>>>>>> development
</div>
