<script lang="ts">
  import type {
    AiRequestConversationsDocument,
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { environmentType } from "@sparrow/common/enums";

  // ---- View Model
  import AiRequestExplorerViewModel from "./AiRequestExplorerPage.ViewModel";
  import { AiRequestExplorer } from "@sparrow/workspaces/features";
  import { Debounce } from "@sparrow/common/utils";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import {
    AiRequestExplorerDataStore,
    type AiRequestExplorerData,
  } from "@sparrow/workspaces/features/ai-request-explorer/store";
  import type { RxDocument } from "rxdb";
  import type { CollectionDocType } from "src/models/collection.model";
  import type { AiRequestConversationsDocType } from "src/models/ai-request-conversations.model";
  import type { Observable } from "rxjs";

  export let tab;
  // export let isTourGuideOpen = false;
  let isLoginBannerActive = false;
  const _viewModel = new AiRequestExplorerViewModel(tab);
  const collectionObs = _viewModel.collectionSubscriber(tab.path.collectionId);

  let collection: CollectionDocType;
  const collectionSubscriber = collectionObs.subscribe(
    (data: RxDocument<CollectionDocument>) => {
      collection = data?.toMutableJSON();
    },
  );

  let conversationsHistory: Observable<AiRequestConversationsDocument[]>;

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

  let AiRequestExplorerData: AiRequestExplorerData | undefined;
  AiRequestExplorerDataStore.subscribe((AiRequestExplorerMap) => {
    AiRequestExplorerData = AiRequestExplorerMap.get(tab.tabId);
  });

  onDestroy(() => {
    collectionSubscriber.unsubscribe();
    activeWorkspaceSubscriber.unsubscribe();
  });

  const getConvoList = async () => {
    conversationsHistory = _viewModel.getConversationsList();
  };
</script>

<AiRequestExplorer
  bind:tab={_viewModel.tab}
  bind:collections={_viewModel.collection}
  bind:collectionAuth={_viewModel.collectionAuth}
  bind:userRole
  {collection}
  environmentVariables={[]}
  {isGuestUser}
  {isLoginBannerActive}
  storeData={AiRequestExplorerData}
  onUpdateAIModel={_viewModel.onUpdateAIModel}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateRequestAuth={_viewModel.updateRequestAuth}
  onUpdateRequestState={_viewModel.updateRequestState}
  onUpdateAiSystemPrompt={_viewModel.updateAiSystemPrompt}
  onUpdateEnvironment={_viewModel.updateEnvironment}
  onUpdateAiPrompt={_viewModel.updateRequestAIPrompt}
  onUpdateAiConfigurations={_viewModel.updateAiConfigurations}
  onUpdateAiConversation={_viewModel.updateRequestAIConversation}
  isWebApp={true}
  onStopGeneratingAIResponse={_viewModel.stopGeneratingAIResponse}
  onGenerateAiResponse={_viewModel.generateAIResponseWS}
  onToggleLike={_viewModel.toggleChatMessageLike}
  fetchConversations={_viewModel.fetchConversations}
  onSelectConversation={(id) => console.log("Selected:", id)}
  onDeleteConversation={(id) => console.log("Deleted:", id)}
  conversationsHistory={$conversationsHistory}
  getConversationsList={getConvoList}
  onSwitchConversation={_viewModel.switchConversation}
  onRenameConversation={_viewModel.handleRenameConversationTitle}
/>
