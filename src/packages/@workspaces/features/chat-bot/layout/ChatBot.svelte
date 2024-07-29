<script lang="ts">
  import type { Observable } from "rxjs";
  // import { fade } from "svelte/transition";
  import {
    AIChatInterface,
    AiChatToggler,
    AISuggestionBox,
  } from "../components";
  import type { RequestTab } from "@common/types/workspace";
  import { CloseIcon } from "../assests";

  export let tab: Observable<RequestTab>;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onUpdateRequestState;
  export let onGenerateAiResponse;
  export let onToggleLike;

  let isResponseGenerating = false;
  const sendPrompt = async (text: string) => {
    if (text) {
      isResponseGenerating = true;
      onUpdateAiConversation([
        ...$tab?.property?.request?.ai?.conversations,
        {
          message: text,
          messageId: "",
          type: "SENDER",
          isLiked: false,
          isDisliked: false,
        },
      ]);
      const response = await onGenerateAiResponse(text, "", "");
      isResponseGenerating = false;
    }
  };

  const regenerateAiResponse = async () => {
    isResponseGenerating = true;
    const regenerateConversation =
      $tab?.property?.request?.ai?.conversations.slice(0, -1);
    onUpdateAiConversation(regenerateConversation);
    const response = await onGenerateAiResponse(
      regenerateConversation[regenerateConversation.length - 1].message,
    );
    isResponseGenerating = false;
  };
</script>

{#if $tab?.property?.request?.state?.isChatbotActive}
  <div
    style="position: fixed;
  top:200px;
   bottom: 80px;
   right:18px;
   z-index: 200;
   width: 320px;
   "
  >
    <AIChatInterface
      conversations={$tab?.property?.request?.ai?.conversations}
      prompt={$tab?.property?.request?.ai?.prompt}
      {onUpdateAiPrompt}
      {sendPrompt}
      {isResponseGenerating}
      {onToggleLike}
      {regenerateAiResponse}
      {onUpdateRequestState}
    />
  </div>
{/if}
{#if !$tab?.property?.request?.state?.isChatbotActive && $tab?.property?.request?.state?.isChatbotSuggestionsActive}
  <div
    style="position: fixed;
   bottom: 80px;
   right:18px;
   z-index: 200;
   width: 200px;
   "
  >
    <div
      style="position: relative; left:186px; bottom:6px; cursor:pointer;"
      on:click={() =>
        onUpdateRequestState({
          isChatbotSuggestionsActive: false,
        })}
    >
      <CloseIcon
        height={"10px"}
        width={"10px"}
        color="var(--icon-primary-300)"
      />
    </div>
    <div class="d-flex flex-column align-items-end">
      <!-- <div
      class="d-flex flex-column align-items-end"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    > -->
      <AISuggestionBox
        onClick={(text = "") => {
          if (!isResponseGenerating) {
            sendPrompt(text);
            onUpdateRequestState({
              isChatbotActive: true,
            });
          }
        }}
        title="Generate Curl"
      />
      <AISuggestionBox
        onClick={(text = "") => {
          if (!isResponseGenerating) {
            sendPrompt(text);
            onUpdateRequestState({
              isChatbotActive: true,
            });
          }
        }}
        title="Generate Documentation"
      />
      <AISuggestionBox
        onClick={(text = "") => {
          if (!isResponseGenerating) {
            sendPrompt(text);
            onUpdateRequestState({
              isChatbotActive: true,
            });
          }
        }}
        title="Generate Mock Data"
      />
    </div>
  </div>
{/if}
<div
  style="position: fixed;
   bottom: 22px;
   right:18px;
   z-index: 200;"
>
  <div
    class="sparrow-ai-icon"
    role="button"
    on:click={() => {
      onUpdateRequestState({
        isChatbotActive: !$tab?.property?.request?.state?.isChatbotActive,
      });
    }}
  >
    <AiChatToggler
      height="42px"
      width="42px"
      isChatBoxOpen={$tab?.property?.request?.state?.isChatbotActive}
    />
  </div>
</div>

<style>
</style>
