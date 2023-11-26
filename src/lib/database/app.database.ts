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

// define all the Rx collections
export type WorkspaceDocument = RxDocument<WorkspaceDocType>;
export type WorkspaceCollection = RxCollection<WorkspaceDocType>;
export type CollectionCollection = RxCollection<CollectionDocType>;
export type CollectionDocument = RxDocument<CollectionDocType>;
// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceCollection;
  collection: CollectionCollection;
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
  collection: {
    schema: collectionSchema,
  },
});

export { rxdb, db };
