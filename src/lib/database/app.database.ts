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
import { tabSchema, type TabDocType } from "$lib/models/tab.model";
import { addRxPlugin } from "rxdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
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

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceContainer;
  tab: TabContainer;
  collection: CollectionContainer;
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
    migrationStrategies: {
      // data migration from version 0 to version 1
      1: function (oldDoc) {
        return oldDoc;
      },
    },
  },
  tab: {
    schema: tabSchema,
    migrationStrategies: {
      // data migration from version 0 to version 1
      1: function (oldDoc) {
        return oldDoc;
      },
    },
  },
  collection: {
    schema: collectionSchema,
  },
});

export { rxdb, db };
