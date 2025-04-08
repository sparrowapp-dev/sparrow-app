import {
    createDeepCopy,
  } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import type { Tab } from "@sparrow/common/types/workspace/tab";
  
  /**
   * @class - this class makes collection tab compatible with collection server
   */
  export class FolderTabAdapter {
    constructor() {}
  
    /**
     * @description - parse server data to tab compatible
     * @param workspaceId - workspace id
     * @param _collection - collection server data s
     * @returns
     */
    public adapt(
      _workspaceId: string,
      _collectionId: string,
      _folder: any,
    ): Tab {
      const folder = createDeepCopy(_folder);
      const adaptedCollection = new InitTab().folder(_folder.id, _workspaceId);
      adaptedCollection.updatePath({
        workspaceId: _workspaceId,
        collectionId: _collectionId
      });

      adaptedCollection.updateName(folder.name);
      adaptedCollection.updateDescription(folder.description);
      adaptedCollection.updateIsSave(true);
      return adaptedCollection.getValue();
    }
  
    /**
     * Parse tab data to server collection compatible
     * @param _collectionTab - collection tab data
     * @returns
     */
    public unadapt(_collectionTab: Tab) : Partial<any> {
      const collectionTab = createDeepCopy(_collectionTab) as Tab;
      return {
        name: collectionTab.name,
        description : collectionTab.description
      };
    }
  }
  