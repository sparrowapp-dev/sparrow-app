import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const TestflowSchemaLiteral = {
  title: "Testflow",
  primaryKey: "id",
  type: "object",
  version: 0,
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    TestflowId: {
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
          },
        },
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
            type: "boolean",
          },
        },
      },
    },
    type: {
      type: "string",
    },
    isActive: {
      type: "boolean",
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
} as const;

const schemaTyped = toTypedRxJsonSchema(TestflowSchemaLiteral);
export type TestflowDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const TestflowSchema: RxJsonSchema<TestflowDocType> =
  TestflowSchemaLiteral;
