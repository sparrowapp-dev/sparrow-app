import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxCollection,
  type RxDocument,
  type RxJsonSchema,
} from "rxdb";

const TestflowSchemaLiteral = {
  title: "Testflow",
  primaryKey: "_id",
  type: "object",
  version: 0,
  properties: {
    _id: {
      type: "string",
      maxLength: 100,
    },
    workspaceId: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },

    nodes: {
      type: "array",
      default: [],
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          type: {
            type: "string",
          },
          data: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              collectionId: {
                type: "string",
              },
              folderId: {
                type: "string",
              },
              requestId: {
                type: "string",
              },
              method: {
                type: "string",
              },
            },
            required: [
              "name",
              "collectionId",
              "folderId",
              "requestId",
              "method",
            ],
          },
          position: {
            type: "object",
            properties: {
              x: {
                type: "number",
              },
              y: {
                type: "number",
              },
            },
            required: ["x", "y"],
          },
        },
        required: ["id", "type", "data", "position"],
      },
    },
    edges: {
      type: "array",
      default: [],
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          source: {
            type: "string",
          },
          target: {
            type: "string",
          },
        },
        required: ["id", "source", "target"],
      },
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    createdBy: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },
  },
  required: [
    "_id",
    "workspaceId",
    "name",
    "nodes",
    "edges",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ],
} as const;

const schemaTyped = toTypedRxJsonSchema(TestflowSchemaLiteral);
export type TFRxDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;
export type TFRxHandlerType = RxDocument<TFRxDocumentType>;
export type TFRxContainerType = RxCollection<TFRxDocumentType>;

export const TestflowSchema: RxJsonSchema<TFRxDocumentType> =
  TestflowSchemaLiteral;
