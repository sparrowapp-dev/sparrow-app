<script lang="ts">
  import { notifications } from "@library/ui/toast/Toast";
  import { AISuggestionBox } from "@workspaces/features/chat-bot/components";
  import { onMount } from "svelte";
  export let onUpdateRequestDescription;
  export let onGenerateDocumentation;
  export let requestStateDoc;
  let textareaRef: HTMLTextAreaElement | null = null;
  let docValue = "";
  let description: string = "";
  let isResponseGenerating = false;

  onMount(() => {
    docValue = requestStateDoc;
  });

  const sendPrompt = async (text: string) => {
    if (text) {
      isResponseGenerating = true;
      const response = await onGenerateDocumentation(text, "", "");
      if (response?.status == "success") {
        docValue = response.data?.data?.result;
        onUpdateRequestDescription(docValue);
      } else {
        notifications.error("Failed to generate documentation");
        docValue = "Failed to generate documentation";
      }
    }
    isResponseGenerating = false;
    return docValue;
  };

  const handleSaveChanges = () => {
    if (textareaRef) {
      description = textareaRef.value;
      onUpdateRequestDescription(description);
      notifications.success("Documentation updated successfully");
    }
  };
</script>

<div class=" text-fs-14">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight: 600; margin-bottom:8px;">Documentation</div>
  </div>
  <div style="height: 160px !important; " class="area">
    <textarea
      bind:this={textareaRef}
      on:blur={handleSaveChanges}
      value={docValue}
      class="text-fs-12 w-100 border-0"
      style="height:120px !important; font-weight:400; background-color:transparent; outline: none;   padding-bottom:5px; padding-top: 8px; padding-left: 12px; padding-right: 12px;"
      placeholder="Add Documentation"
    ></textarea>
    <div
      class=""
      style="height: 42px; width: 100%;margin-top:-6px; padding-bottom:8px; padding-left:8px; "
    >
      <div style=" width:176px; ">
        {#if isResponseGenerating}
          <div
            class="text-primary-300"
            style="font-size: 14px; height: 20px; width:150px;"
          >
            <span class="mb-2">...</span>
            <span> Generating </span>
          </div>
        {:else}
          <AISuggestionBox
            onClick={(text = "") => {
              if (!isResponseGenerating) {
                text =
                  "Generate Documentation for api request, don't give response in markdown format";
                sendPrompt(text);
              }
            }}
            title="Generate Documentation"
          />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .area:focus-within {
    border: 1px solid var(--border-primary-300) !important;
  }
  .area:hover {
    background-color: var(--bg-secondary-450) !important;
  }
</style>
