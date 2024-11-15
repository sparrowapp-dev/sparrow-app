import { createDeepCopy } from "@sparrow/common/utils";
import { type Path, type Tab } from "@sparrow/common/types/workspace/tab";
import { InitRequestTab } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class GraphqlTabAdapter {
  constructor() {}

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
    adaptedRequest.updateSchema(request.graphql?.schema);
    adaptedRequest.updateAuth(request.graphql?.auth);
    adaptedRequest.updateHeaders(request.graphql?.headers);
    adaptedRequest.updatePath(path);

    return adaptedRequest.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(requestTab: Tab) {
    requestTab = createDeepCopy(requestTab);
    return {
      url: requestTab.property.graphql?.url,
      headers: requestTab.property.graphql?.headers,
      query: requestTab.property.graphql?.query,
      schema: requestTab.property.graphql?.schema,
      auth: requestTab.property.graphql?.auth,
    };
  }
}
