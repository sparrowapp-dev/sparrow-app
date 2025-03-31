import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
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

export const tabSchemaLiteral = {
  title: "Opened tabs that will be shown on dashboard",
  primaryKey: "tabId",
  type: "object",
  version: 4,
  properties: {
    tabId: {
      // ---- RxDocumentId
      type: "string",
      maxLength: 100,
    },
    id: {
      // ---- MongoDocumentId
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    isDeleted: {
      type: "boolean",
    },
    activeSync: {
      type: "boolean",
    },
    source: {
      type: "string",
    },
    type: {
      type: "string",
    },
    persistence: {
      type: "string",
    },
    property: {
      type: "object",
      properties: {
        request: {
          type: "object",
          properties: {
            method: {
              type: "string",
            },
            body: {
              type: "object",
              properties: {
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
                      base: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            url: {
              type: "string",
            },
            headers: {
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
            queryParams: {
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
            autoGeneratedHeaders: {
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
            response: {
              type: "object",
              properties: {
                headers: {
                  type: "string",
                },
                status: {
                  type: "string",
                },
                body: {
                  type: "string",
                },
                size: {
                  type: "number",
                },
                time: {
                  type: "number",
                },
              },
            },
            state: {
              type: "object",
              properties: {
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
                requestLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestRightSplitterWidthPercentage: {
                  type: "number",
                },
                isExposeEditDescription: {
                  type: "boolean",
                },
                isSendRequestInProgress: {
                  type: "boolean",
                  default: false,
                },
                isSaveDescriptionInProgress: {
                  type: "boolean",
                  default: false,
                },
                isSaveRequestInProgress: {
                  type: "boolean",
                },
                isParameterBulkEditActive: {
                  type: "boolean",
                },
                isHeaderBulkEditActive: {
                  type: "boolean",
                },
                isChatbotActive: {
                  type: "boolean",
                },
                isChatbotSuggestionsActive: {
                  type: "boolean",
                },
                isChatbotGeneratingResponse: {
                  type: "boolean",
                },
                isDocAlreadyGenerated: {
                  type: "boolean",
                },
                isDocGenerating: {
                  type: "boolean",
                },
              },
            },
            auth: {
              type: "object",
              properties: {
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
              },
            },
            ai: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                },
                threadId: {
                  type: "string",
                },
                conversations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      messageId: {
                        type: "string",
                      },
                      message: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                      },
                      isLiked: {
                        type: "boolean",
                      },
                      isDisliked: {
                        type: "boolean",
                      },
                      status: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        savedRequest: {
          type: "object",
          properties: {
            method: {
              type: "string",
            },
            body: {
              type: "object",
              properties: {
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
                      base: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            responseBody: {
              type: "string",
            },
            url: {
              type: "string",
            },
            responseStatus: {
              type: "string",
            },
            responseDate: {
              type: "string",
            },
            headers: {
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
            responseHeaders: {
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
            queryParams: {
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
            autoGeneratedHeaders: {
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
            state: {
              type: "object",
              properties: {
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
                requestLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestRightSplitterWidthPercentage: {
                  type: "number",
                },
                isExposeEditDescription: {
                  type: "boolean",
                },
                isSendRequestInProgress: {
                  type: "boolean",
                  default: false,
                },
                isSaveDescriptionInProgress: {
                  type: "boolean",
                  default: false,
                },
                isSaveRequestInProgress: {
                  type: "boolean",
                },
                isParameterBulkEditActive: {
                  type: "boolean",
                },
                isHeaderBulkEditActive: {
                  type: "boolean",
                },
              },
            },
            auth: {
              type: "object",
              properties: {
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
              },
            },
            ai: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                },
                threadId: {
                  type: "string",
                },
                conversations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      messageId: {
                        type: "string",
                      },
                      message: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                      },
                      isLiked: {
                        type: "boolean",
                      },
                      isDisliked: {
                        type: "boolean",
                      },
                      status: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        folder: {
          type: "string",
        },
        collection: {
          type: "object",
          properties: {
            auth: {
              type: "object",
              properties: {
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
              },
            },
            state: {
              type: "object",
              properties: {
                collectionAuthNavigation: {
                  type: "string",
                },
                collectionNavigation: {
                  type: "string",
                },
              },
            },
          },
        },
        workspace: {
          type: "string",
        },
        graphql: {
          type: "object",
          properties: {
            url: {
              type: "string",
            },
            query: {
              type: "string",
            },
            schema: {
              type: "string",
            },
            headers: {
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
            variables: {
              type: "string",
            },
            autoGeneratedHeaders: {
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
            operationSearch: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                requestNavigation: {
                  type: "string",
                },
                operationNavigation: {
                  type: "string",
                },
                requestAuthNavigation: {
                  type: "string",
                },
                requestLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestRightSplitterWidthPercentage: {
                  type: "number",
                },
                requestBuilderLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestBuilderRightSplitterWidthPercentage: {
                  type: "number",
                },
                isHeaderBulkEditActive: {
                  type: "boolean",
                },
                isRequestSchemaFetched: {
                  type: "boolean",
                },
              },
            },
            auth: {
              type: "object",
              properties: {
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
                  },
                },
              },
            },
          },
        },
        environment: {
          type: "object",
          properties: {
            variable: {
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
                required: ["key", "value", "checked"],
              },
            },
            type: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                isSaveInProgress: {
                  type: "boolean",
                },
              },
              required: ["isSaveInProgress"],
            },
          },
          required: ["variable", "type", "state"],
        },
        websocket: {
          type: "object",
          properties: {
            url: {
              type: "string",
            },
            headers: {
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
            queryParams: {
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
            autoGeneratedHeaders: {
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
            message: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                socketNavigation: {
                  type: "string",
                },
                socketMessageLanguage: {
                  type: "string",
                },
                socketLeftSplitterWidthPercentage: {
                  type: "string",
                },
                socketRightSplitterWidthPercentage: {
                  type: "string",
                },
                isSaveSocketInProgress: {
                  type: "string",
                },
                isParameterBulkEditActive: {
                  type: "string",
                },
                isHeaderBulkEditActive: {
                  type: "string",
                },
              },
            },
          },
        },
        socketio: {
          type: "object",
          properties: {
            url: {
              type: "string",
            },
            headers: {
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
            queryParams: {
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
            autoGeneratedHeaders: {
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
            message: {
              type: "string",
            },
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  event: {
                    type: "string",
                  },
                  listen: {
                    type: "boolean",
                  },
                },
                required: ["event", "listen"],
              },
            },
            eventName: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                requestNavigation: {
                  type: "string",
                },
                messageLanguage: {
                  type: "string",
                },
                leftSplitterWidthPercentage: {
                  type: "string",
                },
                rightSplitterWidthPercentage: {
                  type: "string",
                },
                isSaveInProgress: {
                  type: "string",
                },
                isParameterBulkEditActive: {
                  type: "string",
                },
                isHeaderBulkEditActive: {
                  type: "string",
                },
              },
            },
          },
          required: [
            "url",
            "headers",
            "state",
            "eventName",
            "events",
            "message",
            "autoGeneratedHeaders",
            "queryParams",
          ],
        },
        testflow: {
          type: "object",
          properties: {
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
                      name: {
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
          },
        },
      },
    },
    isActive: {
      type: "boolean",
    },
    isSaved: {
      type: "boolean",
    },
    path: {
      type: "object",
      properties: {
        workspaceId: {
          type: "string",
        },
        collectionId: {
          type: "string",
        },
        folderId: {
          type: "string",
        },
      },
    },
    timestamp: {
      type: "string",
      maxLength: 100,
    },
    index: {
      type: "number",
    },
  },
  required: ["id", "name", "property"],
  indexes: ["timestamp"],
} as const;

const schemaTyped = toTypedRxJsonSchema(tabSchemaLiteral);

export type TabDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const tabSchema: RxJsonSchema<TabDocType> = tabSchemaLiteral;
