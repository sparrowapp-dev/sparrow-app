import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const environmentSchemaLiteral = {
  title: "environment",
  primaryKey: "id",
  type: "object",
  version: 3,
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    environmentId: {
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

const schemaTyped = toTypedRxJsonSchema(environmentSchemaLiteral);
export type EnvironmentDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const environmentSchema: RxJsonSchema<EnvironmentDocType> =
  environmentSchemaLiteral;
