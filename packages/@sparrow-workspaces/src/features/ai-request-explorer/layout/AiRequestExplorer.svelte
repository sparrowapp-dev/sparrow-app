<script lang="ts">
  // ---- Components
  import {
    ModelSector,
    RequestNavigator,
    RequestAuth,
    ChatBot,
    RequestDoc,
    AiConfigs,
    GetCode,
    GeneratePromptModal,
  } from "../components";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import type {
    CollectionDocument,
    AiRequestConversationsDocument,
  } from "@app/database/database";
  import type { Observable } from "rxjs";
  import {
    AiRequestSectionEnum,
    type Conversation,
  } from "@sparrow/common/types/workspace/ai-request-tab";
  import {
    ModelIdNameMapping,
    ModelVariantIdNameMapping,
  } from "@sparrow/common/types/workspace/ai-request-base";
  import type { AiRequestExplorerData } from "../store/ai-request-explorer";
  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { SettingsRegular, BotSparkleRegular } from "@sparrow/library/icons";
  import { SaveAsCollectionItem } from "../../save-as-request";
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";
  import { Modal } from "@sparrow/library/ui";

  export let tab: Observable<Tab>;
  export let collections: Observable<CollectionDocument[]>;
  export let onUpdateRequestName;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateAiSystemPrompt;
  export let onSaveAiRequest;
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
  export let readWorkspace;
  export let onSave;
  export let onCreateFolder;
  export let onCreateCollection;
  export let onRenameCollection;
  export let onRenameFolder;
  export let onClearConversation;
  export let onUploadFiles;

  let isGeneratePromptModalOpen = false;
  let isConversationHistoryLoading = false;
  let isConversationHistoryPanelOpened = false;
  let generatePromptTarget: "UserPrompt" | "SystemPrompt" | "None" = "None";

  // Conversations History Props
  export let conversationsHistory: AiRequestConversationsDocument[];
  export let onSelectConversation: (id: string) => void;
  export let onRenameConversation: (
    conversationId: string,
    conversationTitle: string,
  ) => void;
  export let onDeleteConversation: (
    conversationId: string,
    conversationTitle: string,
  ) => void;
  export let onSwitchConversation: (
    conversationId: string,
    conversationTitle: string,
    conversation: Conversation[],
  ) => void;
  export let fetchConversations: () => Promise<void>;
  export let getConversationsList: () => Observable<
    AiRequestConversationsDocument[]
  >;
  export let onGenerateAiPrompt;

  // Role of user in active workspace
  export let userRole;
  export let storeData: AiRequestExplorerData | undefined;
  export let isWebApp = false;
  export let collectionAuth;
  export let collection;
  export let onHandleInsertPrompt;
  const loading = writable<boolean>(false);
  let isExposeSaveAsRequest = false;

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

  const toggleSaveRequest = (flag: boolean): void => {
    isExposeSaveAsRequest = flag;
  };

  let isConversationHistoryPanelOpen = false;
  const onOpenConversationHistoryPanel = async () => {
    // fetchConversations(); // fetch the updated state from DB
    // await new Sleep().setTime(1500).exec(); // wait for UI to load
    await fetchConversations();
    const result = await getConversationsList();
    maxPx += 230;
    defaultPx += 220;
    minPx += 300;
    updateSplitpaneContSizes();
    isConversationHistoryPanelOpen = true;
    return result;
  };
  const onCloseConversationHistoryPanel = () => {
    maxPx -= 230;
    defaultPx -= 220;
    minPx -= 300;
    updateSplitpaneContSizes();
    isConversationHistoryPanelOpen = false;
  };

  const handleOnClickUpdateRequestAuth = async () => {
    if (!isGuestUser && isConversationHistoryPanelOpen) {
      isConversationHistoryLoading = true;
      const res = await fetchConversations();
      const result = await getConversationsList();
      isConversationHistoryLoading = false;
    }
    onUpdateRequestAuth();
  };

  let isGetCodePopupOpen = false;
  const onClickOpenGetCodePopup = async () => {
    isGetCodePopupOpen = true;
  };

  // Update the activateGeneratePromptModal function:
  const activateGeneratePromptModal = (
    target: "UserPrompt" | "SystemPrompt",
  ) => {
    generatePromptTarget = target;
    isGeneratePromptModalOpen = true;
  };

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
</script>

<div class="d-flex ai-request-explorer-layout h-100">
  <div class="w-100 d-flex flex-column h-100 p-3">
    <!-- HTTP URL Section -->
    <ModelSector
      class=""
      isSaveLoad={$loading}
      isSave={$tab.isSaved}
      bind:userRole
      {onUpdateEnvironment}
      {environmentVariables}
      {onUpdateAIModel}
      {toggleSaveRequest}
      onSaveRequest={onSaveAiRequest}
      selectedModelProvider={$tab.property?.aiRequest?.aiModelProvider}
      selectedModel={$tab.property?.aiRequest?.aiModelVariant}
      {onUpdateAiConversation}
      onModelSwitch={async () => {
        onSwitchConversation("", "New Conversation", []);
        if (isConversationHistoryPanelOpen) {
          onCloseConversationHistoryPanel();
        }
        // if (!isGuestUser && isConversationHistoryPanelOpen) {
        //   isConversationHistoryLoading = true;
        //   const res = await fetchConversations();
        //   const result = getConversationsList();
        //   isConversationHistoryLoading = false;
        // }
      }}
      openGetCodePopup={onClickOpenGetCodePopup}
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
              requestStateSection={$tab.property?.aiRequest?.state
                ?.aiNavigation}
              {onUpdateRequestState}
            />
            <div style="flex:1; overflow:auto;" class="p-0">
              {#if $tab.property?.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.SYSTEM_PROMPT}
                {#if $tab.property?.aiRequest?.aiModelProvider}
                  <RequestDoc
                    {onUpdateAiSystemPrompt}
                    isEditable={true}
                    requestDoc={$tab.property?.aiRequest?.systemPrompt}
                    {activateGeneratePromptModal}
                    isAutoPromptGenerationInProgress={$tab.property?.aiRequest
                      .state.isSaveDescriptionInProgress}
                    {isGuestUser}
                    {environmentVariables}
                    {onUpdateEnvironment}
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
              {:else if $tab.property?.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.AUTHORIZATION}
                {#if $tab.property?.aiRequest?.aiModelProvider}
                  <RequestAuth
                    requestStateAuth={$tab.property?.aiRequest.state
                      .aiAuthNavigation}
                    auth={$tab.property?.aiRequest.auth}
                    requestStateAuthProfile={$tab.property.aiRequest.state
                      .selectedRequestAuthProfileId}
                    selectedModelProvider={$tab.property?.aiRequest
                      ?.aiModelProvider}
                    collectionAuth={$collectionAuth}
                    {onUpdateRequestState}
                    onUpdateRequestAuth={handleOnClickUpdateRequestAuth}
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
              {:else if $tab.property?.aiRequest?.state?.aiNavigation === AiRequestSectionEnum.AI_MODAL_CONFIGURATIONS}
                {#if $tab.property?.aiRequest?.aiModelProvider}
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
                      No model selected. Please choose a model to configure its
                      settings.
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
          <ChatBot
            {tab}
            {isGuestUser}
            disabled={!$tab.property?.aiRequest?.aiModelProvider}
            responseData={storeData}
            {onUpdateAiPrompt}
            {onUpdateAiConversation}
            {onUpdateRequestState}
            {environmentVariables}
            {onUpdateEnvironment}
            {onGenerateAiResponse}
            {onStopGeneratingAIResponse}
            {activateGeneratePromptModal}
            {onToggleLike}
            {conversationsHistory}
            {onOpenConversationHistoryPanel}
            {onCloseConversationHistoryPanel}
            {onSwitchConversation}
            {onRenameConversation}
            {onDeleteConversation}
            {onClearConversation}
            {onUploadFiles}
            bind:isConversationHistoryPanelOpen
            bind:isConversationHistoryLoading
          />
        </Pane>
      </Splitpanes>
    </div>
  </div>
</div>

<Modal
  title={"Save AI Request"}
  type={"dark"}
  width={"55%"}
  zIndex={10000}
  isOpen={isExposeSaveAsRequest}
  handleModalState={(flag = false) => {
    isExposeSaveAsRequest = flag;
  }}
>
  <SaveAsCollectionItem
    onClick={(flag = false) => {
      isExposeSaveAsRequest = flag;
    }}
    requestMethod={TabTypeEnum.AI_REQUEST}
    requestUrl={ModelIdNameMapping[$tab.property?.aiRequest?.aiModelProvider]}
    requestName={$tab.name}
    requestDescription={$tab.description}
    requestPath={$tab.path}
    collections={$collections}
    {readWorkspace}
    {onSave}
    {onCreateFolder}
    {onCreateCollection}
    {onRenameCollection}
    {onRenameFolder}
  />
</Modal>

<Modal
  title={`Code for "${ModelVariantIdNameMapping[$tab?.property?.aiRequest?.aiModelVariant]}" API`}
  type={"dark"}
  zIndex={1000}
  isOpen={isGetCodePopupOpen}
  width={"40%"}
  handleModalState={() => {
    isGetCodePopupOpen = false;
  }}
>
  <GetCode
    selectedModelVariant={$tab?.property?.aiRequest?.aiModelVariant}
    aiModelProvider={$tab?.property?.aiRequest?.aiModelProvider}
    providerApiKey={$tab?.property?.aiRequest?.auth?.apiKey?.authValue}
    configurations={$tab?.property?.aiRequest?.configurations}
  />
</Modal>

<Modal
  title={`Generate ${generatePromptTarget === "UserPrompt" ? "User Prompt" : "System Prompt"}`}
  zIndex={1000}
  isOpen={isGeneratePromptModalOpen}
  width="35%"
  handleModalState={() => {
    isGeneratePromptModalOpen = false;
    generatePromptTarget = "None";
  }}
>
  <GeneratePromptModal
    {generatePromptTarget}
    {onGenerateAiPrompt}
    {onHandleInsertPrompt}
    on:close={() => {
      isGeneratePromptModalOpen = false;
      generatePromptTarget = "None";
    }}
    {environmentVariables}
    {onUpdateEnvironment}
    on:insert={(event) => {}}
  />
</Modal>

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
