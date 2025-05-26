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
  } from "../components";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import type { CollectionDocument } from "@app/database/database";
  import type { Observable } from "rxjs";
  import { AiRequestSectionEnum } from "@sparrow/common/types/workspace/ai-request-tab";
  import type { AiRequestExplorerData } from "../store/ai-request-explorer";
  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { disabledModelFeatures } from "@sparrow/common/types/workspace/ai-request-dto";

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
  const minPx = 343;
  const maxPx = 525;
  const defaultPx = 452;

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

  $: {
    const property = $tab?.property;
    const aiRequest = property?.aiRequest;
    const modPro = aiRequest?.aiModelProvider;
    const modVer = aiRequest?.aiModelVariant;
    const configurations = aiRequest?.configurations;

    // if (property && modPro && modVer && configurations?.[modPro]) {
    // console.log("kk :>> ", property);
    console.log("configurations :>> ", configurations);
    // }
  }
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
                  <RequestDoc
                    {onUpdateAiSystemPrompt}
                    isEditable={disabledModelFeatures[
                      $tab.property.aiRequest?.state?.aiNavigation
                    ].includes($tab.property.aiRequest?.aiModelVariant)}
                    requestDoc={$tab.property.aiRequest.systemPrompt}
                  />
                {:else if $tab.property.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.AUTHORIZATION}
                  <RequestAuth
                    requestStateAuth={$tab.property.aiRequest.state
                      .aiAuthNavigation}
                    auth={$tab.property.aiRequest.auth}
                    collectionAuth={$collectionAuth}
                    {onUpdateRequestState}
                    {onUpdateRequestAuth}
                    {onUpdateEnvironment}
                    {environmentVariables}
                    {collection}
                    {onOpenCollection}
                  />
                {:else if $tab.property.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.AI_MODAL_CONFIGURATIONS}
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
            <ChatBot
              {tab}
              responseData={storeData}
              {onUpdateAiPrompt}
              {onUpdateAiConversation}
              {onUpdateRequestState}
              {onGenerateAiResponse}
              {onStopGeneratingAIResponse}
              {onToggleLike}
              handleApplyChangeOnAISuggestion={() => {}}
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
