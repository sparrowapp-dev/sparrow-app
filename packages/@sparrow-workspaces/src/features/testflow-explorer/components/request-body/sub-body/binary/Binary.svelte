<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { attachFileIcon as AttachIcon } from "@sparrow/library/assets";
  import { closeIcon as CloseIcon } from "@sparrow/library/assets";
  let fileName = "";

  const extractFileName = (url) => {
    const parts = url.split("\\");
    const file = parts[parts.length - 1];
    return file;
  };

  const uploadFormFile = async () => {
    const filePathResponse = await invoke("fetch_file_command");
    if (filePathResponse !== "Canceled") {
      fileName = extractFileName(filePathResponse);
    }
  };
</script>

<div class="pb-1" style="margin-top:4px;">
  <div class="file-section">
    <img src={AttachIcon} alt="" />
    <input
      type="text"
      class="form-control file-input"
      readonly
      placeholder="Select a file or drag and drop here"
      on:click={() => uploadFormFile()}
    />
  </div>
  {#if fileName.length > 0}
    <div class="file-details">
      <img src={AttachIcon} alt="" style="width: 24px; height: 24px" />
      <p class="ellipsis" style="font-size: 10px;">{fileName}</p>
      <img
        src={CloseIcon}
        style="width: 20px; height: 20px"
        on:click={() => (fileName = "")}
      />
    </div>
  {/if}
</div>

<style>
  .file-section {
    border: 1px solid #22232e;
    border-radius: 4px;
    width: 500px;
    height: 48px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    gap: 10px;
  }
  .file-input {
    border: 0px;
    min-width: 300px;
    cursor: pointer;
    background-color: transparent;
    border-radius: 0;
  }
  input[type="text"]::placeholder {
    color: #3a3a49;
    font-size: 14px;
  }
  .file-details {
    display: flex;
    flex-direction: row;
    width: 125px;
    height: 26px;
    background: #22232e;
    border-radius: 4px;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }
</style>
