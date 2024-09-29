import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const environmentTabSchemaLiteral = {
  title: "environment",
  primaryKey: "environmentId",
  type: "object",
  version: 3,
  properties: {
    // ---- RxDocumentId
    environmentId: {
      type: "string",
      maxLength: 100,
    },
    // ---- MongoDocumentId
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    variable: {
      type: "array",
      default: [],
      items: {
        type: "object",
        properties: {
          key: {
            type: "string",
          },
          value: {
            type: "string",
          },
          checked: {
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
    isSave: {
      type: "boolean",
    },
    isSaveInProgress: {
      type: "boolean",
    },
    workspaceId: {
      type: "string",
    },
    timestamp: {
      type: "string",
    },
  },
} as const;

const schemaTyped = toTypedRxJsonSchema(environmentTabSchemaLiteral);
export type EnvironmentTabDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const environmentTabSchema: RxJsonSchema<EnvironmentTabDocType> =
  environmentTabSchemaLiteral;
