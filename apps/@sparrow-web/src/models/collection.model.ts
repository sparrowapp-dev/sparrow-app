import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

const SchemaObject = {};
const requestBody = {
  type: {
    type: "string",
  },
  schema: {
    type: "object",
    properties: SchemaObject,
  },
};
const params = {
  name: {
    type: "string",
  },
  description: {
    type: "string",
  },
  required: {
    type: "boolean",
  },
  schema: {
    type: "object",
    properties: SchemaObject,
  },
};
const requestItems = {
  method: {
    type: "string",
  },
  operationId: {
    type: "string",
  },
  url: {
    type: "string",
  },
  body: {
    type: "array",
    properties: requestBody,
  },
  selectedRequestBodyType: {
    type: "string",
  },
  selectedRequestAuthType: {
    type: "string",
  },
  queryParams: {
    type: "array",
    properties: params,
  },
  auth: {
    type: "array",
    properties: params,
  },
  pathParams: {
    type: "array",
    properties: params,
  },
  headers: {
    type: "array",
    properties: params,
  },
};

const websocketItems = {
  url: {
    type: "string",
  },
  message: {
    type: "string",
  },
  selectedWebSocketBodyType: {
    type: "string",
  },
  queryParams: {
    type: "array",
    properties: params,
  },
  headers: {
    type: "array",
    properties: params,
  },
};
const itemsProperties = {
  id: {
    type: "number",
  },
  name: {
    type: "string",
  },
  description: {
    type: "string",
  },
  type: {
    type: "string",
  },
  source: {
    type: "string",
  },
  isDeleted: {
    type: "boolean",
  },
  request: {
    type: "object",
    properties: requestItems,
  },
  websocket: {
    type: "object",
    properties: websocketItems,
  },
  createdAt: {
    type: "date-time",
  },
  updatedAt: {
    type: "date-time",
  },
  createdBy: {
    type: "string",
  },
  updatedBy: {
    type: "string",
  },
};
export const items = {
  type: "array",
  default: [],
  properties: {
    ...itemsProperties,
    items: {
      type: "object",
      properties: itemsProperties,
    },
  },
};

export const collectionSchemaLiteral = {
  title: "collection",
  primaryKey: "id",
  type: "object",
  version: 7,
  properties: {
    collectionId: {
      type: "string",
      maxLength: 100,
    },
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    totalRequests: {
      type: "number",
    },
    items,
    uuid: {
      type: "string",
    },
    activeSync: {
      type: "boolean",
    },
    activeSyncUrl: {
      type: "string",
    },
    localRepositoryPath: {
      type: "string",
    },
    workspaceId: {
      type: "string",
      maxLength: 100,
    },
    branches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
        },
      },
    },
    primaryBranch: { type: "string" },
    currentBranch: { type: "string" },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "date-time",
    },
    createdBy: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },
  },
} as const;
const schemaTyped = toTypedRxJsonSchema(collectionSchemaLiteral);

export type CollectionDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const collectionSchema: RxJsonSchema<CollectionDocType> =
  collectionSchemaLiteral;
