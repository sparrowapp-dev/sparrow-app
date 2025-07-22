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
  import {
    ModelIdNameMapping,
    ModelVariantIdNameMapping,
    type AiModelProviderEnum,
    type AIModelVariant,
    type PromptFileAttachment,
  } from "@sparrow/common/types/workspace/ai-request-base";
  import {
    getFileRestrictions,
    isFileUploadSupported,
  } from "../../../../constants";
  import CodeMirrorInput from "../../../../../../components/codemirror-input/CodeMirrorInput.svelte";
  import { UserPromptTheme } from "../../../../../../utils";

  export let placeholder = "";
  export let sendPrompt;
  export let prompt: string = "";
  export let onUpdateAiPrompt;
  export let isResponseGenerating;
  export let onStopGeneratingAIResponse;
  export let activateGeneratePromptModal;
  export let isGuestUser;
  export let onFileUpload; // Callback to handle cloud upload
  export let currentProvider: AiModelProviderEnum;
  export let currentModel: AIModelVariant;
  export let filesToUpload: PromptFileAttachment[] = [];
  export let disabled: boolean = false;

  const theme = new UserPromptTheme().build();
  export let environmentVariables;

  export let onUpdateEnvironment;

  // Props

  // File restrictions Props - Dynamic file restrictions based on provider and model
  $: fileRestrictions = getFileRestrictions(currentProvider, currentModel);
  $: isUploadSupported = isFileUploadSupported(currentProvider, currentModel);
  $: MAX_FILE_SIZE = fileRestrictions?.maxFileSize || 5 * 1024 * 1024;
  $: ALLOWED_EXTENSIONS = fileRestrictions?.supportedExtensions || [];
  $: MAX_FILES = fileRestrictions?.maxFiles || 5;
  $: acceptAttribute = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(","); // Generates accept attribute for file input

  // Prompt box state management props
  let isTyping = false;
  let isUploadingFiles = false;
  let isPromptBoxFocused = false;
  let fileInput: HTMLInputElement;

  // Methods
  function adjustTextareaHeight() {
    const textAreaInput = document.getElementById("input-prompt-text");
    if (!textAreaInput) return;
    textAreaInput.style.height = "20px"; // Reset to initial height
    textAreaInput.style.height = textAreaInput.scrollHeight + "px"; // Expand based on content
  }

  // function setEnvironmentVariables(text: string, environmentVariables) {
  //   let updatedText = text;

  //   if (!Array.isArray(environmentVariables)) {
  //     console.warn("Invalid environmentVariables:", environmentVariables);
  //     return text; // return original text if not valid
  //   }

  //   environmentVariables.forEach((element) => {
  //     const regex = new RegExp(`{{${element.key}}}`, "g");
  //     updatedText = updatedText.replace(regex, element.value);
  //   });

  //   return updatedText;
  // }

  const hanldeStartGenerating = async () => {
    if (!prompt.trim()) return;

    try {
      const uploadedFiles = await handleUploadFiles(); // Upload files if any
      setTimeout(adjustTextareaHeight, 0); // waiting for the DOM to update.
      await sendPrompt(prompt, uploadedFiles);
      await onUpdateAiPrompt("");
      filesToUpload = [];
      MixpanelEvent(Events.AI_Initiate_Response);
    } catch (error) {
      console.error("Error in generating response:", error);
    }
  };

  //////////////////////////////////////////////////////////////////////////////
  //                        File Upload Methods - start
  //////////////////////////////////////////////////////////////////////////////
  const handleAttachClick = () => {
    // if (uploadedFiles.length >= MAX_FILES) {
    if (filesToUpload.length >= MAX_FILES) {
      notifications.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    fileInput.click();
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  // Function to Validate a single file against size and extension restrictions
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

  // Function to create a file object for UI display
  const createFileObject = (file: File) => ({
    id: uuidv4(),
    name: file.name.split(".").slice(0, -1).join("."), // Remove extension from display name
    type: getFileExtension(file.name),
    size: parseFloat((file.size / (1024 * 1024)).toFixed(2)), // Convert to MB
    isUploading: false,
    url: undefined,
    fileId: "",
    fileObject: file,
  });

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    const validFileObjects: any[] = [];
    const errors: string[] = [];

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file count limit
      if (filesToUpload.length + validFileObjects.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        break;
      }

      const validation = validateFile(file);
      if (!validation.isValid) {
        errors.push(validation.error!);
        continue;
      }

      const fileObj = createFileObject(file);
      validFileObjects.push(fileObj);
    }

    errors.forEach((error) => notifications.error(error));

    // If no valid files, return early
    if (validFileObjects.length === 0) {
      target.value = "";
      return;
    }

    // Add files to filesToUpload array
    filesToUpload = [...filesToUpload, ...validFileObjects];

    target.value = ""; // Clear the input
  };

  const handleUploadFiles = async () => {
    if (filesToUpload.length === 0) return filesToUpload;

    try {
      isUploadingFiles = true;
      filesToUpload = filesToUpload.map((file) => ({
        ...file,
        isUploading: true,
      }));

      // Extract File objects from filesToUpload for upload
      const fileObjects = filesToUpload.map((file) => file.fileObject);
      const uploadResults = await onFileUpload(fileObjects);

      // Update file objects with upload results
      const updatedFiles = filesToUpload.map((file, index) => ({
        ...file,
        isUploading: false,
        url: uploadResults[index].fileUrl,
        fileId: uploadResults[index].fileId,
      }));

      filesToUpload = updatedFiles;
      return updatedFiles;
    } catch (error) {
      console.error("File upload failed:", error);

      // Reset uploading state on failure
      filesToUpload = filesToUpload.map((file) => ({
        ...file,
        isUploading: false,
      }));

      if (error.includes("API key missing")) {
        notifications.error(error);
      } else {
        notifications.error("Failed to upload files. Please try again.");
      }
      throw error;
    } finally {
      isUploadingFiles = false;
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = filesToUpload.find((f) => f.id === fileId);
    filesToUpload = filesToUpload.filter((f) => f.id !== fileId);

    // Call the parent component's remove handler with the actual fileId
    // if (fileToRemove?.fileId) {
    //   onRemoveFile(fileToRemove.fileId);
    // }
  };

  // Dynamic tooltip text based on current file upload restrictions
  $: fileUploadTooltip = isUploadSupported
    ? `You can upload up to ${MAX_FILES} files (max ${MAX_FILE_SIZE / (1024 * 1024)}MB each) in ${ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(", ")} format.`
    : `File upload is not supported for <b class="text-ds-font-weight-semi-bold" style="color: var(--white-color);">${ModelVariantIdNameMapping[currentModel]} </b> model`;

  //////////////////////////////////////////////////////////////////////////////
  //                        File Upload Methods - End
  //////////////////////////////////////////////////////////////////////////////
</script>

<div
  class="prompt-input-container d-flex flex-column gap-3 {isPromptBoxFocused
    ? 'focused'
    : ''} {isTyping ? 'typing' : ''} {disabled ? 'disabled' : ''}"
  class:pointer-events-none={disabled}
>
  <div class="textarea-wrapper">
    <!-- File Chips Display -->
    {#if filesToUpload.length > 0}
      <div class="file-chips-container d-flex flex-wrap gap-2 mb-2">
        {#each filesToUpload as file (file.id)}
          <FileItem
            {file}
            onRemove={handleRemoveFile}
            size={"small"}
            isReadOnly={false}
          />
        {/each}
      </div>
    {/if}

    <!-- Textarea Input -->
    <CodeMirrorInput
      value={prompt}
      onUpdateInput={(val) => (prompt = val)}
      placeholder="Write a prompt or generate one from generate prompt."
      {theme}
      {environmentVariables}
      {onUpdateEnvironment}
      disabled={isResponseGenerating ? true : false}
    />
    <!-- <textarea
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
          if (!isResponseGenerating && !isUploadingFiles && prompt.trim()) {
            await hanldeStartGenerating();
            isTyping = false;
            isPromptBoxFocused = false;
            event.target.blur();
            setTimeout(adjustTextareaHeight, 0); // waiting for the DOM to update.
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
    /> -->
  </div>

  <!-- Action Btn Section -->
  <div
    class="actions-container d-flex justify-content-between align-items-center"
  >
    <div id="generate-prompt-chip">
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
    </div>

    <!-- Hidden file input -->
    <input
      type="file"
      bind:this={fileInput}
      on:change={handleFileSelect}
      multiple
      accept={acceptAttribute}
      style="display: none;"
    />
    <div class="d-flex">
      <Tooltip
        title={"Attach File:"}
        subtext={fileUploadTooltip}
        placement={"top-right"}
        size={"medium"}
        styleProp={"width: 220px;"}
      >
        <Button
          type={"teritiary-regular"}
          size={"small"}
          startIcon={AttachRegular}
          onClick={handleAttachClick}
          disable={!isUploadSupported || filesToUpload.length >= MAX_FILES}
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
          disable={isUploadingFiles}
          loader={isUploadingFiles}
          onClick={() => {
            if (isResponseGenerating) {
              onStopGeneratingAIResponse();
              return;
            }
            console.log("prompt: ", prompt);
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
    transition:
      opacity 0.2s ease,
      filter 0.2s ease;
  }

  .prompt-input-container:hover:not(.disabled) {
    outline: 1px solid var(--border-ds-neutral-300);
  }

  .prompt-input-container.focused:not(.disabled) {
    outline: 2px solid var(--border-ds-primary-300);
  }

  .prompt-input-container.typing:not(.disabled) {
    outline: 1px solid var(--border-ds-primary-300);
  }

  .prompt-input-container.disabled {
    opacity: 0.6;
    filter: grayscale(0.3);
  }

  .pointer-events-none {
    pointer-events: none;
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
