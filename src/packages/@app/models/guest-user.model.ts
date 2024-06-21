import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const guestUserSchemaLiteral = {
  title: "Guest User Details",
  primaryKey: "id",
  type: "object",
  version: 0,
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    isGuestUser: {
      type: "boolean",
    },
    isBannerActive: {
      type: "boolean",
    },
  },
} as const;

const schemaTyped = toTypedRxJsonSchema(guestUserSchemaLiteral);

export type GuestUserDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const guestUserSchema: RxJsonSchema<GuestUserDocType> =
  guestUserSchemaLiteral;
