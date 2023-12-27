import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const environmentSchemaLiteral = {
  title: "environment",
  primaryKey: "_id",
  type: "object",
  version: 0,
  properties: {
    _id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    variable: {
      type: "array",
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
  required: ["_id", "name", "variable", "type", "createdAt", "createdBy"],
};

const schemaTyped = toTypedRxJsonSchema(environmentSchemaLiteral);
export type EnvironmentDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const enviromentSchema: RxJsonSchema<EnvironmentDocType> =
  environmentSchemaLiteral;
