<script lang="ts">
  /**
   * Exports
   */
  export let fileType: string = "";
</script>

<span
  class="file-type-btn text-fs-12 d-flex align-items-center justify-content-center border-radius-4 text-secondary-100"
>
  {fileType}
</span>

<style>
  .file-type-btn {
    width: 45px;
    height: 26px;
    border: 1px solid var(--border-tertiary-300);
  }
</style>
