import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const planSchemaLiteral = {
  title: "plan",
  primaryKey: "planId",
  type: "object",
  version: 5,
  properties: {
    planId: {
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
      type: "string",
    },
  },
  required: ["planId", "name", "active", "limits", "createdAt", "createdBy"],
} as const;

const planSchemaTyped = toTypedRxJsonSchema(planSchemaLiteral);
export type PlanDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof planSchemaTyped
>;

export const planSchema: RxJsonSchema<PlanDocType> = planSchemaLiteral;
