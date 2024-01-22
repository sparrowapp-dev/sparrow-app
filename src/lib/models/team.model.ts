import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const teamSchemaLiteral = {
  title: "team",
  primaryKey: "teamId",
  type: "object",
  version: 1,
  properties: {
    teamId: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    logo: {
      type: "object",
    },
    workspaces: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          workspaceId: {
            type: "string",
          },
          name: {
            type: "string",
          },
        },
      },
    },
    users: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
          email: {
            type: "string",
          },
          name: {
            type: "string",
          },
          role: {
            type: "string",
          },
        },
      },
    },
    owner: {
      type: "string",
    },
    admins: {
      type: "array",
      items: {
        type: "string",
      },
    },
    isActiveTeam: {
      type: "boolean",
      default: false,
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
  required: ["teamId", "name", "createdAt", "createdBy"],
} as const;

const schemaTyped = toTypedRxJsonSchema(teamSchemaLiteral);

export type TeamDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const teamSchema: RxJsonSchema<TeamDocType> = teamSchemaLiteral;
