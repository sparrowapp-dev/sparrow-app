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
import { tabSchema, type TabDocType } from "$lib/models/tab.model";
import {
  tabDocMethods,
  type TabCollectionMethods,
  type TabDocMethods,
  tabCollectionMethods,
} from "$lib/repositories/tab.repository";
import { addRxPlugin } from "rxdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
addRxPlugin(RxDBMigrationPlugin);

export type WorkspaceDocument = RxDocument<WorkspaceDocType>;
export type WorkspaceCollection = RxCollection<WorkspaceDocType>;

export type TabDocument = RxDocument<TabDocType, TabDocMethods>;
export type TabCollection = RxCollection<
  TabDocType,
  TabDocMethods,
  TabCollectionMethods
>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceCollection;
  tab: TabCollection;
};

// define the Rx database type
export type DatabaseType = RxDatabase<DatabaseCollections>;

// create the Rx database
const rxdb: DatabaseType = await createRxDatabase<DatabaseCollections>({
  name: "mydatabase",
  storage: getRxStorageDexie(),
});

// add all collections
const db = await rxdb.addCollections({
  workspace: {
    schema: workspaceSchema,
  },
  tab: {
    schema: tabSchema,
    methods: tabDocMethods,
    statics: tabCollectionMethods,
    migrationStrategies: {
      // data migration from version 0 to version 1
      1: function (oldDoc) {
        return oldDoc;
      },
    },
  },
});

export { rxdb, db };
