<script lang="ts">
  import type { WorkspaceDocument } from "@app/database/database";
  import { environmentType, WorkspaceRole } from "@sparrow/common/enums";

  // ---- View Model
  import GraphqlExplorerViewModel from "./GraphqlExplorerPage.ViewModel";
  import { Debounce } from "@sparrow/common/utils";
  import { onDestroy } from "svelte";
  import { graphqlExplorerDataStore } from "@sparrow/workspaces/features/graphql-explorer/store";
  import type { graphqlExplorerData } from "@sparrow/workspaces/features/graphql-explorer/store";
  import { GraphqlExplorer } from "@sparrow/workspaces/features";
  import type {
    EnvironmentDocumentBaseInterface,
    EnvironmentFilteredVariableBaseInterface,
    EnvironmentLocalGlobalJoinBaseInterface,
  } from "@sparrow/common/types/workspace/environment-base";
  import { getClientUser } from "@app/utils/jwt";
  import { user } from "@app/store/auth.store";
  export let tab;
  let userId = "";
  let userRole = "";

  const _viewModel = new GraphqlExplorerViewModel(tab);
  const environments = _viewModel.environments;
  const activeWorkspace = _viewModel.activeWorkspace;
  let isGraphqlEditable = false;

  const renameWithCollectionList = new Debounce().debounce(
    _viewModel.updateNameWithCollectionList as any,
    1000,
  );
  user.subscribe((value) => {
    if (value) {
      userId = value._id;
    }
  });

  /**
   * Find the role of user in active workspace
   */
  const findUserRole = async () => {
    const workspace = await _viewModel.getWorkspaceById(
      tab?.path?.workspaceId as string,
    );
    workspace.users?.forEach((value) => {
      if (value.id === userId) {
        userRole = value.role as string;
      }
    });
  };

  let prevTabName = "";
  $: {
    if (tab) {
      if (tab?.name && prevTabName !== tab.name) {
        renameWithCollectionList(tab.name);
      }
      prevTabName = tab.name;
      findUserRole();
    }
  }

  let environmentVariables: EnvironmentLocalGlobalJoinBaseInterface;
  let environmentId: string;
  let currentWorkspaceId = "";
  let currentWorkspace;

  const activeWorkspaceSubscribe = activeWorkspace.subscribe(
    async (value: WorkspaceDocument) => {
      const activeWorkspaceRxDoc = value.toMutableJSON();
      if (activeWorkspaceRxDoc) {
        currentWorkspace = activeWorkspaceRxDoc;
        currentWorkspaceId = activeWorkspaceRxDoc._id;
        environmentId = activeWorkspaceRxDoc.environmentId as string;
        const clientUserId = getClientUser().id;
        if (clientUserId) {
          let isUserViewer = false;
          activeWorkspaceRxDoc.users?.forEach((_user) => {
            if (_user.id === clientUserId) {
              if (_user.role === WorkspaceRole.WORKSPACE_VIEWER) {
                isUserViewer = true;
              }
            }
          });
          if (isUserViewer) {
            isGraphqlEditable = false;
          } else {
            isGraphqlEditable = true;
          }
        } else {
          isGraphqlEditable = true;
        }
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
          })
          .map((_env) => {
            return _env.toMutableJSON() as EnvironmentDocumentBaseInterface;
          });
        if (filteredEnv?.length > 0) {
          let envs: EnvironmentFilteredVariableBaseInterface[] = [];
          filteredEnv.forEach((temp) => {
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
          });
          environmentVariables = {
            local: filteredEnv[1],
            global: filteredEnv[0],
            filtered: envs,
          };
        }
      }
    }
  };

  $: {
    if (environmentId || $environments || currentWorkspaceId) {
      refreshEnvironment();
    }
  }

  let restExplorerData: graphqlExplorerData | undefined;
  graphqlExplorerDataStore.subscribe((webSocketMap) => {
    restExplorerData = webSocketMap.get(tab.tabId);
  });
  onDestroy(() => {
    activeWorkspaceSubscribe.unsubscribe();
  });
</script>

<GraphqlExplorer
  bind:userRole
  collections={_viewModel.collection}
  tab={_viewModel.tab}
  requestAuthHeader={_viewModel.authHeader}
  {isGraphqlEditable}
  storeData={restExplorerData}
  {environmentVariables}
  onSendRequest={_viewModel.sendRequest}
  onCancelRequest={_viewModel.cancelRequest}
  onUpdateRequestUrl={_viewModel.updateRequestUrl}
  onUpdateRequestQuery={_viewModel.updateRequestQuery}
  onUpdateRequestName={_viewModel.updateRequestName}
  onUpdateRequestAuth={_viewModel.updateRequestAuth}
  onUpdateHeaders={_viewModel.updateHeaders}
  onUpdateAutoGeneratedHeaders={_viewModel.updateAutoGeneratedHeaders}
  onUpdateRequestState={_viewModel.updateRequestState}
  onUpdateResponseState={_viewModel.updateResponseState}
  onSaveRequest={_viewModel.saveRequest}
  readWorkspace={_viewModel.readWorkspace}
  onSaveAsRequest={_viewModel.saveAsRequest}
  onCreateFolder={_viewModel.createFolder}
  onCreateCollection={_viewModel.createCollection}
  onUpdateEnvironment={_viewModel.updateEnvironment}
  onRenameCollection={_viewModel.handleRenameCollection}
  onRenameFolder={_viewModel.handleRenameFolder}
  onClearQuery={_viewModel.clearQuery}
  onFetchSchema={_viewModel.updateRequestSchema}
  updateSchema={_viewModel.updateSchema}
  onUpdateVariables={_viewModel.updateRequestVariables}
  updateOperationSearch={_viewModel.updateRequestOperationSearch}
  checkQueryErrorStatus={_viewModel.updateQueryErrorState}
  isWebApp={true}
/>
