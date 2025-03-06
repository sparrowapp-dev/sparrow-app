import {
    createDeepCopy,
  } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import type { CollectionAuthBaseInterface, CollectionAuthTypeBaseEnum, CollectionBaseInterface } from "@sparrow/common/types/workspace/collection-base";
import type { Auth } from "@sparrow/common/types/workspace/collection-tab";
  
  /**
   * @class - this class makes collection tab compatible with collection server
   */
  export class CollectionTabAdapter {
    constructor() {}
  
    /**
     * @description - parse server data to tab compatible
     * @param workspaceId - workspace id
     * @param _collection - collection server data s
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
     * Parse tab data to server collection compatible
     * @param _collectionTab - collection tab data
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
  