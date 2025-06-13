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
  import {
    ModelIdNameMapping,
    ModelVariantIdNameMapping,
  } from "@sparrow/common/types/workspace/ai-request-base";
  import type { AiRequestExplorerData } from "../store/ai-request-explorer";
  import type { Tab } from "@sparrow/common/types/workspace/tab";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { disabledModelFeatures, modelCodeTemplates } from "../constants";

  import {
    SettingsRegular,
    BotSparkleRegular,
    CopyIcon,
    CopyIcon2,
    TickIcon,
    CopyRegular,
  } from "@sparrow/library/icons";
  import { Button, Modal, notifications } from "@sparrow/library/ui";
  import { SaveAsCollectionItem } from "../../save-as-request";
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";
  import { Editor, Select } from "@sparrow/library/forms";
  import type { CodeTemplateLanguage } from "../types";
  import {
    CodeEditorLanguageType,
    CodeTemplateLanguageType,
  } from "../types/ai-request";
  import { Sleep } from "@sparrow/common/utils";

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

  // Role of user in active workspace
  export let userRole;
  export let storeData: AiRequestExplorerData | undefined;
  export let isWebApp = false;
  export let collectionAuth;
  export let collection;
  const loading = writable<boolean>(false);
  let isExposeSaveAsRequest = false;

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

  const toggleSaveRequest = (flag: boolean): void => {
    isExposeSaveAsRequest = flag;
  };

  let codeTemplateLanguage: CodeEditorLanguageType =
    CodeEditorLanguageType.nodejs;
  let selectedCodeTemplateId = CodeTemplateLanguageType.NODEJS;
  let codeTemplate: string;
  let isCodeTemplateBeautified = true;

  const handleCodeTemplateChange = (
    codeTemplateId: CodeTemplateLanguageType,
  ) => {
    const provider = $tab?.property?.aiRequest?.aiModelProvider;
    const variant = $tab?.property?.aiRequest?.aiModelVariant;
    const apiKey = $tab?.property?.aiRequest?.auth?.apiKey?.authValue;
    const configuration = $tab?.property?.aiRequest?.configurations;

    selectedCodeTemplateId = codeTemplateId;
    codeTemplateLanguage = CodeEditorLanguageType[selectedCodeTemplateId];

    // Get the template function
    const templateFunction =
      modelCodeTemplates[provider][selectedCodeTemplateId]["code_template"];

    // Call the template function with parameters to get the actual code string
    codeTemplate = templateFunction(variant, apiKey, configuration[provider]);

    updateCodeTemplateBeautifiedState(true);

    // console.log("sel id :>> ", selectedCodeTemplateId);
    // console.log("sel lang :>> ", codeTemplateLanguage);
    // console.log("sel codeTemplate :>> ", templateFunction);
  };

  let isGetCodePopupOpen = false;
  let isCodeCopied = false;
  const onClickOpenGetCodePopup = async () => {
    const provider = $tab?.property?.aiRequest?.aiModelProvider;
    const variant = $tab?.property?.aiRequest?.aiModelVariant;
    const apiKey = $tab?.property?.aiRequest?.auth?.apiKey?.authValue;
    const configuration = $tab?.property?.aiRequest?.configurations;

    codeTemplateLanguage = CodeEditorLanguageType.nodejs;
    selectedCodeTemplateId = CodeTemplateLanguageType.NODEJS;
    const templateFunction =
      modelCodeTemplates[provider][selectedCodeTemplateId]["code_template"];
    codeTemplate = templateFunction(variant, apiKey, configuration[provider]);

    // console.log("id :>> ", selectedCodeTemplateId);
    // console.log("lang :>> ", codeTemplateLanguage);
    // console.log("content :>> ", codeTemplate);
    isGetCodePopupOpen = true;
    updateCodeTemplateBeautifiedState(true);
  };

  const updateCodeTemplateBeautifiedState = (value: boolean) => {
    isCodeTemplateBeautified = value;
  };
</script>

{#if $tab.tabId}
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
        selectedModelProvider={$tab.property.aiRequest?.aiModelProvider}
        selectedModel={$tab.property.aiRequest?.aiModelVariant}
        {onUpdateAiConversation}
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
      requestUrl={ModelIdNameMapping[$tab.property.aiRequest?.aiModelProvider]}
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
    <div
      class="d-flex align-items-center justify-content-between mt-2 mb-2 w-100 gap-2"
    >
      <div class="flex-grow-1" style="max-width: 75%;">
        <Select
          id={"code-selector"}
          data={[
            {
              id: CodeTemplateLanguageType.NODEJS,
              name: "NodeJs",
              disabled: false,
              hide: false,
            },
            {
              id: CodeTemplateLanguageType.JSON,
              name: CodeEditorLanguageType.json,
              disabled: false,
              hide: false,
            },
            {
              id: CodeTemplateLanguageType.PYTHON,
              name: CodeEditorLanguageType.python,
              disabled: false,
              hide: false,
            },
            {
              id: CodeTemplateLanguageType.CURL,
              name: CodeEditorLanguageType.curl,
              disabled: false,
              hide: false,
            },
          ]}
          titleId={selectedCodeTemplateId}
          onclick={(id) => {
            handleCodeTemplateChange(id);
          }}
          menuItem={"v2"}
          minHeaderWidth={"100%"}
          maxHeaderWidth={"100%"}
          minBodyWidth={"100%"}
          variant={"light-violet"}
          position={"absolute"}
          zIndex={200}
        />
      </div>

      <div class="flex-shrink-0">
        <Button
          title={isCodeCopied ? "Copied" : "Copy Code"}
          size={"small"}
          type={"teritiary-regular"}
          startIcon={isCodeCopied ? TickIcon : CopyRegular}
          iconSize={14}
          onClick={async () => {
            if (isCodeCopied) return;
            try {
              await navigator.clipboard.writeText(codeTemplate);
              isCodeCopied = true;
              notifications.success("Code copied to clipboard.");
              await new Sleep().setTime(1500).exec();
              isCodeCopied = false;
            } catch (err) {
              notifications.success("Failed to copy the code.");
            }
          }}
        />
      </div>
    </div>

    <div
      class="request-body position-relative w-100"
      style="background-color: var(--bg-ds-neutral-900); border-radius: 2px; height: 260px; border: 1px solid var(--border-color, rgba(255,255,255,0.1));"
    >
      <Editor
        bind:lang={codeTemplateLanguage}
        bind:value={codeTemplate}
        on:change={() => {}}
        isEditable={false}
        autofocus={false}
        isBodyBeautified={isCodeTemplateBeautified}
        beautifySyntaxCallback={updateCodeTemplateBeautifiedState}
      />
    </div>
  </Modal>
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
