<script lang="ts">
  import type { Observable } from "rxjs";
  import { fade } from "svelte/transition";
  import {
    AIChatInterface,
    AiChatToggler,
    AISuggestionBox,
  } from "../components";
  import {
    MessageTypeEnum,
    type RequestTab,
  } from "@sparrow/common/types/workspace";
  import { CrossIcon } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@deprecate/utils/enums";
  import type { ScrollList } from "../types";

  export let tab: Observable<RequestTab>;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onUpdateRequestState;
  export let onGenerateAiResponse;
  export let onToggleLike;

  let scrollList: ScrollList;

  const sendPrompt = async (text: string) => {
    if (text) {
      onUpdateAiConversation([
        ...$tab?.property?.request?.ai?.conversations,
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
    }, 10);
  });

  const regenerateAiResponse = async () => {
    const regenerateConversation =
      $tab?.property?.request?.ai?.conversations.slice(0, -1);
    onUpdateAiConversation(regenerateConversation);
    const response = await onGenerateAiResponse(
      regenerateConversation[regenerateConversation.length - 1].message,
      MixpanelEvent(Events.AI_Regenerate_Response),
    );
  };
</script>

{#if $tab?.property?.request?.state?.isChatbotActive}
  <div
    style="position: fixed;
    top:200px;
    bottom: 80px;
    right:28px;
    z-index: 200;
    width: 320px;
    "
  >
    <AIChatInterface
      conversations={$tab?.property?.request?.ai?.conversations}
      prompt={$tab?.property?.request?.ai?.prompt}
      {onUpdateAiPrompt}
      {sendPrompt}
      isResponseGenerating={$tab?.property?.request?.state
        ?.isChatbotGeneratingResponse}
      {onToggleLike}
      {regenerateAiResponse}
      {onUpdateRequestState}
      bind:scrollList
    />
  </div>
{/if}
{#if !$tab?.property?.request?.state?.isChatbotActive && $tab?.property?.request?.state?.isChatbotSuggestionsActive}
  <div
    style="position: fixed;
   bottom: 80px;
   right:28px;
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
      <CrossIcon
        height={"18px"}
        width={"18px"}
        color="var(--icon-primary-300)"
      />
    </div>
    <!-- <div class="d-flex flex-column align-items-end"> -->
    <div
      class="d-flex flex-column align-items-end"
      in:fade={{ duration: 400 }}
      out:fade={{ duration: 100 }}
    >
      <AISuggestionBox
        onClick={(text = "") => {
          if (!$tab?.property?.request?.state?.isChatbotGeneratingResponse) {
            sendPrompt(text);
            onUpdateRequestState({
              isChatbotActive: true,
            });
          }
          MixpanelEvent(Events.AI_Ext_Gen_Curl_Prompt);
        }}
        title="Generate Curl"
      />
      <AISuggestionBox
        onClick={(text = "") => {
          if (!$tab?.property?.request?.state?.isChatbotGeneratingResponse) {
            sendPrompt(text);
            onUpdateRequestState({
              isChatbotActive: true,
            });
          }
          MixpanelEvent(Events.AI_Ext_Gen_Doc_Prompt);
        }}
        title="Generate Documentation"
      />
      <AISuggestionBox
        onClick={(text = "") => {
          if (!$tab?.property?.request?.state?.isChatbotGeneratingResponse) {
            sendPrompt(text);
            onUpdateRequestState({
              isChatbotActive: true,
            });
          }
          MixpanelEvent(Events.AI_Ext_Gen_Mock_Prompt);
        }}
        title="Generate Mock Data"
      />
    </div>
  </div>
{/if}
<div
  style="position: fixed;
   bottom: 22px;
   right:28px;
   z-index: 200;"
>
  <div
    class="sparrow-ai-icon"
    role="button"
    on:click={() => {
      onUpdateRequestState({
        isChatbotActive: !$tab?.property?.request?.state?.isChatbotActive,
      });
      setTimeout(() => {
        scrollList("bottom", -1, "auto");
      }, 0);
      MixpanelEvent(Events.AI_Chat_Initiation);
    }}
  >
    <AiChatToggler
      height="42px"
      width="42px"
      isChatBoxOpen={$tab?.property?.request?.state?.isChatbotActive}
    />
  </div>
</div>
