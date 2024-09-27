import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const featureSwitchSchemaLiteral = {
  title: "Feature Switch Details for enabling and disabling",
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
    isEnabled: {
      type: "boolean",
    },
    createdBy: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
} as const;

const schemaTyped = toTypedRxJsonSchema(featureSwitchSchemaLiteral);

export type FeatureSwitchDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const featureSwitchSchema: RxJsonSchema<FeatureSwitchDocType> =
  featureSwitchSchemaLiteral;
