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

const stateItems = {
  requestBodyLanguage: {
    type: "string",
  },
  requestBodyNavigation: {
    type: "string",
  },
  requestAuthNavigation: {
    type: "string",
  },
  requestNavigation: {
    type: "string",
  },
  responseNavigation: {
    type: "string",
  },
  responseBodyLanguage: {
    type: "string",
  },
  responseBodyFormatter: {
    type: "string",
  },
  requestExtensionNavigation: {
    type: "string",
  },
  requestLeftSplitterWidthPercentage: "number",
  requestRightSplitterWidthPercentage: "number",
  isExposeEditDescription: "boolean",
  isSendRequestInProgress: "boolean",
  isSaveDescriptionInProgress: "boolean",
  isSaveRequestInProgress: "boolean",
  isParameterBulkEditActive: "boolean",
  isHeaderBulkEditActive: "boolean",
  isChatbotActive: "boolean",
  isChatbotSuggestionsActive: "boolean",
  isChatbotGeneratingResponse: "boolean",
  isDocGenerating: "boolean",
  isDocAlreadyGenerated: "boolean",
};

const requestItems = {
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
  state: {
    type: "object",
    properties: stateItems,
  },
};

const itemsProperties = {
  id: {
    type: "number",
  },
  name: {
    type: "string",
  },
  description: {
    type: "string",
  },
  type: {
    type: "string",
  },
  source: {
    type: "string",
  },
  isDeleted: {
    type: "boolean",
  },
  request: {
    type: "object",
    properties: requestItems,
  },
  createdAt: {
    type: "date-time",
  },
  updatedAt: {
    type: "date-time",
  },
  createdBy: {
    type: "string",
  },
  updatedBy: {
    type: "string",
  },
};

const TestflowSchemaLiteral = {
  title: "Testflow",
  primaryKey: "_id",
  type: "object",
  version: 0,
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
          blockName: {
            type: "string",
          },
          type: {
            type: "string",
          },
          data: {
            type: "object",
            properties: {
              name: {
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
              method: {
                type: "string",
              },
              requestData: {
                type: "object",
                properties: itemsProperties,
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
