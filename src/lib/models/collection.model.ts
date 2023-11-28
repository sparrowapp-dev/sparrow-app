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
  queryParams: {
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
  request: {
    type: "object",
    properties: requestItems,
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
  primaryKey: "_id",
  type: "object",
  version: 1,
  properties: {
    _id: {
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
  },
} as const;
const schemaTyped = toTypedRxJsonSchema(collectionSchemaLiteral);

export type CollectionDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const collectionSchema: RxJsonSchema<CollectionDocType> =
  collectionSchemaLiteral;
