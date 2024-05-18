import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const windowSettingsSchemaLiteral = {
  title: "windowsettings",
  primaryKey: "prop",
  type: "object",
  version: 0,
  properties: {
    prop: {
      type: "string",
      maxLength: 100,
    },
    value: {
      type: "string",
      maxLength: 100,
    },
  },
  required: ["prop", "value"],
} as const;

const schemaTyped = toTypedRxJsonSchema(windowSettingsSchemaLiteral);

export type WindowSettingsDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const windowSettingsSchema: RxJsonSchema<WindowSettingsDocType> =
  windowSettingsSchemaLiteral;
