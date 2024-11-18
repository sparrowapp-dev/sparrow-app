<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  export let responseHeader;
</script>

<div
  class="d-flex flex-column align-items-center pt-0 w-100 h-100 response-header"
>
  {#each responseHeader as header}
    <div
      class="d-flex align-items-center justify-content-center ps-0 gap-2 mb-2 w-100"
    >
      <div class="flex-grow-1 w-100">
        <input
          type="text"
          placeholder={header.key}
          class="bg-secondary-700 px-2 py-1 border-0 w-100 border-radius-2"
          style="font-size: 13px;"
          readonly
          disabled
        />
      </div>
      <div class="flex-grow-1 w-100">
        <input
          type="text"
          placeholder={header.value}
          class="bg-secondary-700 px-2 py-1 border-0 w-100 border-radius-2"
          style="font-size: 13px;"
          readonly
          disabled
        />
      </div>
    </div>
  {/each}
</div>

<style>
  input::placeholder {
    color: var(--white-color);
  }
</style>
