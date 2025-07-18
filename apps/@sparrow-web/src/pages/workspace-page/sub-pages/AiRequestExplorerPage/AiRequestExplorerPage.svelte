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
  import { onMount, onDestroy } from "svelte";
  import {
    AiRequestExplorerDataStore,
    type AiRequestExplorerData,
  } from "@sparrow/workspaces/features/ai-request-explorer/store";
  import type { RxDocument } from "rxdb";
  import type { CollectionDocType } from "src/models/collection.model";
  import type { Observable } from "rxjs";

  export let tab;
  // export let isTourGuideOpen = false;
  let isLoginBannerActive = false;
  let _viewModel;
  let collectionObs;

  let collection: CollectionDocType;
  let collectionSubscriber;

  let conversationsHistory:
    | Observable<AiRequestConversationsDocument[]>
    | undefined;

  let environments;
  let activeWorkspace;

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

  let renameWithCollectionList;

  let prevTabName = "";
  let prevTabId = "";
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
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */

          _viewModel = new AiRequestExplorerViewModel(tab);
          collectionObs = _viewModel.collectionSubscriber(
            tab.path.collectionId,
          );
          collectionSubscriber = collectionObs.subscribe(
            (data: RxDocument<CollectionDocument>) => {
              collection = data?.toMutableJSON();
            },
          );
          environments = _viewModel.environments;
          activeWorkspace = _viewModel.activeWorkspace;

          renameWithCollectionList = new Debounce().debounce(
            _viewModel.updateNameWithCollectionList as any,
            1000,
          );

          activeWorkspaceSubscriber = activeWorkspace.subscribe(
            async (value: WorkspaceDocument) => {
              const activeWorkspaceRxDoc = value;
              if (activeWorkspaceRxDoc) {
                currentWorkspace = activeWorkspaceRxDoc;
                currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
                environmentId = activeWorkspaceRxDoc.get("environmentId");
              }
            },
          );

          const guestUser = await _viewModel.getGuestUser();
          if (guestUser?.isBannerActive) {
            isLoginBannerActive = guestUser?.isBannerActive;
          }

          getConversationList = async () => {
            conversationsHistory = _viewModel.getConversationsList();
          };

          findUserRole();
        })();
      } else if (tab?.name && prevTabName !== tab.name) {
        renameWithCollectionList(tab.name);
      }
      prevTabId = tab?.tabId || "";
      prevTabName = tab?.name || "";
    }
  }

  let environmentVariables = [];
  let environmentId: string;
  let currentWorkspaceId = "";
  let currentWorkspace;

  let activeWorkspaceSubscriber;

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

  let AiRequestExplorerData: AiRequestExplorerData | undefined;
  let AiRequestExplorerMap;

  $: {
    AiRequestExplorerData = AiRequestExplorerMap?.get(tab.tabId);
  }
  AiRequestExplorerDataStore.subscribe((_AiRequestExplorerMap) => {
    AiRequestExplorerMap = _AiRequestExplorerMap;
  });

  let getConversationList;

  onDestroy(() => {
    collectionSubscriber?.unsubscribe();
    activeWorkspaceSubscriber?.unsubscribe();
  });
</script>

<AiRequestExplorer
  bind:tab={_viewModel.tab}
  bind:collections={_viewModel.collection}
  bind:collectionAuth={_viewModel.collectionAuth}
  bind:userRole
  {collection}
  environmentVariables={[]}
  {isGuestUser}
  isWebApp={true}
  storeData={AiRequestExplorerData}
  onUpdateAIModel={_viewModel.onUpdateAIModel}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateRequestAuth={_viewModel.updateRequestAuth}
  onUpdateRequestState={_viewModel.updateRequestState}
  onUpdateAiSystemPrompt={_viewModel.updateAiSystemPrompt}
  onUpdateEnvironment={_viewModel.updateEnvironment}
  onUpdateAiPrompt={_viewModel.updateRequestAIPrompt}
  onUpdateAiConversation={_viewModel.updateRequestAIConversation}
  onUpdateAiConfigurations={_viewModel.updateAiConfigurations}
  onStopGeneratingAIResponse={_viewModel.stopGeneratingAIResponse}
  onGenerateAiResponse={_viewModel.generateAIResponseWS}
  onToggleLike={_viewModel.toggleChatMessageLike}
  readWorkspace={_viewModel.readWorkspace}
  onSaveAiRequest={_viewModel.saveAiRequest}
  onSave={_viewModel.saveAsRequest}
  onCreateFolder={_viewModel.createFolder}
  onCreateCollection={_viewModel.createCollection}
  onRenameCollection={_viewModel.handleRenameCollection}
  onRenameFolder={_viewModel.handleRenameFolder}
  onOpenCollection={_viewModel.openCollection}
  fetchConversations={_viewModel.fetchConversations}
  getConversationsList={getConversationList}
  conversationsHistory={$conversationsHistory}
  onSwitchConversation={_viewModel.switchConversation}
  onRenameConversation={_viewModel.handleRenameConversationTitle}
  onDeleteConversation={_viewModel.handleDeleteConversation}
  onClearConversation={_viewModel.handleClearConversation}
  onGenerateAiPrompt={_viewModel.generateAiPrompt}
  onHandleInsertPrompt={_viewModel.handleInsertAiPrompt}
  onUploadFiles={_viewModel.handleUploadFilesToCloud}
  onSetEnviromentVariables={_viewModel.setEnvironmentVariables}
/>
