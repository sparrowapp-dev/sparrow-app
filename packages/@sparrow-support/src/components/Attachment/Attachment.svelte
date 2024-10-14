<script lang="ts">
  import { AttachmentIcon } from "@sparrow/library/icons"; // Import your icon

  // Props: inputId and onFileSelect handler are passed in from the parent component
  export let inputId: string; // Parent will pass a unique id
  export let onFileSelect: (files: FileList | null) => void; // Parent will pass a function to handle file selection

  // Function to trigger file input click
  const triggerFileSelect = () => {
    document.getElementById(inputId)?.click();
  };

  // Call the onFileSelect function when files are selected
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    onFileSelect(event);
  };
</script>

<!-- Clickable icon that triggers file selection -->
<div
  class="attachment-icon-container"
  style="cursor: pointer"
  on:click={triggerFileSelect}
>
  <AttachmentIcon height="14px" width="14px" />
</div>

<!-- Hidden file input, using the inputId passed from the parent -->
<input
  class="visually-hidden"
  type="file"
  id={inputId}
  on:change={(e) => {
    handleFileChange(e);
  }}
  multiple
/>

<style lang="scss">
  .visually-hidden {
    display: none; /* Hide the input */
  }
  .attachment-icon-container {
    cursor: pointer;
  }
</style>
