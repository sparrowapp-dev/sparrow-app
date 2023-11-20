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

// define all the Rx collections
export type WorkspaceDocument = RxDocument<WorkspaceDocType>;
export type WorkspaceCollection = RxCollection<WorkspaceDocType>;

// collate all the Rx collections
export type DatabaseCollections = {
  workspace: WorkspaceCollection;
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
});

export { rxdb, db };
