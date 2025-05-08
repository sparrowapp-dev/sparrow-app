import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxCollection,
  type RxDocument,
  type RxJsonSchema,
} from "rxdb";

const requestBody = {
  raw: {
    type: "string",
  },
  urlencoded: {
    type: "array",
    items: {
      type: "object",
      properties: {
        key: {
          type: "string",
        },
        value: {
          type: "string",
        },
        checked: {
          type: "boolean",
        },
      },
    },
  },
  formdata: {
    type: "object",
    properties: {
      text: {
        type: "array",
        properties: {
          key: {
            type: "string",
          },
          value: {
            type: "string",
          },
          checked: {
            type: "boolean",
          },
        },
      },
      file: {
        type: "array",
        properties: {
          key: {
            type: "string",
          },
          value: {
            type: "string",
          },
          checked: {
            type: "boolean",
          },
          base: {
            type: "string",
          },
        },
      },
    },
  },
};

const params = {
  key: {
    type: "string",
  },
  value: {
    type: "string",
  },
  checked: {
    type: "boolean",
  },
};

const httpRequestAuth = {
  bearerToken: {
    type: "string",
  },
  basicAuth: {
    type: "object",
    properties: {
      username: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
  apiKey: {
    type: "object",
    properties: {
      authKey: {
        type: "string",
      },
      authValue: {
        type: "string",
      },
      addTo: {
        type: "string",
      },
    },
  },
};

const requestItems = {
  name: {
    type: "string",
  },
  method: {
    type: "string",
  },
  operationId: {
    type: "string",
  },
  url: {
    type: "string",
  },
  body: {
    type: "array",
    properties: requestBody,
  },
  selectedRequestBodyType: {
    type: "string",
  },
  selectedRequestAuthType: {
    type: "string",
  },
  queryParams: {
    type: "array",
    properties: params,
  },
  auth: {
    type: "object",
    properties: httpRequestAuth,
  },
  headers: {
    type: "array",
    properties: params,
  },
};

const TestflowSchemaLiteral = {
  title: "Testflow",
  primaryKey: "_id",
  type: "object",
  version: 1,
  properties: {
    _id: {
      type: "string",
      maxLength: 100,
    },
    workspaceId: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },

    nodes: {
      type: "array",
      default: [],
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          type: {
            type: "string",
          },
          data: {
            type: "object",
            properties: {
              blockName: {
                type: "string",
              },
              workspaceId: {
                type: "string",
              },
              collectionId: {
                type: "string",
              },
              folderId: {
                type: "string",
              },
              requestId: {
                type: "string",
              },
              requestData: {
                type: "object",
                properties: requestItems,
              },
              isDeleted: {
                type: "boolean",
              },
            },
            required: [
              "name",
              "collectionId",
              "folderId",
              "requestId",
              "method",
            ],
          },
          position: {
            type: "object",
            properties: {
              x: {
                type: "number",
              },
              y: {
                type: "number",
              },
            },
            required: ["x", "y"],
          },
        },
        required: ["id", "type", "data", "position"],
      },
    },
    edges: {
      type: "array",
      default: [],
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          source: {
            type: "string",
          },
          target: {
            type: "string",
          },
        },
        required: ["id", "source", "target"],
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
  required: [
    "_id",
    "workspaceId",
    "name",
    "nodes",
    "edges",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ],
} as const;

const schemaTyped = toTypedRxJsonSchema(TestflowSchemaLiteral);
export type TFRxDocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;
export type TFRxHandlerType = RxDocument<TFRxDocumentType>;
export type TFRxContainerType = RxCollection<TFRxDocumentType>;

export const TestflowSchema: RxJsonSchema<TFRxDocumentType> =
  TestflowSchemaLiteral;
