<script lang="ts">
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { environmentType } from "@sparrow/common/enums";

  // ---- View Model
  import RestExplorerViewModel from "./LLM_AI_ExplorerPage.ViewModel";
  import { LLM_AI_Explorer, ChatBot } from "@sparrow/workspaces/features";
  import { Debounce } from "@sparrow/common/utils";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import { onMount, onDestroy } from "svelte";
  import {
    LLM_AI_ExplorerDataStore,
    type LLM_AI_ExplorerData,
  } from "@sparrow/workspaces/features/llm-ai-explorer/store";
  import constants from "../../../../constants/constants";
  import type { RxDocument } from "rxdb";
  import type { CollectionDocType } from "src/models/collection.model";

  export let tab;
  // export let isTourGuideOpen = false;
  let isLoginBannerActive = false;
  const _viewModel = new RestExplorerViewModel(tab);
  const collectionObs = _viewModel.collectionSubscriber(tab.path.collectionId);

  let collection: CollectionDocType;
  const collectionSubscriber = collectionObs.subscribe(
    (data: RxDocument<CollectionDocument>) => {
      collection = data?.toMutableJSON();
    },
  );

  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.activeWorkspace;
  let isGuestUser = false;
  let userId = "";
  let userRole = "";

  isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  const renameWithCollectionList = new Debounce().debounce(
    _viewModel.updateNameWithCollectionList as any,
    1000,
  );
  const debouncedAPIUpdater = new Debounce().debounce(
    _viewModel?.refreshTabData as any,
    1000,
  );
  let prevTabName = "";
  /**
   * Find the role of user in active workspace
   */
  const findUserRole = async () => {
    const workspace: WorkspaceDocument = await _viewModel.getWorkspaceById(
      tab.path.workspaceId,
    );
    workspace.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role as string;
      }
    });
  };
  $: {
    if (tab) {
      if (tab?.name && prevTabName !== tab.name) {
        renameWithCollectionList(tab.name);
      }
      prevTabName = tab.name;
      findUserRole();
      debouncedAPIUpdater(tab);
    }
  }

  let environmentVariables;
  let environmentId: string;
  let currentWorkspaceId = "";
  let currentWorkspace;

  const activeWorkspaceSubscriber = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value;
      if (activeWorkspaceRxDoc) {
        currentWorkspace = activeWorkspaceRxDoc;
        currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
        environmentId = activeWorkspaceRxDoc.get("environmentId");
      }
    },
  );

  /**
   * @description - refreshes the environment everytime workspace changes
   */
  const refreshEnvironment = () => {
    if ($environments && currentWorkspaceId) {
      if ($environments?.length > 0) {
        const filteredEnv = $environments
          .filter((elem) => {
            return elem.workspaceId === currentWorkspaceId;
          })
          .filter((elem) => {
            if (
              elem.type === environmentType.GLOBAL ||
              elem.id === environmentId
            ) {
              return true;
            }
          });
        if (filteredEnv?.length > 0) {
          let envs = [];
          filteredEnv.forEach((elem) => {
            environmentVariables = {
              local: filteredEnv[1],
              global: filteredEnv[0],
              filtered: [],
            };

            const temp = elem.toMutableJSON();
            temp.variable.forEach((variable) => {
              if (variable.key && variable.checked) {
                envs.unshift({
                  key: variable.key,
                  value: variable.value,
                  type: temp.type === environmentType.GLOBAL ? "G" : "E",
                  environment: temp.name,
                });
              }
            });
            environmentVariables.filtered = envs;
          });
        }
      }
    }
  };

  $: {
    if (environmentId || $environments || currentWorkspaceId) {
      refreshEnvironment();
    }
  }
  onMount(async () => {
    const guestUser = await _viewModel.getGuestUser();
    if (guestUser?.isBannerActive) {
      isLoginBannerActive = guestUser?.isBannerActive;
    }
  });

  // Anish -> Need to fix the imports
  let LLM_AI_ExplorerData: LLM_AI_ExplorerData | undefined;
  LLM_AI_ExplorerDataStore.subscribe((LLM_AI_ExplorerMap) => {
    LLM_AI_ExplorerData = LLM_AI_ExplorerMap.get(tab.tabId);
  });

  onDestroy(() => {
    collectionSubscriber.unsubscribe();
    activeWorkspaceSubscriber.unsubscribe();
  });
</script>

<LLM_AI_Explorer
  bind:collections={_viewModel.collection}
  bind:tab={_viewModel.tab}
  bind:collectionAuth={_viewModel.collectionAuth}
  bind:requestAuthHeader={_viewModel.authHeader}
  bind:requestAuthParameter={_viewModel.authParameter}
  bind:userRole
  {collection}
  {environmentVariables}
  {isGuestUser}
  {isLoginBannerActive}
  storeData={LLM_AI_ExplorerData}
  onOpenCollection={_viewModel.openCollection}
  onUpdateAIModel={_viewModel.onUpdateAIModel}
  onUpdateRequestMethod={_viewModel.updateRequestMethod}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateRequestAuth={_viewModel.updateRequestAuth}
  onUpdateRequestState={_viewModel.updateRequestState}
  onSaveRequest={_viewModel.saveRequest}
  onUpdateAiSystemPrompt={_viewModel.updateAiSystemPrompt}
  readRequestOrFolderInCollection={_viewModel.readRequestOrFolderInCollection}
  readCollection={_viewModel.readCollection}
  readWorkspace={_viewModel.readWorkspace}
  onSaveAsRequest={_viewModel.saveAsRequest}
  onCreateFolder={_viewModel.createFolder}
  onCreateCollection={_viewModel.createCollection}
  onUpdateEnvironment={_viewModel.updateEnvironment}
  onFetchCollectionGuide={_viewModel.fetchCollectionGuide}
  onUpdateCollectionGuide={_viewModel.updateCollectionGuide}
  onRenameCollection={_viewModel.handleRenameCollection}
  onRenameFolder={_viewModel.handleRenameFolder}
  onUpdateAiPrompt={_viewModel.updateRequestAIPrompt}
  onUpdateAiConversation={_viewModel.updateRequestAIConversation}
  onGenerateDocumentation={_viewModel.generateDocumentation}
  isWebApp={true}
  azureBlobCDN={constants.AZURE_CDN_URL}
  onStopGeneratingAIResponse={_viewModel.stopGeneratingAIResponse}
  onGenerateAiResponse={_viewModel.generateAIResponseWS}
  onToggleLike={_viewModel.toggleChatMessageLike}
/>
