<script lang="ts">
  import {
    DismissCircleFilled,
    DocumentTextRegular,
    ArrowDownloadRegular,
  } from "@sparrow/library/icons";

  export let file: {
    id: string;
    name: string;
    type: string;
    size?: number;
    isUploading?: boolean;
    url?: string;
    fileId: string;
  };
  export let onRemove: (fileId: string) => void;
  export let onDownload: (file: any) => void;
  export let size: "small" | "medium" | "large" = "small";
  export let isReadOnly: boolean = true;

  const handleFileClick = () => {
    if (!file.isUploading && file.url) {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = file.url;
      link.download = `${file.name}.${file.type}`;
      link.setAttribute("target", "_blank"); // Opens the linked document in a new window or tab
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDisplayName = () => {
    const extension = file.type || "pdf";
    const baseName = file.name;
    return { baseName, extension };
  };

  const getFileExtension = () => {
    return file.type || "pdf";
  };
</script>

<div
  class="file-chip"
  class:uploading={file.isUploading}
  class:readonly={isReadOnly}
>
  <div
    class="file-content"
    on:click={handleFileClick}
    on:keydown={(e) => e.key === "Enter" && handleFileClick()}
  >
    <div class="file-icon" class:clickable={!file.isUploading && file.url}>
      {#if file.isUploading}
        <!-- Loading spinner -->
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      {:else if file.url}
        <!-- Download icon overlay on hover -->
        <div class="icon-container">
          <DocumentTextRegular size="16px" />
          <div class="download-overlay">
            <ArrowDownloadRegular size="14px" />
          </div>
        </div>
      {:else}
        <DocumentTextRegular size="16px" />
      {/if}
    </div>
    <div class="file-info">
      <div
        class="file-name text-ds-font-size-14 text-ds-font-weight-semi-bold text-ds-line-height-143"
        title={`${getDisplayName().baseName}.${getDisplayName().extension}`}
      >
        <span class="file-basename">{getDisplayName().baseName}</span><span
          class="file-extension">.{getDisplayName().extension}</span
        >
      </div>
      <!-- <span
        class="file-name text-ds-font-size-14 text-ds-font-weight-semi-bold text-ds-line-height-143 text-truncate"
        title={`${file.name}.${getFileExtension()}`}
      >
        {`${file.name}.${getFileExtension()}`}
      </span> -->
      {#if file.size}
        <span
          class="file-size text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-150"
        >
          {`${file.size}MB`}
          {#if file.isUploading}
            <span class="uploading-text">Uploading...</span>
          {/if}
        </span>
      {/if}
    </div>
  </div>

  {#if !isReadOnly}
    <button
      class="remove-btn"
      on:click|stopPropagation={() => onRemove(file.id)}
    >
      <DismissCircleFilled size="14px" />
    </button>
  {/if}
</div>

<style>
  .file-chip {
    position: relative;
    display: flex;
    align-items: center;
    background: linear-gradient(
      135deg,
      rgba(65, 72, 88, 0.12) 0%,
      rgba(65, 72, 88, 0.06) 100%
    );
    border: 1px solid var(--border-ds-surface-50);
    border-radius: 4px;
    padding: 8px;
    width: 200px;
    font-family: "Inter", sans-serif;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .file-chip:hover {
    box-shadow: 0 2px 8px var(--border-ds-surface-200);
  }

  .file-chip.uploading {
    opacity: 0.7;
    pointer-events: none;
  }

  .file-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow: hidden;
  }

  .file-content.clickable {
    cursor: pointer;
  }

  .file-icon {
    background-color: var(--bg-ds-accent-400);
    border-radius: 6px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s ease;
  }

  .file-icon.clickable:hover {
    background-color: var(--bg-ds-accent-500);
  }

  .icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .download-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.2s ease;
    color: white;
  }

  .file-icon.clickable:hover .download-overlay {
    opacity: 1;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    position: relative;
  }

  .spinner {
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .file-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .file-name {
    font-family: Inter, sans-serif;
    color: var(--text-ds-primary);
    white-space: nowrap;
    overflow: hidden;
    display: flex;
  }

  .file-chip.readonly {
    /* width: auto;
    max-width: 120px;
    min-width: 100px;
    margin: 2px;
    flex: 0 0 auto; */
  }

  .file-basename {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .file-extension {
    flex-shrink: 0;
  }

  .file-size {
    color: var(--text-ds-neutral-200);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .uploading-text {
    /* color: var(--text-ds-accent-400); */
    color: "#22630";
    font-size: 10px;
  }

  .remove-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    background: transparent;
    border: none;
    padding: 2px;
    cursor: pointer;
    transition: transform 0.2s ease;
    z-index: 1;
  }

  .remove-btn:hover {
    transform: scale(1.1);
  }
</style>
