<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  export let responseHeader;
</script>

<div
  style="height: 400px;overflow:auto;"
  class="d-flex flex-column align-items-center bg-backgroundColor mt-4 w-100 pe-2"
>
  {#each responseHeader as [key, value]}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2 w-100"
    >
      <div class="flex-grow-1 w-100">
        <input
          type="text"
          placeholder={key}
          class="form-control bg-keyValuePairColor py-1 border-0"
          style="font-size: 13px;"
          readonly
        />
      </div>
      <div class="flex-grow-1 w-100">
        <input
          type="text"
          placeholder={value}
          class="form-control bg-keyValuePairColor py-1 border-0"
          style="font-size: 13px;"
          readonly
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
