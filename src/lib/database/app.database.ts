import {
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
  type RxDocument,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  workspaceSchema,
  type WorkspaceDocType,
} from "$lib/models/workspace.model";
import {
  collectionSchema,
  type CollectionDocType,
} from "$lib/models/collection.model";

import {
  type ActiveSideBarTabDocType,
  activeSideBarTabSchema,
} from "$lib/models/active-sidebar-tab.model";
import { tabSchema, type TabDocType } from "$lib/models/tab.model";
import { addRxPlugin } from "rxdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import constants from "$lib/utils/constants";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
addRxPlugin(RxDBDevModePlugin);

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);
export type WorkspaceDocument = RxDocument<WorkspaceDocType>;
export type WorkspaceContainer = RxCollection<WorkspaceDocType>;
export type CollectionContainer = RxCollection<CollectionDocType>;
export type CollectionDocument = RxDocument<CollectionDocType>;
// collate all the Rx collections

export type TabDocument = RxDocument<TabDocType>;
export type TabContainer = RxCollection<TabDocType>;
export type ActiveSideBarTabDocument = RxDocument<ActiveSideBarTabDocType>;
export type ActiveSideBarTabContainer = RxCollection<ActiveSideBarTabDocType>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceContainer;
  tab: TabContainer;
  collection: CollectionContainer;
  activesidebartab: ActiveSideBarTabContainer;
};

// define the Rx database type
export type DatabaseType = RxDatabase<DatabaseCollections>;

//RxDB Class
export class RxDB {
  private static instance: RxDB | null = null;
  public rxdb = null;
  private constructor() {}

  public static getInstance(): RxDB {
    if (!RxDB.instance?.rxdb) {
      RxDB.instance = new RxDB();
    }
    return RxDB.instance;
  }

  public async getDb() {
    if (this.rxdb) return { rxdb: this.rxdb };
    // create the Rx database
    this.rxdb = await createRxDatabase<DatabaseCollections>({
      name: constants.RXDB_DB_NAME,
      storage: getRxStorageDexie(),
      ignoreDuplicate: true,
    });

    // add all collections
    await this.rxdb.addCollections({
      workspace: {
        schema: workspaceSchema,
      },
      tab: {
        schema: tabSchema,
        migrationStrategies: {
          // database  migration functions
          1: function (oldDoc: TabDocument) {
            return oldDoc;
          },
        },
      },
      collection: {
        schema: collectionSchema,
      },
      activesidebartab: {
        schema: activeSideBarTabSchema,
      },
    });
    return { rxdb: this.rxdb };
  }

  public async destroyDb(): Promise<void> {
    await this.rxdb.destroy();
    await this.rxdb.remove();
    this.rxdb = null;
    return;
  }
}
