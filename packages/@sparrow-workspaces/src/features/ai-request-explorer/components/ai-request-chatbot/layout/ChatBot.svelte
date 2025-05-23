<script lang="ts">
  import type { Observable } from "rxjs";
  import { AIChatInterface } from "../components";
  import {
    MessageTypeEnum,
    type RequestTab,
  } from "@sparrow/common/types/workspace";
  import { onMount } from "svelte";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import type { ScrollList } from "../types";
  import {
    AiRequestExplorerDataStore,
    type AiRequestExplorerData,
  } from "@sparrow/workspaces/features/ai-request-explorer/store";

  export let tab: Observable<RequestTab>;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onUpdateRequestState;
  export let onGenerateAiResponse;
  export let onStopGeneratingAIResponse;
  export let onToggleLike;
  export let handleApplyChangeOnAISuggestion;
  export let responseData: AiRequestExplorerData | undefined;

  let scrollList: ScrollList;

  const sendPrompt = async (text: string) => {
    if (text) {
      onUpdateAiConversation([
        // ...$tab?.property?.aiRequest?.ai?.conversations,
        {
          message: text,
          messageId: "",
          type: MessageTypeEnum.SENDER,
          isLiked: false,
          isDisliked: false,
          status: true,
        },
      ]);
      setTimeout(() => {
        if (scrollList) scrollList("bottom", -1, "smooth");
      }, 10);
      const response = await onGenerateAiResponse(text, "", "");
      setTimeout(() => {
        if (scrollList) scrollList("bottom", -1, "smooth");
      }, 10);
    }
  };

  onMount(() => {
    setTimeout(() => {
      if (scrollList) scrollList("bottom", -1, "auto");
    }, 100);
  });

  const regenerateAiResponse = async () => {
    const regenerateConversation =
      $tab?.property?.aiRequest?.ai?.conversations.slice(0, -1);
    onUpdateAiConversation(regenerateConversation);
    const response = await onGenerateAiResponse(
      regenerateConversation[regenerateConversation.length - 1].message,
      MixpanelEvent(Events.AI_Regenerate_Response),
    );
  };
</script>

{#if $tab?.property?.aiRequest?.state?.isChatbotActive}
  <div class="h-100">
    <AIChatInterface
      conversations={$tab?.property?.aiRequest?.ai?.conversations}
      {responseData}
      prompt={$tab?.property?.aiRequest?.ai?.prompt}
      {onUpdateAiPrompt}
      {sendPrompt}
      isResponseGenerating={$tab?.property?.aiRequest?.state
        ?.isChatbotGeneratingResponse}
      {onToggleLike}
      {regenerateAiResponse}
      {onUpdateRequestState}
      {onStopGeneratingAIResponse}
      {handleApplyChangeOnAISuggestion}
      modelVariant={$tab?.property?.aiRequest?.aiModelVariant}
      bind:scrollList
    />
  </div>
{/if}

<style lang="scss">
  .chatten-box {
    background-color: var(--bg-ds-primary-400);
    height: 40px;
    width: 40px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .chatten-box:hover {
    background-color: var(--bg-ds-primary-500);
  }
  .chatten-box:focus-visible {
    height: 40px;
    width: 40px;
    border-radius: 10px;
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
  }
</style>
