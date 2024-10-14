import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const updatesSchemaLiteral = {
  title: "Workspace Updates details",
  primaryKey: "workspaceId",
  type: "object",
  version: 0,
  properties: {
    workspaceId: {
      type: "string",
    },
    pageNumber: {
      type: "string",
    },
    updates: {
      type: "array",
      default: [],
      properties: {
        message: {
          type: "string",
        },
        workspaceId: {
          type: "string",
        },
        detailsUpdatedBy: {
          type: "string",
        },
        createdBy: {
          type: "string",
        },
        createdAt: {
          type: "string",
          format: "date-time",
        },
      },
    },
  },
} as const;

const schemaTyped = toTypedRxJsonSchema(updatesSchemaLiteral);

export type UpdatesDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const updatesSchema: RxJsonSchema<UpdatesDocType> = updatesSchemaLiteral;
