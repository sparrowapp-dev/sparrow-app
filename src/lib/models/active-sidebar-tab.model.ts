import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const activeSideBarTabSchemaLiteral = {
  title: "activesidebartab",
  primaryKey: "activeTabId",
  type: "object",
<<<<<<< HEAD
  version: 4,
=======
  version: 0,
>>>>>>> b605dab95add771bc925459f2c65dffbe2604a6b
  properties: {
    activeTabId: {
      type: "string",
      default: "activeTabId",
      maxlength: 100,
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
