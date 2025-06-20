<script lang="ts">
  import { Events } from "@sparrow/common/enums";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    BotSparkleFilled,
    SendRegular,
    StopFilled,
    AttachRegular,
  } from "@sparrow/library/icons";
  import { Button, Tooltip } from "@sparrow/library/ui";
  import { FileItem } from "../../..";
  import { notifications } from "@sparrow/library/ui";
  import { v4 as uuidv4 } from "uuid";

  export let placeholder = "";
  export let sendPrompt;
  export let prompt: string = "";
  export let onUpdateAiPrompt;
  export let isResponseGenerating;
  export let onStopGeneratingAIResponse;
  export let activateGeneratePromptModal;
  export let isGuestUser;
  export let onRemoveFile;
  export let onFileUpload; // Callback to handle cloud upload

  export let uploadedFiles: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    isUploading?: boolean;
    cloudUrl?: string;
  }> = [
    {
      id: "123",
      name: "DIV Contentsdddddddd.pdf",
      type: "csv",
      size: 1.34,
      isUploading: false,
      cloudUrl: "www.google.com",
    },
    {
      id: "124",
      name: "first file",
      type: "csv",
      size: 1.34,
      isUploading: false,
      cloudUrl: "www.google.com",
    },
    {
      id: "125",
      name: "first file",
      type: "csv",
      size: 1.34,
      isUploading: true,
      cloudUrl: "www.google.com",
    },
  ];

  $: {
    if (uploadedFiles.length) console.log(uploadedFiles);
  }

  // File restrictions
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_EXTENSIONS = ["pdf", "txt", "docx", "csv"];
  const MAX_FILES = 5;
  let fileInput: HTMLInputElement;

  function adjustTextareaHeight() {
    const textAreaInput = document.getElementById("input-prompt-text");
    if (!textAreaInput) return;
    textAreaInput.style.height = "20px"; // Reset to initial height
    textAreaInput.style.height = textAreaInput.scrollHeight + "px"; // Expand based on content
  }

  let isPromptBoxFocused = false;
  let isTyping = false;

  const hanldeStartGenerating = async () => {
    // allows the DOM to update first before resetting the height.
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);

    if (prompt) {
      sendPrompt(prompt);
      onUpdateAiPrompt("");
      MixpanelEvent(Events.AI_Initiate_Response);
    }
  };

  // File Upload
  const handleAttachClick = () => {
    if (uploadedFiles.length >= MAX_FILES) {
      notifications.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    fileInput?.click();
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file count limit
      if (uploadedFiles.length >= MAX_FILES) {
        notifications.error(`Maximum ${MAX_FILES} files allowed`);
        break;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        notifications.error(`File "${file.name}" exceeds 5MB limit`);
        continue;
      }

      // Check file extension
      const extension = getFileExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        notifications.error(
          `File "${file.name}" has unsupported format. Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed.`,
        );
        continue;
      }

      // Create file object with loading state
      const fileObj = {
        id: uuidv4(),
        name: file.name.split(".").slice(0, -1).join("."), // Remove extension from display name
        type: extension,
        size: parseFloat((file.size / (1024 * 1024)).toFixed(2)), // Convert to MB
        isUploading: true,
        cloudUrl: undefined,
      };

      // Add to files array immediately to show in UI
      uploadedFiles = [...uploadedFiles, fileObj];

      try {
        // Upload to cloud storage
        const cloudUrl = await onFileUpload?.(file, fileObj.id);
        console.log("cl ddd :>> ", cloudUrl);
        // Update file object with cloud URL and remove loading state
        uploadedFiles = uploadedFiles.map((f) =>
          f.id === fileObj.id ? { ...f, isUploading: false, cloudUrl } : f,
        );

        notifications.success(`File "${file.name}" uploaded successfully`);
      } catch (error) {
        console.error("File upload failed:", error);

        // Remove file from array if upload failed
        uploadedFiles = uploadedFiles.filter((f) => f.id !== fileObj.id);
        notifications.error(
          `Failed to upload "${file.name}". Please try again.`,
        );
      }
    }

    // Clear the input
    target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
    onRemoveFile?.(fileId);
  };

  const handleFileDownload = (file: any) => {
    if (file.cloudUrl && !file.isUploading) {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = file.cloudUrl;
      link.download = `${file.name}.${file.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
</script>

<div
  class="prompt-input-container d-flex flex-column gap-3 {isPromptBoxFocused
    ? 'focused'
    : ''} {isTyping ? 'typing' : ''}"
>
  <div class="textarea-wrapper">
    <!-- File Chips Display -->
    {#if uploadedFiles.length > 0}
      <div class="file-chips-container d-flex flex-wrap gap-2 mb-2">
        {#each uploadedFiles as file (file.id)}
          <FileItem
            {file}
            onRemove={handleRemoveFile}
            onDownload={handleFileDownload}
            size="small"
          />
        {/each}
      </div>
    {/if}

    <!-- Textarea Input -->
    <textarea
      bind:value={prompt}
      on:input={() => {
        isTyping = true;
        onUpdateAiPrompt(prompt);
        adjustTextareaHeight(event.target);
      }}
      disabled={isResponseGenerating ? true : false}
      required
      id={"input-prompt-text"}
      {placeholder}
      class="w-100 prompt-text-field-area"
      style="border:1px solid grey; outline: none; background-color: var(--bg-ds-surface-400); border: 1px solid var(--border-tertiary-190); "
      autocomplete="off"
      spellcheck="false"
      autocorrect="off"
      autocapitalize="off"
      maxlength={10000}
      on:keydown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!isResponseGenerating && prompt.trim()) {
            sendPrompt(prompt);
            onUpdateAiPrompt("");
            isTyping = false;
            isPromptBoxFocused = false;
            event.target.blur();

            // allows the DOM to update first before resetting the height.
            setTimeout(() => {
              adjustTextareaHeight();
            }, 0);
          }
        }
      }}
      on:focus={() => {
        isPromptBoxFocused = true;
        isTyping = false;
      }}
      on:blur={() => {
        isPromptBoxFocused = false;
        isTyping = false;
      }}
    />
  </div>

  <!-- Action Btn Section -->
  <div
    class="actions-container d-flex justify-content-between align-items-center"
  >
    <!-- {#if !isGuestUser} -->
    <div id="generate-prompt-chip">
      <!-- <Tooltip title={"Generate user prompt"} placement={"top-center"}> -->
      <button
        on:click={() => {
          activateGeneratePromptModal("UserPrompt");
        }}
        disabled={isGuestUser}
        class="generate-prompt-btn d-flex align-items-center gap-1 px-2 py-1 rounded-1"
      >
        <BotSparkleFilled size={"15px"} color="#4387f4" />
        <span class="text-ds-font-size-12 fw-medium">Generate Prompt</span>
      </button>
      <!-- </Tooltip> -->
    </div>
    <!-- {/if} -->

    <!-- Hidden file input -->
    <input
      type="file"
      bind:this={fileInput}
      on:change={handleFileSelect}
      multiple
      accept=".pdf,.txt,.docx,.csv"
      style="display: none;"
    />
    <div class="d-flex">
      <Tooltip
        title={"Attach File:"}
        subtext={"You can upload up to 5 files (max 5 MB each) in .pdf, .txt, .docx, or .csv format."}
        placement={"top-right"}
        size={"medium"}
        styleProp={"width: 220px;"}
      >
        <Button
          type={"teritiary-regular"}
          size={"small"}
          startIcon={AttachRegular}
          onClick={handleAttachClick}
          disable={uploadedFiles.length >= MAX_FILES}
        />
      </Tooltip>

      <Tooltip
        title={isResponseGenerating ? "Stop" : "Send"}
        placement={"top-center"}
        size={"small"}
      >
        <Button
          textStyleProp={"font-size: var(--base-text)"}
          type={"outline-primary"}
          size={"small"}
          startIcon={isResponseGenerating ? StopFilled : SendRegular}
          onClick={() => {
            if (isResponseGenerating) {
              onStopGeneratingAIResponse();
              return;
            }
            if (!isResponseGenerating && prompt.trim()) {
              hanldeStartGenerating();
              return;
            }
          }}
        ></Button>
      </Tooltip>
    </div>
  </div>
</div>

<style>
  .textarea-wrapper {
    position: relative;
    width: 100%;
  }

  .file-chips-container {
    margin-bottom: 4px;
  }

  .prompt-input-container {
    background-color: var(--bg-ds-surface-400) !important;
    border-radius: 4px;
    padding: 8px;
  }

  .prompt-input-container:hover {
    outline: 1px solid var(--border-ds-neutral-300);
  }

  .prompt-input-container.focused {
    outline: 2px solid var(--border-ds-primary-300);
  }

  .prompt-input-container.typing {
    outline: 1px solid var(--border-ds-primary-300);
  }

  .prompt-text-field-area {
    width: 100%;
    height: 20px;
    max-height: 100px !important;
    font-family: "inter", sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.45; /* 145% */
    letter-spacing: 0;
    border: none !important;
    outline: none;
    caret-color: var(--border-ds-primary-300);
  }

  textarea::-webkit-scrollbar-thumb {
    background-color: var(--bg-ds-surface-100);
    border-radius: 8px;
  }

  /* pointer to default when hovering scrollbar */
  textarea::-webkit-scrollbar,
  textarea::-webkit-scrollbar-thumb,
  textarea::-webkit-scrollbar-button {
    cursor: default;
  }

  .actionBtn-outline {
    border-radius: 4px;
    border: 2px solid var(--border-ds-surface-50);
    padding: 4px;
  }

  .generate-prompt-btn {
    font-family: Inter, sans-serif;
    background-color: var(--bg-ds-surface-400);
    color: var(--sparrow-white);
    border: 1px solid var(--bg-ds-surface-100);
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease; /* Smooth hover */
  }

  .generate-prompt-btn:hover {
    background-color: var(--bg-ds-surface-700);
    border: 1px solid var(--border-ds-primary-400);
    box-shadow: 0 0 4px 1px rgba(17, 173, 240, 0.3); /* shadow-glow effect */
  }
</style>
