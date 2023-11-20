<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  export let responseHeader;
</script>

<div
  style="height: 400px;overflow:auto;"
  class="d-flex flex-column align-items-center bg-backgroundColor mt-4 w-100"
>
  {#each responseHeader as [key, value]}
    <div
      class="d-flex align-items-center justify-content-center ps-1 gap-2 mb-2"
    >
      <div>
        <input
          type="text"
          placeholder={key}
          style="outline: none;font-size:13px;color:white;"
          class="bg-blackColor text-whiteColor border-0 ps-2 py-1 pe-3"
          readonly
        />
      </div>
      <input
        type="text"
        placeholder={value}
        style="outline: none;font-size:13px;color:white"
        class="bg-blackColor text-red border-0 ps-2 py-1 pe-3"
        readonly
      />
    </div>
  {/each}
</div>

<style>
  input::placeholder {
    color: var(--white-color);
  }
</style>
