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
    LLM_AI_ExplorerDataStore,
    type LLM_AI_ExplorerData,
  } from "@sparrow/workspaces/features/llm-ai-explorer/store";

  export let tab: Observable<RequestTab>;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onUpdateRequestState;
  export let onGenerateAiResponse;
  export let onStopGeneratingAIResponse;
  export let onToggleLike;
  export let handleApplyChangeOnAISuggestion;
  export let responseData: LLM_AI_ExplorerData | undefined;

  let scrollList: ScrollList;

  const sendPrompt = async (text: string) => {
    console.log("in sendPrompt :>> 1");
    if (text) {
      console.log("in sendPrompt :>> 2");
      // const tabId: string = $tab?.tabId;
      // const newData: LLM_AI_ExplorerData = {
      //   response: {
      //     messageId: "",
      //     statusCode: "",
      //     inputTokens: 0,
      //     outputTokens: 0,
      //     totalTokens: 0,
      //     time: 0,
      //   },
      // };

      // LLM_AI_ExplorerDataStore.update((map) => {
      //   map.set(tabId, newData);
      //   return new Map(map); // Return a new Map to trigger reactivity
      // });

      // setTimeout(() => {
      // LLM_AI_ExplorerDataStore.subscribe((map) => {
      //   const value = map.get(tabId);
      //   console.log("In SendPrompt :>> Data after 3 seconds:", value);
      // })();
      // }, 2000);

      onUpdateAiConversation([
        // ...$tab?.property?.llm_ai_request?.ai?.conversations,
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
      $tab?.property?.llm_ai_request?.ai?.conversations.slice(0, -1);
    onUpdateAiConversation(regenerateConversation);
    const response = await onGenerateAiResponse(
      regenerateConversation[regenerateConversation.length - 1].message,
      MixpanelEvent(Events.AI_Regenerate_Response),
    );
  };
</script>

{#if $tab?.property?.llm_ai_request?.state?.isChatbotActive}
  <div class="h-100">
    <AIChatInterface
      conversations={$tab?.property?.llm_ai_request?.ai?.conversations}
      {responseData}
      prompt={$tab?.property?.llm_ai_request?.ai?.prompt}
      {onUpdateAiPrompt}
      {sendPrompt}
      isResponseGenerating={$tab?.property?.llm_ai_request?.state
        ?.isChatbotGeneratingResponse}
      {onToggleLike}
      {regenerateAiResponse}
      {onUpdateRequestState}
      {onStopGeneratingAIResponse}
      {handleApplyChangeOnAISuggestion}
      modelVariant={$tab?.property?.llm_ai_request?.AI_Model_Variant}
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
