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
const graphqlRequestAuth = {
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

const websocketItems = {
  url: {
    type: "string",
  },
  message: {
    type: "string",
  },
  selectedWebSocketBodyType: {
    type: "string",
  },
  queryParams: {
    type: "array",
    properties: params,
  },
  headers: {
    type: "array",
    properties: params,
  },
};
const socketIoEvents = {
  event: {
    type: "string",
  },
  listen: {
    type: "boolean",
  },
};
const socketioItems = {
  url: {
    type: "string",
  },
  message: {
    type: "string",
  },
  selectedSocketIOBodyType: {
    type: "string",
  },
  queryParams: {
    type: "array",
    properties: params,
  },
  headers: {
    type: "array",
    properties: params,
  },
  events: {
    type: "array",
    properties: socketIoEvents,
  },
};

const graphqlItems = {
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
    properties: params,
  },
  auth: {
    type: "object",
    properties: graphqlRequestAuth,
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
  websocket: {
    type: "object",
    properties: websocketItems,
  },
  socketio: {
    type: "object",
    properties: socketioItems,
  },
  graphql: {
    type: "object",
    properties: graphqlItems,
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
export const items = {
  type: "array",
  default: [],
  properties: {
    ...itemsProperties,
    items: {
      type: "object",
      properties: itemsProperties,
    },
  },
};

export const collectionSchemaLiteral = {
  title: "collection",
  primaryKey: "id",
  type: "object",
  version: 11,
  properties: {
    collectionId: {
      type: "string",
      maxLength: 100,
    },
    description: {
      type: "string",
    },
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    totalRequests: {
      type: "number",
    },
    items,
    uuid: {
      type: "string",
    },
    activeSync: {
      type: "boolean",
    },
    activeSyncUrl: {
      type: "string",
    },
    localRepositoryPath: {
      type: "string",
    },
    workspaceId: {
      type: "string",
      maxLength: 100,
    },
    branches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
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
    selectedAuthType: {
      type: "string",
    },
    primaryBranch: { type: "string" },
    currentBranch: { type: "string" },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "date-time",
    },
    syncedAt: {
      type: "date-time",
    },
    createdBy: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },
  },
} as const;
const schemaTyped = toTypedRxJsonSchema(collectionSchemaLiteral);

export type CollectionDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const collectionSchema: RxJsonSchema<CollectionDocType> =
  collectionSchemaLiteral;
