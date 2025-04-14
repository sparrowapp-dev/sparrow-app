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
  import { SparkleFilled } from "@sparrow/common/icons";
  import { SparrowSecondaryIcon } from "@sparrow/common/icons";
  import {
    CrossIcon,
    DismissRegular,
    CaretDownFilled,
  } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import type { ScrollList } from "../types";

  export let tab: Observable<RequestTab>;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onUpdateRequestState;
  export let onGenerateAiResponse;
  export let onStopGeneratingAIResponse;
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
    }, 100);
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
  <div class="h-100">
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
      {onStopGeneratingAIResponse}
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

    <!-- Suggestion Box Outside Panel  -->
    <!-- <div
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
    </div> -->
  </div>
{/if}

<!-- <div
  style="position: fixed;
   bottom: 22px;
   right:508px; // temp change
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
    <div class="chatten-box" tabindex="0">
      {#if !$tab?.property?.request?.state?.isChatbotActive}
        <SparrowSecondaryIcon />
      {:else}
        <CaretDownFilled />
      {/if}
    </div>
  </div>
</div> -->

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
