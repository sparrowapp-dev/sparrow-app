import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const guideSchemaLiteral = {
  title: "User guide",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    isActive: {
      type: "boolean",
    },
  },
  required: ["id", "isActive"],
} as const;
const schemaTyped = toTypedRxJsonSchema(guideSchemaLiteral);

export type GuideDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const guideSchema: RxJsonSchema<GuideDocType> = guideSchemaLiteral;
