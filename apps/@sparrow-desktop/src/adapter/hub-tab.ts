import { createDeepCopy } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import type { Tab } from "@sparrow/common/types/workspace/tab";

/**
 * @class - this class makes history tab compatible with collection server
 */
export class HubTabAdapter {
  constructor() {}

  /**
   * @description - parse server data to tab compatible
   * @param workspaceId - workspace id
   * @param _teamId - Team
   * @returns
   */
  public adapt(_workspaceId: string, _teamId: string): Tab {
    const adaptedHub = new InitTab().hub(_teamId, _workspaceId);
    adaptedHub.updatePath({
      workspaceId: _workspaceId,
    });
    adaptedHub.updateIsSave(true);
    return adaptedHub.getValue();
  }

  /**
   * Parse tab data to server collection compatible
   * @param _collectionTab - collection tab data
   * @returns
   */
  public unadapt(_collectionTab: Tab): Partial<any> {
    const collectionTab = createDeepCopy(_collectionTab) as Tab;
    return {
      name: collectionTab.name,
      description: collectionTab.description,
    };
  }
}
