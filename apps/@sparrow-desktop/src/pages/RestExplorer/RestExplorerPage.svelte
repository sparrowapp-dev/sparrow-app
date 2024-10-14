<script lang="ts">
  import type { WorkspaceDocument } from "@app/database/database";
  import { environmentType } from "@sparrow/common/enums";

  // ---- View Model
  import RestExplorerViewModel from "./RestExplorerPage.ViewModel";
  import { RestExplorer, ChatBot } from "@sparrow/workspaces/features";
  import { Debounce } from "@sparrow/common/utils";
  import { isGuestUserActive, user } from "@app/store/auth.store";
  import { onMount } from "svelte";
  import { restExplorerDataStore } from "@sparrow/workspaces/features/rest-explorer/store";
  import type { restExplorerData } from "@sparrow/workspaces/features/rest-explorer/store";
  export let tab;
  export let isTourGuideOpen = false;
  let isLoginBannerActive = false;
  const _viewModel = new RestExplorerViewModel(tab);
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
    _viewModel.updateNameWithCollectionList,
    1000,
  );
  const debouncedAPIUpdater = new Debounce().debounce(
    _viewModel?.refreshTabData,
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

  let environmentVariables = [];
  let environmentId: string;
  let currentWorkspaceId = "";
  let currentWorkspace;

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
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

  let restExplorerData: restExplorerData | undefined;
  restExplorerDataStore.subscribe((webSocketMap) => {
    restExplorerData = webSocketMap.get(tab.tabId);
  });
</script>

<RestExplorer
  bind:collections={_viewModel.collection}
  bind:tab={_viewModel.tab}
  bind:requestAuthHeader={_viewModel.authHeader}
  bind:requestAuthParameter={_viewModel.authParameter}
  bind:userRole
  bind:isTourGuideOpen
  storeData={restExplorerData}
  {environmentVariables}
  {isGuestUser}
  {isLoginBannerActive}
  onSendRequest={_viewModel.sendRequest}
  onCancelRequest={_viewModel.cancelRequest}
  onUpdateRequestUrl={_viewModel.updateRequestUrl}
  onUpdateRequestMethod={_viewModel.updateRequestMethod}
  onUpdateRequestParams={_viewModel.updateParams}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateRequestBody={_viewModel.updateRequestBody}
  onUpdateRequestAuth={_viewModel.updateRequestAuth}
  onUpdateHeaders={_viewModel.updateHeaders}
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
/>
{#if !isGuestUser}
  <ChatBot
    bind:tab={_viewModel.tab}
    onUpdateAiPrompt={_viewModel.updateRequestAIPrompt}
    onUpdateAiConversation={_viewModel.updateRequestAIConversation}
    onUpdateRequestState={_viewModel.updateRequestState}
    onGenerateAiResponse={_viewModel.generateAiResponse}
    onToggleLike={_viewModel.toggleChatMessageLike}
  />
{/if}
