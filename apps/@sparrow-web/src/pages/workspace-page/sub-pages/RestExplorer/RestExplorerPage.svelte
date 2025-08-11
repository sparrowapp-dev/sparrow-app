<script lang="ts">
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";
  import { environmentType } from "@sparrow/common/enums";

  // ---- View Model
  import RestExplorerViewModel from "./RestExplorerPage.ViewModel";
  import { RestExplorer, ChatBot } from "@sparrow/workspaces/features";
  import { Debounce } from "@sparrow/common/utils";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import { onDestroy, onMount } from "svelte";
  import { restExplorerDataStore } from "@sparrow/workspaces/features/rest-explorer/store";
  import type { restExplorerData } from "@sparrow/workspaces/features/rest-explorer/store";
  import constants from "../../../../constants/constants";
  import type { RxDocument } from "rxdb";
  import type { CollectionDocType } from "@app/models/collection.model";

  export let tab;
  export let isTourGuideOpen = false;

  let _viewModel;
  let isLoginBannerActive = false;
  let collection: CollectionDocType;
  let isGuestUser = false;
  let userId = "";
  let userRole = "";
  let prevTabName = "";

  let environmentVariables;
  let environmentId: string;
  let currentWorkspaceId = "";
  let currentWorkspace;

  let restExplorerData: restExplorerData | undefined;

  let collectionObserver;
  let environmentsObserver;
  let activeWorkspaceObserver;

  let webSocketMap;
  let prevTabId = "";

  let renameWithCollectionList;
  let debouncedAPIUpdater;
  let guestUser;

  const restExplorerDataStoreSubscriber = restExplorerDataStore.subscribe(
    (_webSocketMap) => {
      webSocketMap = _webSocketMap;
    },
  );

  const isGuestUserActiveSubscriber = isGuestUserActive.subscribe((value) => {
    isGuestUser = value;
  });

  const userSubscriber = user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  $: {
    restExplorerData = webSocketMap?.get(tab?.tabId);
  }

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

  let activeWorkspaceSubscriber;
  let collectionSubscriber;

  $: {
    if (tab) {
      if (prevTabId !== tab?.tabId) {
        (async () => {
          /**
           * @description - Initialize the view model for the new http request tab
           */
          _viewModel = new RestExplorerViewModel(tab);
          collectionObserver = _viewModel.collectionSubscriber(
            tab.path.collectionId,
          );
          environmentsObserver = _viewModel.environments;
          activeWorkspaceObserver = _viewModel.activeWorkspace;
          renameWithCollectionList = new Debounce().debounce(
            _viewModel?.updateNameWithCollectionList as any,
            1000,
          );
          debouncedAPIUpdater = new Debounce().debounce(
            _viewModel?.refreshTabData as any,
            1000,
          );
          guestUser = await _viewModel.getGuestUser(); // <-- now valid inside async IIFE
          if (guestUser?.isBannerActive) {
            isLoginBannerActive = guestUser?.isBannerActive;
          }
          collectionSubscriber = collectionObserver?.subscribe(
            (data: RxDocument<CollectionDocument>) => {
              collection = data?.toMutableJSON();
            },
          );

          activeWorkspaceSubscriber = activeWorkspaceObserver?.subscribe(
            async (value: WorkspaceDocument) => {
              const activeWorkspaceRxDoc = value;
              if (activeWorkspaceRxDoc) {
                currentWorkspace = activeWorkspaceRxDoc;
                currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
                environmentId = activeWorkspaceRxDoc.get("environmentId");
              }
            },
          );
        })();
      } else {
        if (tab?.name && prevTabName !== tab.name) {
          renameWithCollectionList(tab.name);
        }
      }
      debouncedAPIUpdater(tab);
      findUserRole();
      prevTabName = tab?.name || "";
      prevTabId = tab?.tabId || "";
    }
  }

  /**
   * @description - refreshes the environment everytime workspace changes
   */
  const refreshEnvironment = () => {
    if ($environmentsObserver && currentWorkspaceId) {
      if ($environmentsObserver?.length > 0) {
        const filteredEnv = $environmentsObserver
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
    if (environmentId || $environmentsObserver || currentWorkspaceId) {
      refreshEnvironment();
    }
  }

  onDestroy(() => {
    collectionSubscriber?.unsubscribe();
    activeWorkspaceSubscriber?.unsubscribe();
    restExplorerDataStoreSubscriber();
    isGuestUserActiveSubscriber();
    userSubscriber();
  });
</script>

<RestExplorer
  bind:collections={_viewModel.collection}
  bind:tab={_viewModel.tab}
  bind:collectionAuth={_viewModel.collectionAuth}
  bind:requestAuthHeader={_viewModel.authHeader}
  bind:requestAuthParameter={_viewModel.authParameter}
  bind:userRole
  bind:isTourGuideOpen
  {collection}
  storeData={restExplorerData}
  {environmentVariables}
  {isGuestUser}
  {isLoginBannerActive}
  onOpenCollection={_viewModel.openCollection}
  onSendRequest={_viewModel.sendRequest}
  onCancelRequest={_viewModel.cancelRequest}
  onUpdateRequestUrl={_viewModel.updateRequestUrl}
  onUpdateRequestMethod={_viewModel.updateRequestMethod}
  onUpdateRequestParams={_viewModel.updateParams}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateRequestBody={_viewModel.updateRequestBody}
  onUpdateRequestAuth={_viewModel.updateRequestAuth}
  onUpdateHeaders={_viewModel.updateHeaders}
  isWebApp={true}
  onUpdateAutoGeneratedHeaders={_viewModel.updateAutoGeneratedHeaders}
  onUpdateRequestState={_viewModel.updateRequestState}
  onUpdateResponseState={_viewModel.updateResponseState}
  onClearResponse={_viewModel.clearResponse}
  onSaveRequest={_viewModel.saveRequest}
  onUpdateRequestDescription={_viewModel.updateRequestDescription}
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
  azureBlobCDN={constants.AZURE_CDN_URL}
  onSaveResponse={_viewModel.saveResponse}
  onStopGeneratingAIResponse={_viewModel.stopGeneratingAIResponse}
  onGenerateAiResponse={_viewModel.generateAIResponseWS}
  onToggleLike={_viewModel.toggleChatMessageLike}
  onUpdateAiModel={_viewModel.updateAIModel}
  onHandleUrlInput={_viewModel.handleUrlInput}
/>
