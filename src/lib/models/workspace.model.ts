import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const productSchemaLiteral = {
  title: "product",
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
    owner: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
        type: {
          type: "string",
        },
      },
    },
    permissions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: {
            type: "string",
          },
          id: {
            type: "string",
          },
        },
      },
    },
    collection: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          id: {
            type: "string",
          },
        },
      },
    },
    createdAt: {
      type: "string",
    },
    createdBy: {
      type: "string",
    },
  },
} as const;

const schemaTyped = toTypedRxJsonSchema(productSchemaLiteral);

export type ProductDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const workspaceSchema: RxJsonSchema<ProductDocType> =
  productSchemaLiteral;
