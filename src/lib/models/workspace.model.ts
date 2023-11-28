import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const workspaceSchemaLiteral = {
  title: "workspace",
  primaryKey: "_id",
  type: "object",
  version: 2,
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
      maxItems: 5,
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          role: {
            type: "string",
          },
          id: {
            type: "number",
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
    isActiveWorkspace: {
      type: "boolean",
      default: false,
    },
    collections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
          },
          name: {
            type: "string",
          },
        },
      },
    },
  },
  required: ["_id", "name", "owner", "permissions", "createdAt", "createdBy"],
} as const;

const schemaTyped = toTypedRxJsonSchema(workspaceSchemaLiteral);

export type WorkspaceDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const workspaceSchema: RxJsonSchema<WorkspaceDocType> =
  workspaceSchemaLiteral;
