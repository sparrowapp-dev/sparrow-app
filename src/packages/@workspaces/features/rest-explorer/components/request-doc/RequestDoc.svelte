<script lang="ts">
  import { DiskIcon, EditIcon } from "@library/icons";
  // Import any necessary dependencies or components if needed

  let editing = false; // State to track if in edit mode

  let textareaRef: HTMLTextAreaElement | null = null;

  function toggleEditMode() {
    editing = !editing; // Toggle the editing state

    if (!editing && textareaRef) {
      // Logic to handle save functionality if needed
      // For example, you can save the content of the textarea
      console.log("Save changes:", textareaRef.value);
    }
  }

  function focusTextarea() {
    if (textareaRef) {
      textareaRef.focus();
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
        on:click= {()=> {focusTextarea()
          toggleEditMode()
        }}
      >
        <div class="mb-1">
          <EditIcon height="10.56px" width="10.56px" color="#3670F7" />
        </div>
        <p class="edit-txt mb-0" style="font-size: 12px;">Edit</p>
      </div>
    {:else}
      <div
        class="edit-btn d-flex align-items-center"
        style="gap: 3px; padding-left: 4px; padding-right: 4px; border-radius: 2px; cursor: pointer;"
        on:click={toggleEditMode}
      >
        <div class="mb-1">  <DiskIcon height={15} width={15} color={"#3670f7"}/>  </div>
        <p class="edit-txt mb-0" style="font-size: 12px;">Save Changes</p>
      </div>
    {/if}
  </div>
  <div style="height: 200px;">
    <textarea
      bind:this={textareaRef}
      class="h-100 w-100 border-0"
      style="background-color: #191919; outline: none; border-radius: 2px; padding-top: 8px; padding-left: 12px;"
      placeholder="Add Documentation"
    ></textarea>
  </div>
</div>

<style>
  .edit-btn:hover {
    background-color: #11253a;
    color: white !important;
  }

  .edit-txt {
    color: #3670f7;
  }
</style>
