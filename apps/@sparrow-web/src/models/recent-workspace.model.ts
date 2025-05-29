import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const recentWorkspaceSchemaLiteral = {
  title: "recentWorkspaces",
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
    description: {
      type: "string",
    },
    workspaceType: {
      type: "string",
    },
    isShared: {
      type: "boolean",
      default: false,
    },
    team: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
        },
        teamName: {
          type: "string",
        },
        hubUrl: {
          type: "string",
        },
      },
    },
    lastVisited: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    createdBy: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },
  },

  required: ["_id", "name"],
} as const;

const schemaTyped = toTypedRxJsonSchema(recentWorkspaceSchemaLiteral);

export type RecentWorkspaceDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const recentWorkspaceSchema: RxJsonSchema<RecentWorkspaceDocType> =
  recentWorkspaceSchemaLiteral;
