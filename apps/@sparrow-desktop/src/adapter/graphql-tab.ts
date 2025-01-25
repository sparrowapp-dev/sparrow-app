import { createDeepCopy } from "@sparrow/common/utils";
import { type Path, type Tab } from "@sparrow/common/types/workspace/tab";
import { InitTab } from "@sparrow/common/factory";
import { GraphqlRequestAuthTypeTabEnum } from "@sparrow/common/types/workspace/graphql-request-tab";
import { GraphqlRequestAuthModeBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
import type { GraphqlRequestMetaDataDtoInterface } from "@sparrow/common/types/workspace/graphql-request-dto";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class GraphqlTabAdapter {
  constructor() {}

  private unsetAuthType = (
    auth: GraphqlRequestAuthTypeTabEnum,
  ): GraphqlRequestAuthModeBaseEnum => {
    let authType = GraphqlRequestAuthModeBaseEnum.NO_AUTH;
    switch (auth) {
      case GraphqlRequestAuthTypeTabEnum.NO_AUTH:
        authType = GraphqlRequestAuthModeBaseEnum.NO_AUTH;
        break;
      case GraphqlRequestAuthTypeTabEnum.API_KEY:
        authType = GraphqlRequestAuthModeBaseEnum.API_KEY;
        break;
      case GraphqlRequestAuthTypeTabEnum.BASIC_AUTH:
        authType = GraphqlRequestAuthModeBaseEnum.BASIC_AUTH;
        break;
      case GraphqlRequestAuthTypeTabEnum.BEARER_TOKEN:
        authType = GraphqlRequestAuthModeBaseEnum.BEARER_TOKEN;
        break;
    }
    return authType;
  };

  private setAuthType = (
    auth: GraphqlRequestAuthModeBaseEnum,
  ): GraphqlRequestAuthTypeTabEnum => {
    let requestAuthNavigation = GraphqlRequestAuthTypeTabEnum.NO_AUTH;
    switch (auth) {
      case GraphqlRequestAuthModeBaseEnum.NO_AUTH:
        requestAuthNavigation = GraphqlRequestAuthTypeTabEnum.NO_AUTH;
        break;
      case GraphqlRequestAuthModeBaseEnum.API_KEY:
        requestAuthNavigation = GraphqlRequestAuthTypeTabEnum.API_KEY;
        break;
      case GraphqlRequestAuthModeBaseEnum.BASIC_AUTH:
        requestAuthNavigation = GraphqlRequestAuthTypeTabEnum.BASIC_AUTH;
        break;
      case GraphqlRequestAuthModeBaseEnum.BEARER_TOKEN:
        requestAuthNavigation = GraphqlRequestAuthTypeTabEnum.BEARER_TOKEN;
        break;
    }
    return requestAuthNavigation;
  };

  /**
   * @description - parse backend data to frontend compatible
   * @param workspaceId - workspace id
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request tab frontend data
   * @returns
   */
  public adapt(
    workspaceId: string,
    collectionId: string,
    folderId: string,
    request: any,
  ): Tab {
    request = createDeepCopy(request);
    const adaptedRequest = new InitTab().graphQl(request.id, workspaceId);
    const path: Path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
    };
    adaptedRequest.updateName(request.name);
    adaptedRequest.updateDescription(request.description);
    adaptedRequest.updateUrl(request.graphql?.url);
    adaptedRequest.updateQuery(request.graphql?.query);
    adaptedRequest.updateMutation(request.graphql?.mutation);
    adaptedRequest.updateSchema(request.graphql?.schema);
    adaptedRequest.updateVariables(request.graphql?.variables);
    adaptedRequest.updateAuth(request.graphql?.auth);
    adaptedRequest.updateHeaders(request.graphql?.headers);
    adaptedRequest.updatePath(path);
    const AuthType = this.setAuthType(request.graphql?.selectedGraphqlAuthType);
    adaptedRequest.updateState({
      requestAuthNavigation: AuthType,
    });
    return adaptedRequest.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(requestTab: Tab): GraphqlRequestMetaDataDtoInterface {
    requestTab = createDeepCopy(requestTab);
    return {
      url: requestTab.property.graphql?.url,
      headers: requestTab.property.graphql?.headers,
      query: requestTab.property.graphql?.query,
      mutation: requestTab.property.graphql?.mutation,
      schema: requestTab.property.graphql?.schema,
      variables: requestTab.property.graphql?.variables,
      auth: requestTab.property.graphql?.auth,
      selectedGraphqlAuthType: this.unsetAuthType(
        requestTab.property?.graphql?.state
          ?.requestAuthNavigation as GraphqlRequestAuthTypeTabEnum,
      ),
    };
  }
}
