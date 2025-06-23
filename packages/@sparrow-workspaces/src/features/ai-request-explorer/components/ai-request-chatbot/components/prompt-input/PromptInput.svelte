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
  import type { PromptFileAttachment } from "@sparrow/common/types/workspace/ai-request-base";

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

  export let uploadedFiles: PromptFileAttachment[] = [
    // {
    //   id: "123",
    //   name: "DIV Contentsdddddddd.pdf",
    //   type: "csv",
    //   size: 1.34,
    //   isUploading: false,
    //   url: "www.google.com",
    // },
  ];

  $: {
    if (uploadedFiles.length) console.log(uploadedFiles);
  }

  // File restrictions
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_EXTENSIONS = ["pdf", "txt", "docx", "csv"];
  const MAX_FILES = 5;
  let fileInput: HTMLInputElement;

  let isPromptBoxFocused = false;
  let isTyping = false;

  function adjustTextareaHeight() {
    const textAreaInput = document.getElementById("input-prompt-text");
    if (!textAreaInput) return;
    textAreaInput.style.height = "20px"; // Reset to initial height
    textAreaInput.style.height = textAreaInput.scrollHeight + "px"; // Expand based on content
  }

  const hanldeStartGenerating = async () => {
    // allows the DOM to update first before resetting the height.
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);

    if (prompt) {
      await sendPrompt(prompt, uploadedFiles);
      await onUpdateAiPrompt("");
      uploadedFiles.length = 0;
      MixpanelEvent(Events.AI_Initiate_Response);
    }
  };

  // File Upload
  const handleAttachClick = () => {
    if (uploadedFiles.length >= MAX_FILES) {
      notifications.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    fileInput.click();
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  /**
   * Validates a single file against size and extension restrictions
   */
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File "${file.name}" exceeds 5MB limit`,
      };
    }

    // Check file extension
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `File "${file.name}" has unsupported format. Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed.`,
      };
    }

    return { isValid: true };
  };

  /**
   * Updates the upload status of multiple files
   */
  const updateFilesUploadStatus = (
    fileIds: string[],
    uploadResults: Array<{ fileUrl: string; fileId: string }>,
    isSuccess: boolean = true,
  ) => {
    uploadedFiles = uploadedFiles
      .map((file) => {
        const fileIndex = fileIds.indexOf(file.id);
        if (fileIndex !== -1) {
          if (isSuccess && uploadResults[fileIndex]) {
            return {
              ...file,
              isUploading: false,
              url: uploadResults[fileIndex].fileUrl,
              fileId: uploadResults[fileIndex].fileId,
            };
          } else if (!isSuccess) {
            return null; // Remove failed files from the array
          }
        }
        return file;
      })
      .filter(Boolean); // Remove null values (failed uploads)
  };

  /**
   * Creates a file object for UI display
   */
  const createFileObject = (file: File) => ({
    id: uuidv4(),
    name: file.name.split(".").slice(0, -1).join("."), // Remove extension from display name
    type: getFileExtension(file.name),
    size: parseFloat((file.size / (1024 * 1024)).toFixed(2)), // Convert to MB
    isUploading: true,
    url: undefined,
    fileId: "",
  });

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    const validFiles: { file: File; fileObj: any }[] = [];
    const errors: string[] = [];

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file count limit
      if (uploadedFiles.length + validFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        break;
      }

      const validation = validateFile(file);
      if (!validation.isValid) {
        errors.push(validation.error!);
        continue;
      }

      const fileObj = createFileObject(file);
      validFiles.push({ file, fileObj });
    }
    errors.forEach((error) => notifications.error(error)); // To show validation errors

    // If no valid files, return early
    if (validFiles.length === 0) {
      target.value = "";
      return;
    }

    // Add all valid files to the UI immediately with loading state
    const newFileObjects = validFiles.map((validFile) => validFile.fileObj);
    uploadedFiles = [...uploadedFiles, ...newFileObjects];

    try {
      // Extract just the File objects for upload
      const filesToUpload = validFiles.map((validFile) => validFile.file);
      const fileIds = validFiles.map((validFile) => validFile.fileObj.id);

      console.log(`Starting upload for ${filesToUpload.length} files...`);
      const uploadResults = await onFileUpload(filesToUpload); // Upload ALL files at once
      console.log("Upload completed:", uploadResults);
      updateFilesUploadStatus(fileIds, uploadResults, true); // Update all files' status to success

      // if (filesToUpload.length === 1) {
      //   notifications.success(
      //     `File "${filesToUpload[0].name}" uploaded successfully!`,
      //   );
      // } else {
      //   notifications.success(
      //     `All ${filesToUpload.length} files uploaded successfully!`,
      //   );
      // }
    } catch (error) {
      console.error("Batch file upload failed:", error);
      const fileIds = validFiles.map((validFile) => validFile.fileObj.id); // Remove all failed files from UI
      updateFilesUploadStatus(fileIds, [], false);

      // Show error notification
      if (validFiles.length === 1) {
        notifications.error(
          `Failed to upload "${validFiles[0].file.name}". Please try again.`,
        );
      } else {
        notifications.error(
          `Failed to upload ${validFiles.length} files. Please try again.`,
        );
      }
    }
    target.value = ""; // Clear the input
  };

  // old
  // const handleFileSelect = async (event: Event) => {
  //   const target = event.target as HTMLInputElement;
  //   const files = target.files;

  //   if (!files || files.length === 0) return;
  //   const validFiles: { file: File; fileObj: any }[] = []; // Validate all files first and create file objects

  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];

  //     // Check file count limit
  //     if (uploadedFiles.length + validFiles.length >= MAX_FILES) {
  //       notifications.error(`Maximum ${MAX_FILES} files allowed`);
  //       break;
  //     }

  //     // Check file size
  //     if (file.size > MAX_FILE_SIZE) {
  //       notifications.error(`File "${file.name}" exceeds 5MB limit`);
  //       continue;
  //     }

  //     // Check file extension
  //     const extension = getFileExtension(file.name);
  //     if (!ALLOWED_EXTENSIONS.includes(extension)) {
  //       notifications.error(
  //         `File "${file.name}" has unsupported format. Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed.`,
  //       );
  //       continue;
  //     }

  //     const fileObj = {
  //       id: uuidv4(),
  //       name: file.name.split(".").slice(0, -1).join("."), // Remove extension from display name
  //       type: extension,
  //       size: parseFloat((file.size / (1024 * 1024)).toFixed(2)), // Convert to MB
  //       isUploading: true,
  //       url: undefined,
  //     };
  //     validFiles.push({ file, fileObj });
  //   }

  //   // Add all valid files to the UI immediately
  //   if (validFiles.length > 0) {
  //     uploadedFiles = [
  //       ...uploadedFiles,
  //       ...validFiles.map((validFile) => validFile.fileObj),
  //     ];
  //   }

  //   // Upload all files in parallel
  //   const uploadPromises = validFiles.map(async ({ file, fileObj }) => {
  //     try {
  //       const uploadedFileData = await onFileUpload([file]); // Upload to cloud storage
  //       console.log("kkkkk:>> ", uploadedFileData);
  //       uploadedFiles = uploadedFiles.map((file) =>
  //         file.id === fileObj.id
  //           ? {
  //               ...file,
  //               isUploading: false,
  //               url: uploadedFileData[0].fileUrl,
  //               fileId: uploadedFileData[0].fileId,
  //             }
  //           : file,
  //       );
  //       // notifications.success(`File "${file.name}" uploaded successfully`);
  //       return { success: true, fileId: fileObj.id, fileName: file.name };
  //     } catch (error) {
  //       console.error("File upload failed:", error);
  //       uploadedFiles = uploadedFiles.filter((file) => file.id !== fileObj.id); // Remove file from array if upload failed
  //       // notifications.error(
  //       //   `Failed to upload "${file.name}". Please try again.`,
  //       // );
  //       return { success: false, fileId: fileObj.id, fileName: file.name };
  //     }
  //   });

  //   // Wait for all uploads to complete (optional - you can remove this if you don't need to track completion)
  //   try {
  //     const results = await Promise.allSettled(uploadPromises);
  //     const successCount = results.filter(
  //       (result) => result.status === "fulfilled" && result.value.success,
  //     ).length;
  //     const failureCount = results.length - successCount;

  //     // Simplified notification logic
  //     if (failureCount === 0) {
  //       notifications.success(
  //         `All ${successCount} files uploaded successfully!`,
  //       );
  //     } else if (successCount === 0) {
  //       notifications.error(`All ${failureCount} files failed to upload.`);
  //     } else {
  //       notifications.warning(
  //         `${successCount} uploaded, ${failureCount} failed`,
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error in parallel upload:", error);
  //   }

  //   target.value = ""; // Clear the input
  // };

  const handleRemoveFile = (fileId: string) => {
    // uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
    // onRemoveFile(fileId);

    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);

    // Call the parent component's remove handler with the actual fileId
    if (fileToRemove?.fileId) {
      onRemoveFile(fileToRemove.fileId);
    }
  };

  // Move this download fun. to fileItem component itself
  const handleFileDownload = (file: any) => {
    if (file.url && !file.isUploading) {
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

  $: isAnyFileUploading = uploadedFiles.some((file) => file.isUploading);
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
            size={"small"}
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
      title=""
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
      on:keydown={async (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!isResponseGenerating && prompt.trim()) {
            await sendPrompt(prompt, uploadedFiles);
            await onUpdateAiPrompt("");
            uploadedFiles.length = 0;
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
          disable={isAnyFileUploading}
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
