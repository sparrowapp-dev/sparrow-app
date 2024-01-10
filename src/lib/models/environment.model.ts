import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const environmentSchemaLiteral = {
  title: "environment",
  primaryKey: {
    // where should the composed string be stored
    key: "environmentId",
    // fields that will be used to create the composed key
    fields: ["createdAt"],
    // separator which is used to concat the fields values.
    separator: "|",
  },
  type: "object",
  version: 2,
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
