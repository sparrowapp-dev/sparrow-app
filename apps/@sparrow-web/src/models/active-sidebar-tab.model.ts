import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const activeSideBarTabSchemaLiteral = {
  title: "activesidebartab",
  primaryKey: "activeTabId",
  type: "object",
  version: 0,
  properties: {
    activeTabId: {
      type: "string",
      default: "activeTabId",
      maxLength: 100,
    },
    activeTabName: {
      type: "string",
    },
  },
  required: ["activeTabName"],
} as const;

const schemaTyped = toTypedRxJsonSchema(activeSideBarTabSchemaLiteral);

export type ActiveSideBarTabDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const activeSideBarTabSchema: RxJsonSchema<ActiveSideBarTabDocType> =
  activeSideBarTabSchemaLiteral;
