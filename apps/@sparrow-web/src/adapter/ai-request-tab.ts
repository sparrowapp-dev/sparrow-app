import { createDeepCopy } from "@sparrow/common/utils";
import { InitAiRequestTab } from "@sparrow/common/utils";
import {
  TabPersistenceTypeEnum,
  type Tab,
  type Path,
} from "@sparrow/common/types/workspace/tab";
import { AiRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/ai-request-base";

/**
 * @class - this class makes ai request tab compatible with backend server
 */
export class AiRequestTabAdapter {
  constructor() {}

  private setAuthType = (
    auth: AiRequestAuthTypeBaseEnum,
  ): AiRequestAuthTypeBaseEnum => {
    let aiAuthNavigation = AiRequestAuthTypeBaseEnum.NO_AUTH;
    switch (auth) {
      case AiRequestAuthTypeBaseEnum.NO_AUTH:
        aiAuthNavigation = AiRequestAuthTypeBaseEnum.NO_AUTH;
        break;
      case AiRequestAuthTypeBaseEnum.API_KEY:
        aiAuthNavigation = AiRequestAuthTypeBaseEnum.API_KEY;
        break;
      case AiRequestAuthTypeBaseEnum.BASIC_AUTH:
        aiAuthNavigation = AiRequestAuthTypeBaseEnum.BASIC_AUTH;
        break;
      case AiRequestAuthTypeBaseEnum.BEARER_TOKEN:
        aiAuthNavigation = AiRequestAuthTypeBaseEnum.BEARER_TOKEN;
        break;
      case AiRequestAuthTypeBaseEnum.INHERIT_AUTH:
        aiAuthNavigation = AiRequestAuthTypeBaseEnum.INHERIT_AUTH;
        break;
      case AiRequestAuthTypeBaseEnum.AUTH_PROFILES:
        aiAuthNavigation = AiRequestAuthTypeBaseEnum.AUTH_PROFILES;
        break;
    }
    return aiAuthNavigation;
  };

  private unsetAuthType = (
    auth: AiRequestAuthTypeBaseEnum,
  ): AiRequestAuthTypeBaseEnum => {
    let authType = AiRequestAuthTypeBaseEnum.NO_AUTH;
    switch (auth) {
      case AiRequestAuthTypeBaseEnum.NO_AUTH:
        authType = AiRequestAuthTypeBaseEnum.NO_AUTH;
        break;
      case AiRequestAuthTypeBaseEnum.API_KEY:
        authType = AiRequestAuthTypeBaseEnum.API_KEY;
        break;
      case AiRequestAuthTypeBaseEnum.BASIC_AUTH:
        authType = AiRequestAuthTypeBaseEnum.BASIC_AUTH;
        break;
      case AiRequestAuthTypeBaseEnum.BEARER_TOKEN:
        authType = AiRequestAuthTypeBaseEnum.BEARER_TOKEN;
        break;
      case AiRequestAuthTypeBaseEnum.INHERIT_AUTH:
        authType = AiRequestAuthTypeBaseEnum.INHERIT_AUTH;
        break;
      case AiRequestAuthTypeBaseEnum.AUTH_PROFILES:
        authType = AiRequestAuthTypeBaseEnum.AUTH_PROFILES;
        break;
    }
    return authType;
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
    const adaptedAiRequest = new InitAiRequestTab(request.id, workspaceId);
    const path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
    };
    adaptedAiRequest.updateName(request.name);
    adaptedAiRequest.updateDescription(request.description);
    adaptedAiRequest.updateAIModelProvider(request.aiRequest?.aiModelProvider);
    adaptedAiRequest.updateAIModelVariant(request.aiRequest?.aiModelVariant);
    adaptedAiRequest.updateAISystemPrompt(request.aiRequest?.systemPrompt);
    // adaptedAiRequest.updateAIConfigurations(request.aiRequest?.configurations);
    adaptedAiRequest.updateAiRequestVariables(request.aiRequest?.variables);
    adaptedAiRequest.updateAuth(request.aiRequest?.auth);
    adaptedAiRequest.updatePath(path);
    adaptedAiRequest.updateTabType(TabPersistenceTypeEnum.PERMANENT);

    // parsing request auth
    const selectedAuthType = request.aiRequest?.selectedAuthType;
    if (selectedAuthType) {
      const AuthType = this.setAuthType(request.aiRequest?.selectedAuthType);
      adaptedAiRequest.updateState({
        aiAuthNavigation: AuthType,
      });
    }

    // parsing request auth profile id
    const selectedRequestAuthProfileId =
      request.aiRequest?.selectedRequestAuthProfileId;
    if (selectedRequestAuthProfileId) {
      const authProfileId = request.aiRequest?.selectedRequestAuthProfileId;
      adaptedAiRequest.updateState({
        selectedRequestAuthProfileId: authProfileId,
      });
    }

    return adaptedAiRequest.getValue();
  }

  public unadapt(requestTab: Tab) {
    requestTab = createDeepCopy(requestTab);
    return {
      aiModelProvider: requestTab.property.aiRequest?.aiModelProvider,
      aiModelVariant: requestTab.property.aiRequest?.aiModelVariant,
      systemPrompt: requestTab.property.aiRequest?.systemPrompt,
      variables: requestTab.property.aiRequest?.variables,
      auth: requestTab.property.aiRequest?.auth,
      selectedAuthType: this.unsetAuthType(
        requestTab.property.aiRequest?.state
          ?.aiAuthNavigation as AiRequestAuthTypeBaseEnum,
      ),
      selectedRequestAuthProfileId:
        requestTab.property.aiRequest?.state?.selectedRequestAuthProfileId,
    };
  }
}
