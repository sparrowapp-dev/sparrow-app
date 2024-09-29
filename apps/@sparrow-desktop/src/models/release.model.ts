import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const releaseSchemaLiteral = {
  title: "release",
  primaryKey: "id",
  type: "object",
  version: 0,
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    dateCreated: {
      type: "string",
    },
    versionName: {
      type: "string",
    },
    features: {
      type: "string",
    },
  },
} as const;

const schemaTyped = toTypedRxJsonSchema(releaseSchemaLiteral);

export type ReleaseDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const releaseSchema: RxJsonSchema<ReleaseDocType> = releaseSchemaLiteral;
