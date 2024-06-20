<script lang="ts">
  import { DiskIcon, EditIcon } from "@library/icons";
  import { onMount } from "svelte";
  let description: string = "";
  let editing = false;
  export let onUpdateRequestDescription;
  export let requestStateDoc;
  let textareaRef: HTMLTextAreaElement | null = null;
  let docValue = "";

  function toggleEditMode() {
    editing = !editing;
    if (editing && textareaRef) {
      focusTextarea();
      setTimeout(() => {
        textareaRef.focus();
      }, 0);
    }
  }
  onMount(() => {
    docValue = requestStateDoc;
    if (textareaRef) {
      textareaRef.addEventListener('input', handleFocus);
    }
  });

  function handleFocus() {
    if (!editing) {
      toggleEditMode();
    }}
  function focusTextarea() {
    if (textareaRef) {
      textareaRef.focus();
    }
  }

  function handleSaveChanges() {
    if (textareaRef) {
      description = textareaRef.value;
      onUpdateRequestDescription(description);
    }
  }
</script>

<div
  class="d-flex flex-column"
  style="height: 234px; gap: 8px; font-size: 14px;"
>
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight: 600;">Documentation</div>
    {#if !editing}
      <div
        class="edit-btn d-flex align-items-center"
        style="gap: 3px; padding-left: 4px; padding-right: 4px; border-radius: 2px; cursor: pointer;"
        on:click={() => {
          toggleEditMode();
          focusTextarea();
        }}
      >
        <div class="mb-1">
          <EditIcon
            height="10.56px"
            width="10.56px"
            color="var(--text-primary-300)"
          />
        </div>
        <p class="edit-txt mb-0" style="font-size: 12px;">Edit</p>
      </div>
    {:else}
      <div
        class="edit-btn d-flex align-items-center"
        style="gap: 3px; padding-left: 4px; padding-right: 4px; border-radius: 2px; cursor: pointer;"
        on:click={() => {handleSaveChanges()
          toggleEditMode();
        } }
      >
        <div class="mb-1">
          <DiskIcon
            height={15}
            width={15}
            color={"var(  --text-primary-300)"}
          />
        </div>
        <p class="edit-txt mb-0" style="font-size: 12px;">Save Changes</p>
      </div>
    {/if}
  </div>
  <div  style="height: 200px;">
    <textarea
      bind:this={textareaRef}
      value={docValue}
      class="text-area h-100  w-100 border-0"
      style="font-weight:400; font-size:12px; background-color:transparent; outline: none; border-radius: 2px; padding-bottom:20px; padding-top: 8px; padding-left: 12px; padding-right: 12px;"
      placeholder="Add Documentation"
    >
  </textarea>
   
  </div>
</div>

<style>
  .edit-btn:hover {
    background-color: var(--selected-active-sidebar);
    color: white !important;
  }
  .edit-btn {
    color: var(--text-primary-300);
  }
  .text-area:focus{
    border: 1px solid var(  --border-primary-300 ) !important;
  }
  .text-area:hover{
    background-color: var(--text-secondary-450) !important;
  }
</style>
