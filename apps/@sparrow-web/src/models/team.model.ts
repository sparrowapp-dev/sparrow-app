import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const teamSchemaLiteral = {
  title: "team",
  primaryKey: "teamId",
  type: "object",
  version: 4,
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
    hubUrl: {
      type: "string",
    },
    githubUrl: {
      type: "string",
    },
    xUrl: {
      type: "string",
    },
    linkedinUrl: {
      type: "string",
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
          id: {
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
    plan: {
      type: "object",
      properties: {
          id: {
            type: "string",
            maxLength: 100,
          },
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          active: {
            type: "boolean",
          },
          limits: {
            type: "object",
            properties: {
              workspacesPerHub: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  value: {
                    type: "number",
                  },
                },
              },
              testflowPerWorkspace: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  value: {
                    type: "number",
                  },
                },
              },
              blocksPerTestflow: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  value: {
                    type: "number",
                  },
                },
              },
              usersPerHub: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  value: {
                    type: "number",
                  },
                },
              },
              selectiveTestflowRun: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  active: {
                    type: "boolean",
                  },
                },
              },
              activeSync: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  active: {
                    type: "boolean",
                  },
                },
              },
              testflowRunHistory: {
                type: "object",
                properties: {
                  area: {
                    type: "string",
                  },
                  value: {
                    type: "number",
                  },
                },
              },
            },
          },
          createdAt: {
            type: "string",
          },
          updatedAt: {
            type: "string",
          },
          createdBy: {
            type: "string",
          },
          updatedBy: {
            type: "string"
          }
      },
      required: ["id", "name"],
    },
    isOpen: {
      type: "boolean",
      default: false,
    },
    isNewInvite: {
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
