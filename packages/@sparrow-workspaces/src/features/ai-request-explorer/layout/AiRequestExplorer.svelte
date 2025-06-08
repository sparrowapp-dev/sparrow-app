<script lang="ts">
  // ---- Components
  import {
    ModelSector,
    RequestNavigator,
    RequestAuth,
    RequestName,
    ChatBot,
    RequestDoc,
    AiConfigs,
    ConversationHistoryItem,
  } from "../components";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import type {
    CollectionDocument,
    AiRequestConversationsDocument,
  } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { AiRequestSectionEnum } from "@sparrow/common/types/workspace/ai-request-tab";
  import type { AiRequestExplorerData } from "../store/ai-request-explorer";
  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { disabledModelFeatures } from "../constants";

  import {
    BotRegular,
    SettingsRegular,
    BotSparkleRegular,
    DismissRegular,
  } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";

  export let tab: Observable<Tab>;
  export let collections: Observable<CollectionDocument[]>;
  export let onUpdateRequestName;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateAiSystemPrompt;
  export let onSaveRequest;
  export let onOpenCollection;
  export let onUpdateEnvironment;
  export let environmentVariables;
  export let isGuestUser = false;
  export let onGenerateAiResponse;
  export let onUpdateAIModel;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onStopGeneratingAIResponse;
  export let onToggleLike;
  export let onUpdateAiConfigurations;

  // Conversations History Props
  export let conversationsHistory: AiRequestConversationsDocument[];
  export let onSelectConversation: (id: string) => void;
  export let onDeleteConversation: (id: string) => void;

  // Role of user in active workspace
  export let userRole;
  export let storeData: AiRequestExplorerData | undefined;
  export let isWebApp = false;
  export let onSaveResponse;
  export let collectionAuth;
  export let collection;
  const loading = writable<boolean>(false);

  // Reference to the splitpane container element
  let splitpaneContainer;
  let splitpaneContainerWidth = 0;

  // Chatbot pane size constraints in pixels (based on Figma design)
  // const minPx = 343;
  // const maxPx = 525;
  let minPx = 343;
  let maxPx = 525;
  let defaultPx = 452;

  // Chatbot pane size constraints in percentage (calculated at runtime)
  let minSizePct = 0;
  let maxSizePct = 0;
  let defaultSizePct = 0;

  /**
   * Converts the pixel-based min, max, and default sizes
   * of the chatbot pane into percentages relative to the
   * current width of the splitpane container.
   *
   * Required because `svelte-splitpane` accepts sizes in percentages.
   */
  function updateSplitpaneContSizes() {
    if (!splitpaneContainer) return;

    splitpaneContainerWidth = splitpaneContainer.clientWidth;

    minSizePct = (minPx / splitpaneContainerWidth) * 100;
    maxSizePct = (maxPx / splitpaneContainerWidth) * 100;
    defaultSizePct = (defaultPx / splitpaneContainerWidth) * 100;
  }

  onMount(async () => {
    // Delay to ensure DOM is ready before measuring container width
    setTimeout(() => {
      updateSplitpaneContSizes();
      // Watch for container size changes and update pane size percentages
      const resizeObserver = new ResizeObserver(() => {
        updateSplitpaneContSizes();
      });
      resizeObserver.observe(splitpaneContainer);
      return () => resizeObserver.disconnect(); // Cleanup on component unmount
    }, 0);
  });
  onDestroy(() => {});

  const onOpenConversationHistoryPanel = () => {
    maxPx += 200;
    defaultPx += 130;
    minPx += 250;
    updateSplitpaneContSizes();
  };
  const onCloseConversationHistoryPanel = () => {
    maxPx -= 200;
    defaultPx -= 130;
    minPx -= 250;
    updateSplitpaneContSizes();
  };

  $: {
    if ($tab) console.log("tab :>> ", $tab?.property?.aiRequest);
  }
  // $: {
  //   if (conversationsHistory)
  //     console.log("convo List :>> ", conversationsHistory);
  // }
</script>

{#if $tab.tabId}
  <div class="d-flex ai-request-explorer-layout h-100">
    <div class="w-100 d-flex flex-column h-100 p-3">
      <div class="d-flex justify-content-between w-100 p-3 d-none">
        <RequestName name={$tab.name} {onUpdateRequestName} />

        <div class="d-flex justify-content-between"></div>
      </div>

      <!-- HTTP URL Section -->
      <ModelSector
        class=""
        isSaveLoad={$loading}
        isSave={$tab.isSaved}
        bind:userRole
        {onUpdateEnvironment}
        {environmentVariables}
        {onUpdateAIModel}
        toggleSaveRequest={() => {}}
        {onSaveRequest}
        {isGuestUser}
        selectedModelProvider={$tab.property.aiRequest?.aiModelProvider}
        selectedModel={$tab.property.aiRequest?.aiModelVariant}
        {onUpdateAiConversation}
      />

      <div
        bind:this={splitpaneContainer}
        style="flex:1; overflow:auto; margin-top: 12px;"
      >
        <Splitpanes class="explorer-chatbot-splitter">
          <Pane class="position-relative bg-transparent">
            <!-- Request Pane -->
            <div class="h-100 d-flex flex-column position-relative">
              <RequestNavigator
                requestStateSection={$tab.property.aiRequest?.state
                  ?.aiNavigation}
                {onUpdateRequestState}
              />
              <div style="flex:1; overflow:auto;" class="p-0">
                {#if $tab.property.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.SYSTEM_PROMPT}
                  {#if $tab.property.aiRequest?.aiModelProvider}
                    <RequestDoc
                      {onUpdateAiSystemPrompt}
                      isEditable={disabledModelFeatures[
                        $tab.property.aiRequest?.state?.aiNavigation
                      ].includes($tab.property.aiRequest?.aiModelVariant)}
                      requestDoc={$tab.property.aiRequest.systemPrompt}
                    />
                  {:else}
                    <div
                      style="font-family: Inter, sans-serif;"
                      class="d-flex flex-column align-items-center justify-content-center h-100 text-center text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
                    >
                      <div class="mb-3">
                        <BotSparkleRegular
                          size={"48px"}
                          color={"var(--icon-ds-neutral-500)"}
                        />
                      </div>
                      <p
                        class="text-muted mb-0 px-3"
                        style="font-family: Inter, sans-serif; color=var(--icon-ds-neutral-500)"
                      >
                        No model selected. Please choose a model to set its
                        context for tailored responses.
                      </p>
                    </div>
                  {/if}
                {:else if $tab.property.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.AUTHORIZATION}
                  {#if $tab.property.aiRequest?.aiModelProvider}
                    <RequestAuth
                      requestStateAuth={$tab.property.aiRequest.state
                        .aiAuthNavigation}
                      auth={$tab.property.aiRequest.auth}
                      selectedModelProvider={$tab.property.aiRequest
                        ?.aiModelProvider}
                      collectionAuth={$collectionAuth}
                      {onUpdateRequestState}
                      {onUpdateRequestAuth}
                      {onUpdateEnvironment}
                      {environmentVariables}
                      {collection}
                      {onOpenCollection}
                    />
                  {:else}
                    <div
                      style="font-family: Inter, sans-serif;"
                      class="d-flex flex-column align-items-center justify-content-center h-100 text-center text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
                    >
                      <div class="mb-3">
                        <BotSparkleRegular
                          size={"48px"}
                          color={"var(--icon-ds-neutral-500)"}
                        />
                      </div>
                      <p
                        class="text-muted mb-0 px-3"
                        style="font-family: Inter, sans-serif; color=var(--icon-ds-neutral-500)"
                      >
                        No model selected. Please select a model to add
                        authentication.
                      </p>
                    </div>
                  {/if}
                {:else if $tab.property.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.AI_MODAL_CONFIGURATIONS}
                  {#if $tab.property.aiRequest?.aiModelProvider}
                    <AiConfigs
                      currSelectedModel={$tab.property?.aiRequest
                        ?.aiModelProvider}
                      currSelectedModelVariant={$tab.property?.aiRequest
                        ?.aiModelVariant}
                      config={$tab.property?.aiRequest?.configurations?.[
                        $tab.property?.aiRequest?.aiModelProvider
                      ]}
                      {onUpdateAiConfigurations}
                    />
                  {:else}
                    <div
                      style="font-family: Inter, sans-serif;"
                      class="d-flex flex-column align-items-center justify-content-center h-100 text-center text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium"
                    >
                      <div class="mb-3">
                        <SettingsRegular
                          size={"48px"}
                          color={"var(--icon-ds-neutral-500)"}
                        />
                      </div>
                      <p
                        class="text-muted mb-0 px-3"
                        style="font-family: Inter, sans-serif; color=var(--icon-ds-neutral-500)"
                      >
                        No model selected. Please choose a model to configure
                        its settings.
                      </p>
                    </div>
                  {/if}
                {/if}
              </div>
            </div>
          </Pane>

          <Pane
            class="position-relative bg-transparent"
            minSize={minSizePct}
            size={defaultSizePct}
            maxSize={maxSizePct}
          >
            <!-- Conversation History Panel -->
            <ChatBot
              {tab}
              disabled={!$tab.property.aiRequest?.aiModelProvider}
              responseData={storeData}
              {onUpdateAiPrompt}
              {onUpdateAiConversation}
              {onUpdateRequestState}
              {onGenerateAiResponse}
              {onStopGeneratingAIResponse}
              {onToggleLike}
              {conversationsHistory}
              {onOpenConversationHistoryPanel}
              {onCloseConversationHistoryPanel}
            />
          </Pane>
        </Splitpanes>
      </div>
    </div>
  </div>
{/if}

<style>
  .ai-request-explorer-layout {
    background-color: var(--bg-ds-surface-900);
  }

  :global(.rest-splitter.splitpanes--vertical > .splitpanes__splitter) {
    width: 11px !important;
    height: 100% !important;
    background-color: var(--bg-secondary-500) !important;
    border-left: 5px solid var(--border-ds-surface-900) !important;
    border-right: 5px solid var(--border-ds-surface-900) !important;
    border-top: 0 !important;
    border-bottom: 0 !important;
  }
  :global(.rest-splitter.splitpanes--horizontal > .splitpanes__splitter) {
    height: 11px !important;
    width: 100% !important;
    background-color: var(--bg-ds-surface-100) !important;
    border-top: 5px solid var(--border-ds-surface-900) !important;
    border-bottom: 5px solid var(--border-ds-surface-900) !important;
    border-left: 0 !important;
    border-right: 0 !important;
  }
  :global(
    .rest-splitter > .splitpanes__splitter:active,
    .rest-splitter > .splitpanes__splitter:hover
  ) {
    background-color: var(--bg-ds-primary-400) !important;
  }

  /* Disabling the splitter for explorer and chatbot interface - only split dragger is allowed on hover */
  :global(
    .explorer-chatbot-splitter.splitpanes--vertical > .splitpanes__splitter
  ) {
    width: 8px !important;
    border: none !important;
    background: transparent !important;
  }

  :global(
    .explorer-chatbot-splitter.splitpanes--vertical
      > .splitpanes__splitter:hover,
    .explorer-chatbot-splitter.splitpanes--vertical
      > .splitpanes__splitter:active
  ) {
    border: none !important;
    border-right: 2px solid var(--border-ds-primary-300) !important;
    background: transparent !important;
  }
</style>
