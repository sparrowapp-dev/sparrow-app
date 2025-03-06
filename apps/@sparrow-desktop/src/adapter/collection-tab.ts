import {
    createDeepCopy,
  } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import type { CollectionAuthBaseInterface, CollectionAuthTypeBaseEnum, CollectionBaseInterface } from "@sparrow/common/types/workspace/collection-base";
import type { Auth } from "@sparrow/common/types/workspace/collection-tab";
  
  /**
   * @class - this class makes request tab compatible with backend server
   */
  export class CollectionTabAdapter {
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
      _collection: any,
    ): Tab {
      const collection = createDeepCopy(_collection);
      const adaptedCollection = new InitTab().collection(_collection.id, workspaceId);

      adaptedCollection.updateName(collection.name);
      adaptedCollection.updateDescription(collection.description);
      adaptedCollection.updateAuth(collection.auth as Auth);
      if(collection?.selectedAuthType){
        adaptedCollection.updateState({
          collectionAuthNavigation: collection.selectedAuthType
        });
      }
      adaptedCollection.updateIsSave(true);
      return adaptedCollection.getValue();
    }
  
    /**
     * @description - parse frontend data to backend compatible
     * @param requestTab - request backend data
     * @returns
     */
    public unadapt(_collectionTab: Tab) : Partial<CollectionBaseInterface> {
      const collectionTab = createDeepCopy(_collectionTab) as Tab;
      return {
        selectedAuthType: collectionTab.property.collection?.state.collectionAuthNavigation as CollectionAuthTypeBaseEnum,
        auth: collectionTab.property.collection?.auth as CollectionAuthBaseInterface,
        name: collectionTab.name,
        description : collectionTab.description
      };
    }
  }
  