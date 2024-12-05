// ---- Utils
import {
  DecodeGraphql,
  ReduceAuthHeader,
} from "@sparrow/workspaces/features/graphql-explorer/utils";
import {
  createDeepCopy,
  moveNavigation,
  throttle,
} from "@sparrow/common/utils";
import { CompareArray, Debounce } from "@sparrow/common/utils";

// ---- DB
import type {
  CollectionDocument,
  TabDocument,
  WorkspaceDocument,
} from "../../../../database/database";

// ---- Repo
import { TabRepository } from "../../../../repositories/tab.repository";
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
import { BehaviorSubject, Observable } from "rxjs";
import { Events, ItemType, ResponseStatusCode } from "@sparrow/common/enums";
import type { CreateDirectoryPostBody } from "@sparrow/common/dto";

// ---- Service
import { makeGraphQLRequest } from "@app/containers/api/api.common";
import {
  insertCollection,
  insertCollectionDirectory,
} from "../../../../services/collection";
import { EnvironmentService } from "../../../../services/environment.service";

// ---- Events
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

import {
  type KeyValue,
  ResponseSectionEnum,
} from "@sparrow/common/types/workspace";
import { notifications } from "@sparrow/library/ui";
import { GraphqlTabAdapter } from "../../../../adapter";
import { GuideRepository } from "../../../../repositories/guide.repository";
import { CollectionService } from "../../../../services/collection.service";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { v4 as uuidv4 } from "uuid";
import type { GuideQuery } from "../../../../types/user-guide";
import { graphqlExplorerDataStore } from "@sparrow/workspaces/features/graphql-explorer/store";
import { InitTab } from "@sparrow/common/factory";
import type { Path, Tab } from "@sparrow/common/types/workspace/tab";
import {
  GraphqlRequestOperationTabEnum,
  type GraphqlRequestAuthTabInterface,
  type GraphqlRequestHeadersTabInterface,
  type GraphqlRequestKeyValueCheckedTabInterface,
  type GraphqlRequestStateTabInterface,
  type GraphqlRequestTabInterface,
} from "@sparrow/common/types/workspace/graphql-request-tab";
import {
  type EnvironmentFilteredVariableBaseInterface,
  type EnvironmentLocalGlobalJoinBaseInterface,
} from "@sparrow/common/types/workspace/environment-base";
import { CollectionItemTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
import { parse } from "graphql";
class GraphqlExplorerViewModel {
  /**
   * Repository
   */
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
  private guideRepository = new GuideRepository();
  private guestUserRepository = new GuestUserRepository();
  private compareArray = new CompareArray();

  /**
   * Service
   */
  private environmentService = new EnvironmentService();
  private collectionService = new CollectionService();
  /**
   * Utils
   */
  private _decodeGraphql = new DecodeGraphql();
  /**
   * Rest tools
   */
  private _authHeader: BehaviorSubject<KeyValue> = new BehaviorSubject({
    key: "",
    value: "",
  });

  private _tab = new BehaviorSubject<Partial<Tab>>({});

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        this.tab = t;
        this.authHeader = new ReduceAuthHeader(
          this._tab.getValue().property?.graphql
            ?.state as GraphqlRequestStateTabInterface,
          this._tab.getValue().property?.graphql
            ?.auth as GraphqlRequestAuthTabInterface,
        ).getValue();
      }, 0);
    }
  }

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

  private set tab(value: Partial<Tab>) {
    this._tab.next(value);
  }

  public get authHeader(): Observable<{
    key: string;
    value: string;
  }> {
    return this._authHeader.asObservable();
  }

  private set authHeader(value: KeyValue) {
    this._authHeader.next(value);
  }

  /**
   * Compares the current request tab with the server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareRequestWithServerDebounced = async () => {
    let result = true;
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());
    let requestServer;
    if (progressiveTab?.path?.folderId) {
      requestServer = await this.collectionRepository.readRequestInFolder(
        progressiveTab.path.collectionId,
        progressiveTab.path.folderId,
        progressiveTab.id,
      );
    } else {
      requestServer =
        await this.collectionRepository.readRequestOrFolderInCollection(
          progressiveTab.path.collectionId,
          progressiveTab.id,
        );
    }
    let graphqlServerTab = new InitTab().graphQl("uuid", "uuid");
    let graphqlTabData;
    if (requestServer) {
      graphqlTabData = graphqlServerTab
        .updateName(requestServer.name)
        .updateDescription(requestServer.description)
        .updateUrl(requestServer.graphql.url)
        .updateQuery(requestServer.graphql.query)
        .updateState({
          requestAuthNavigation: requestServer.graphql.selectedGraphqlAuthType,
        })
        .updateSchema(requestServer.graphql.schema)
        .updateVariables(requestServer.graphql.variables)
        .updateAuth(requestServer.graphql.auth)
        .updateHeaders(requestServer.graphql.headers)
        .getValue();
    } else {
      graphqlTabData = graphqlServerTab.getValue();
    }

    // description
    if (graphqlTabData.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (graphqlTabData.name !== progressiveTab.name) {
      result = false;
    }
    // url
    else if (
      graphqlTabData.property.graphql?.url !==
      progressiveTab.property.graphql?.url
    ) {
      result = false;
    }
    // query
    else if (
      graphqlTabData.property.graphql?.query !==
      progressiveTab.property.graphql?.query
    ) {
      result = false;
    }
    // auth state
    else if (
      graphqlTabData.property.graphql?.state.requestAuthNavigation !==
      progressiveTab.property.graphql?.state.requestAuthNavigation
    ) {
      result = false;
    }
    // schema
    else if (
      graphqlTabData.property.graphql?.schema !==
      progressiveTab.property.graphql?.schema
    ) {
      result = false;
    }
    // variables
    else if (
      graphqlTabData.property.graphql?.variables !==
      progressiveTab.property.graphql?.variables
    ) {
      result = false;
    }
    // auth key
    else if (
      graphqlTabData.property.graphql?.auth.apiKey.authKey !==
      progressiveTab.property.graphql?.auth.apiKey.authKey
    ) {
      result = false;
    }
    // auth value
    else if (
      graphqlTabData.property.graphql?.auth.apiKey.authValue !==
      progressiveTab.property.graphql?.auth.apiKey.authValue
    ) {
      result = false;
    }
    // username
    else if (
      graphqlTabData.property.graphql?.auth.basicAuth.username !==
      progressiveTab.property.graphql?.auth.basicAuth.username
    ) {
      result = false;
    }
    // password
    else if (
      graphqlTabData.property.graphql?.auth.basicAuth.password !==
      progressiveTab.property.graphql?.auth.basicAuth.password
    ) {
      result = false;
    }
    // bearer tokem
    else if (
      graphqlTabData.property.graphql?.auth.bearerToken !==
      progressiveTab.property.graphql?.auth.bearerToken
    ) {
      result = false;
    }
    // headers
    else if (
      !this.compareArray.init(
        graphqlTabData.property.graphql?.headers,
        progressiveTab.property.graphql?.headers,
      )
    ) {
      result = false;
    }
    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
      });
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
      });
      progressiveTab.isSaved = false;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current request tab with the server version.
   */
  private compareRequestWithServer = new Debounce().debounce(
    this.compareRequestWithServerDebounced,
    1000,
  );

  /**
   * Get the guest user state
   */
  private getGuestUserState = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON().isGuestUser;
  };

  /**
   *
   * @param _url - request url
   * @param _effectQueryParams  - flag that effect request query parameter
   */
  public updateRequestUrl = async (_url: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_url === progressiveTab.property.graphql.url) {
      return;
    }
    progressiveTab.property.graphql.url = _url;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
    if (_url && _url?.trim() !== "") {
      this.updateRequestSchemaThrottlerDebounce();
    }
  };

  /**
   * update operation search to db
   * @param _search  - search data
   */
  public updateRequestOperationSearch = async (_search: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.operationSearch = _search;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
  };

  private updateRequestSchemaThrottle = async (
    _environmentVariables?: EnvironmentFilteredVariableBaseInterface[],
  ) => {
    this.updateRequestSchema(_environmentVariables, false);
  };

  private updateRequestSchemaThrottlerDebounce = new Debounce().debounce(
    this.updateRequestSchemaThrottle,
    1000,
  );

  public updateSchemaAsPerQuery = async () => {
    try {
      const progressiveTab = createDeepCopy(this._tab.getValue());
      const query = progressiveTab.property.graphql.query;
      try {
        // Check if the query is valid by attempting to parse it
        parse(query);
      } catch (error) {
        console.error("not a valid query");
        return;
      }
      const reverseJson = await this.reverseGraphQLToJSON(query);
      console.log("reverseJSON----", reverseJson);
      const parsedSchema = JSON.parse(progressiveTab.property.graphql.schema);
      const updatedJSON = await this.compareAndUpdateFirstJSON(
        parsedSchema.Query,
        reverseJson?.items,
      );
      console.log("updatedJSON", updatedJSON);
      const stringifiedUpdatedJSON = JSON.stringify(updatedJSON);
      progressiveTab.property.graphql.schema = stringifiedUpdatedJSON;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   *
   * @param _query - request query
   */
  public updateRequestQuery = async (_query: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.query = _query;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // await this.updateSchemaAsPerQuery();
    this.compareRequestWithServer();
  };

  /**
   * Function to convert schema into required type.
   */
  private formatGraphQLSchema = (introspectionData) => {
    const schema = {};
    introspectionData.__schema?.types?.forEach((type) => {
      // Ignore built-in types like __Schema, __Type, etc.
      if (type?.name?.startsWith("__")) return;

      // Create header comments for the types
      const headerComment = type?.description
        ? `"""${type?.description}"""`
        : "";
      const typeDef = [];

      switch (type?.kind) {
        case "OBJECT":
          // Special handling for Query, Mutation, and Subscription
          if (["Query", "Mutation", "Subscription"].includes(type?.name)) {
            typeDef.push(`type ${type?.name} {`);
            type?.fields?.forEach((field) => {
              const args = field?.args
                .map(
                  (arg) => `${arg?.name}: ${this.formatFieldType(arg?.type)}`,
                )
                .join(", ");
              const fieldComment = field?.description
                ? `"""${field?.description}"""`
                : "";
              typeDef.push(`  ${fieldComment}`);
              typeDef.push(
                `  ${field?.name}(${args}): ${this.formatFieldType(
                  field?.type,
                )}${field?.type?.kind === "NON_NULL" ? "!" : ""}`,
              );
            });
            typeDef.push("}");
          } else {
            typeDef.push(`type ${type?.name} {`);
            type?.fields?.forEach((field) => {
              const fieldComment = field?.description
                ? `"""${field?.description}"""`
                : "";
              typeDef.push(`  ${fieldComment}`);
              typeDef.push(
                `  ${field?.name}: ${this.formatFieldType(field?.type)}${
                  field?.type?.kind === "NON_NULL" ? "!" : ""
                }`,
              );
            });
            typeDef.push("}");
          }
          break;

        case "INPUT_OBJECT":
          typeDef.push(`input ${type?.name} {`);
          type?.inputFields?.forEach((field) => {
            const fieldComment = field?.description
              ? `"""${field?.description}"""`
              : "";
            typeDef.push(`  ${fieldComment}`);
            typeDef.push(
              `  ${field?.name}: ${this.formatFieldType(field?.type)}${
                field?.type?.kind === "NON_NULL" ? "!" : ""
              }`,
            );
          });
          typeDef.push("}");
          break;

        case "SCALAR":
          typeDef.push(`scalar ${type?.name}`);
          break;

        default:
          break;
      }

      // Store the formatted type definition in the schema object
      schema[type?.name] = headerComment
        ? `${headerComment}\n${typeDef.join("\n")}`
        : typeDef.join("\n");
    });

    // Combine all the types into a single schema string
    return Object.values(schema)?.join("\n\n");
  };

  // Helper function to format field types, handling nested types and non-null markers
  private formatFieldType = (type) => {
    if (type?.kind === "NON_NULL")
      return `${this.formatFieldType(type?.ofType)}!`;
    if (type?.kind === "LIST") return `[${this.formatFieldType(type?.ofType)}]`;
    return type?.name || type?.ofType?.name || "";
  };

  /**
   *
   * @param _path - request path
   */
  private updateRequestPath = async (_path: Path) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.path = _path;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  private transformSchema = async (schemaData) => {
    const types = schemaData.__schema.types;
    const processedTypes = new Set();

    // Helper function to resolve nested types
    function resolveType(typeObj) {
      if (!typeObj) return null;

      // Handle nested types (NON_NULL, LIST)
      if (typeObj.kind === "NON_NULL") {
        return resolveType(typeObj.ofType);
      }
      if (typeObj.kind === "LIST") {
        return resolveType(typeObj.ofType);
      }

      return typeObj.name;
    }

    // Determine default value based on type
    function getDefaultValue(typeName) {
      // Provide default values based on type
      switch (typeName) {
        case "String":
          return "";
        case "Int":
        case "Float":
          return 0;
        case "Boolean":
          return false;
        case "ID":
          return null;
        default:
          return null;
      }
    }

    // Helper function to determine if a type is a scalar
    function isScalarType(typeName) {
      const scalarTypes = ["String", "Int", "Float", "Boolean", "ID"];
      return scalarTypes.includes(typeName) || typeName?.startsWith("__");
    }

    // Process input object types
    function processInputObjectType(typeName, depth = 0) {
      if (processedTypes.has(typeName) || depth > 7) return null;

      const inputType = types.find((t) => t.name === typeName);
      if (!inputType?.inputFields) return null;

      processedTypes.add(typeName);
      const result = processFields(
        inputType.inputFields,
        typeName,
        depth + 1,
        "inputField",
      );
      processedTypes.delete(typeName);
      return result;
    }

    // Process object types
    function processObjectType(typeName, depth = 0) {
      if (processedTypes.has(typeName) || depth > 7) return null;

      const objectType = types.find((t) => t.name === typeName);
      if (!objectType?.fields) return null;

      processedTypes.add(typeName);
      const result = processFields(
        objectType.fields,
        typeName,
        depth + 1,
        "field",
      );
      processedTypes.delete(typeName);
      return result;
    }

    // Recursive field processing
    function processFields(
      fields,
      parentName,
      depth = 0,
      defaultItemType = "field",
    ) {
      if (!fields || depth > 7) return [];

      return fields.map((field) => {
        const fieldName = field.name;
        const typeName = resolveType(field.type);
        const isCustomType = !isScalarType(typeName);

        let result = {
          id: uuidv4(), // Add UUID to the top-level object
          name: fieldName,
          description: field.description,
          type: typeName,
          itemType: defaultItemType,
          isSelected: false,
          isExpanded: false,
          value: getDefaultValue(typeName),
          items: [],
        };

        // Process arguments directly into items array
        if (field.args && field.args.length > 0) {
          const argumentItems = field.args.map((arg) => {
            const argTypeName = resolveType(arg.type);
            const isArgCustomType = !isScalarType(argTypeName);

            const argResult = {
              id: uuidv4(), // Add UUID to argument objects
              name: arg.name,
              type: argTypeName,
              description: arg.description,
              itemType: "argument",
              isSelected: false,
              isExpanded: false,
              defaultValue: arg.defaultValue,
              value: getDefaultValue(argTypeName),
              items: [],
            };

            // Process nested argument types
            if (isArgCustomType) {
              const argInputFields = processInputObjectType(
                argTypeName,
                depth + 1,
              );
              const argObjectFields = processObjectType(argTypeName, depth + 1);

              // Add UUID to nested items
              argResult.items = (argInputFields || argObjectFields || []).map(
                (item) => ({
                  ...item,
                  id: uuidv4(),
                }),
              );
            }

            return argResult;
          });

          // Add arguments to items array
          result.items.push(...argumentItems?.slice(0, 15));
        }

        // Process nested custom types
        if (isCustomType) {
          const inputFields = processInputObjectType(typeName, depth + 1);
          const objectFields = processObjectType(typeName, depth + 1);

          // Add nested type fields to items array with UUID
          if (inputFields) {
            result.items.push(
              ...inputFields
                .map((item) => ({
                  ...item,
                  id: uuidv4(),
                }))
                ?.slice(0, 15),
            );
          }
          if (objectFields) {
            result.items.push(
              ...objectFields
                .map((item) => ({
                  ...item,
                  id: uuidv4(),
                }))
                ?.slice(0, 15),
            );
          }
        }

        return result;
      });
    }

    // Find main types
    const queryType = types.find((t) => t.name === "Query");
    const mutationType = types.find((t) => t.name === "Mutation");
    // const subscriptionType = types.find((t) => t.name === "Subscription");

    // Reset processed types before starting
    processedTypes.clear();

    const result = {
      Query: {
        items: queryType
          ? processFields(queryType.fields, "Query").slice(0, 70)
          : [],
      },
      Mutation: {
        items: mutationType
          ? processFields(mutationType.fields, "Mutation").slice(0, 70)
          : [],
      },
      // Disabling subscription for now as it's support is not provided
      // Subscription: {
      //   items: subscriptionType
      //     ? processFields(subscriptionType.fields, "Subscription")
      //     : [],
      // },
    };

    return result;
  };

  // This function will generate the GraphQL Query from json object.
  private generateGraphQLQuery = async (json, operationName = "Query") => {
    // Helper function to process arguments
    function processArguments(items) {
      return items
        .filter((item) => item.itemType === "argument" && item.isSelected)
        .map((arg) => {
          const inputFields = processInputFields(arg.items);
          const value =
            inputFields.length > 0
              ? `{ ${inputFields} }`
              : arg.value !== null
              ? JSON.stringify(arg.value)
              : "null";

          return `${arg.name}: ${value}`;
        })
        .join(", ");
    }

    // Helper function to process input fields (nested arguments)
    function processInputFields(items) {
      return items
        .filter((input) => input.isSelected)
        .map((input) => {
          const value =
            input.value !== null ? JSON.stringify(input.value) : "null";
          return `${input.name}: ${value}`;
        })
        .join(", ");
    }

    // Helper function to process fields and nested fields
    function processFields(items, indentLevel = 1) {
      const indent = "  ".repeat(indentLevel); // Define indentation level
      return items
        .filter((item) => item.itemType === "field" && item.isSelected)
        .map((field) => {
          const args = processArguments(field.items); // Process arguments
          const subFields = processFields(field.items, indentLevel + 1); // Process nested fields

          const fieldWithArgs = args ? `${field.name}(${args})` : field.name;

          // Combine the field with its nested fields (if any)
          return subFields
            ? `${indent}${fieldWithArgs} {\n${subFields}\n${indent}}`
            : `${indent}${fieldWithArgs}`;
        })
        .join("\n");
    }

    // Generate the query
    const queryBody = processFields(json.items);
    return `${
      operationName === "Query" ? `query` : "mutation"
    } ${operationName} {\n  ${queryBody}\n}`;
  };

  // This function will reverse the GraphQL query to JSON object.
  private reverseGraphQLToJSON = (query) => {
    // Helper to process arguments
    const processArguments = (args) => {
      return args.map((arg) => ({
        name: arg.name.value,
        itemType: "argument",
        isSelected: true,
        value: arg.value.kind === "StringValue" ? arg.value.value : null,
        items: [],
      }));
    };

    // Helper to process fields
    const processFields = (fields) => {
      return fields.map((field) => {
        const args = field.arguments ? processArguments(field.arguments) : [];
        const nestedFields =
          field.selectionSet && field.selectionSet.selections
            ? processFields(field.selectionSet.selections)
            : [];

        return {
          id: field.name.value, // You can use a UUID generator if needed
          name: field.name.value,
          description: null, // No description in query, set null
          type: null, // Type is not available in query, set null
          itemType: "field",
          isSelected: true, // Since it's part of the query, it's selected
          value: null, // Default value
          items: [...args, ...nestedFields],
        };
      });
    };

    // Parse the query
    const parsedQuery = parse(query);

    // Entry point: process the main operation
    const operation = parsedQuery.definitions[0];
    const operationName = operation?.name ? operation?.name?.value : "Query";
    const fields = processFields(operation.selectionSet.selections);

    return {
      operationName,
      items: fields,
    };
  };

  // This function will compare and update the main JSON with the new generated JSON.
  private compareAndUpdateFirstJSON = (firstJSON, secondJSONItems) => {
    // Create a helper function to recursively process nested items
    function processItems(firstItems, secondItems) {
      // Create a map of secondItems for quick lookup by name
      const secondMap = new Map();
      for (const secondItem of secondItems) {
        secondMap.set(secondItem.name, secondItem);
      }

      for (const firstItem of firstItems) {
        const secondItem = secondMap.get(firstItem.name);

        // If `isSelected` is true in the first item but it doesn't exist in the second JSON, set `isSelected` to false
        if (firstItem.isSelected && !secondItem) {
          firstItem.isSelected = false;
        }

        // If the object exists in both, update its value
        if (secondItem) {
          firstItem.value = secondItem.value;

          // Recursively process nested items
          if (
            Array.isArray(firstItem.items) &&
            Array.isArray(secondItem.items)
          ) {
            processItems(firstItem.items, secondItem.items);
          }
        }
      }
    }

    // Start processing with the top-level items
    processItems(firstJSON.items, secondJSONItems);

    return firstJSON; // Return the updated first JSON
  };

  private compareAndUpdateFetchedJson = async (previous, current) => {
    const updateItems = (prevItems, currItems) => {
      currItems.forEach((currItem) => {
        // Find a matching item in the previous JSON by name
        const matchingPrevItem = prevItems.find(
          (prevItem) => prevItem.name === currItem.name,
        );

        if (matchingPrevItem) {
          // Update isSelected and value
          currItem.isSelected = matchingPrevItem.isSelected;
          currItem.value = matchingPrevItem.value;

          // Recursively update nested items
          if (currItem.items && matchingPrevItem.items) {
            updateItems(matchingPrevItem.items, currItem.items);
          }
        }
      });
    };

    // Compare and update for both Query and Mutation sections
    if (previous?.Query?.items && current?.Query?.items) {
      updateItems(previous.Query.items, current.Query.items);
    }
    if (previous?.Mutation?.items && current?.Mutation?.items) {
      updateItems(previous.Mutation.items, current.Mutation.items);
    }
    // Return the updated current JSON
    return current;
  };

  /**
   * Updated GraphQL Schema by fetching it.
   * @param _environmentVariables - Environment variables to be embedded in the GraphQL Request.
   */
  public updateRequestSchema = async (
    _environmentVariables: EnvironmentFilteredVariableBaseInterface[] = [],
    isFailedNotificationVisible: boolean = true,
  ) => {
    const decodeData = this._decodeGraphql.init(
      this._tab.getValue().property?.graphql as GraphqlRequestTabInterface,
      _environmentVariables,
    );
    console.log(`GraphQL Request initiated with the following details:`);
    console.table({
      url: decodeData[0],
      headers: decodeData[1],
      query: decodeData[2],
    });
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const schemaQuery = `{
            __schema {
                types {
                    kind
                    name
                    description
                    fields(includeDeprecated: true) {
                        name
                        description
                        type {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                        args {
                            name
                            description
                            type {
                                name
                                kind
                                ofType {
                                    name
                                    kind
                                }
                            }
                            defaultValue
                        }
                    }
                    inputFields {
                        name
                        description
                        type {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                    }
                    enumValues {
                        name
                        description
                    }
                }
            }
        }`;
    try {
      const response = await makeGraphQLRequest(
        decodeData[0],
        decodeData[1],
        schemaQuery,
      );
      const responseBody = response.data.body;
      const parsedResponse = JSON.parse(responseBody);
      this.transformSchema(parsedResponse.data)
        .then(async (formattedSchema) => {
          let previousSchema;
          try {
            previousSchema = JSON.parse(progressiveTab.property.graphql.schema);
          } catch (error) {
            console.log("Previous Schema not parsed", error);
          }
          const parsedSchema = await this.compareAndUpdateFetchedJson(
            previousSchema,
            formattedSchema,
          );

          progressiveTab.property.graphql.schema = JSON.stringify(parsedSchema);
          progressiveTab.property.graphql.state.isRequestSchemaFetched = true;
          this.tab = progressiveTab;
          await this.tabRepository.updateTab(
            progressiveTab.tabId,
            progressiveTab,
          );
          notifications.success("Schema fetched successfully.");
        })
        .catch(async (error) => {
          console.error(error);
          const newProgressiveTab = createDeepCopy(this._tab.getValue());
          newProgressiveTab.property.graphql.state.isRequestSchemaFetched =
            false;
          this.tab = newProgressiveTab;
          await this.tabRepository.updateTab(
            newProgressiveTab.tabId,
            newProgressiveTab,
          );
          if (isFailedNotificationVisible) {
            notifications.error(
              "Failed to fetch schema. Please check the URL and try again.",
            );
          }
        });
    } catch (error) {
      console.error(error);
      const newProgressiveTab = createDeepCopy(this._tab.getValue());
      newProgressiveTab.property.graphql.state.isRequestSchemaFetched = false;
      this.tab = newProgressiveTab;
      await this.tabRepository.updateTab(
        newProgressiveTab.tabId,
        newProgressiveTab,
      );
      if (isFailedNotificationVisible) {
        notifications.error(
          "Failed to fetch schema. Please check the URL and try again.",
        );
      }
    }
  };

  /**
   * Updates variables in the RxDB
   * @param _variables - stringified json of variables
   */
  public updateRequestVariables = async (_variables: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.variables = _variables;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _id - request mongo id
   */
  private updateRequestId = async (_id: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.id = _id;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _description - request description
   */
  public updateRequestDescription = async (_description: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _description;
    this.tab = progressiveTab;
    try {
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      notifications.error(
        "Failed to update the documentation. Please try again",
      );
    }
    this.compareRequestWithServer();
  };

  /**
   * @description - updates request tab name
   * @param _name - new request name
   */
  public updateNameWithCollectionList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  /**
   *
   * @param _name - request name
   */
  public updateRequestName = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.name = _name;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _headers - request headers
   */
  public updateHeaders = async (
    _headers: GraphqlRequestKeyValueCheckedTabInterface[],
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.headers = _headers;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  public updateQueryAsPerSchema = async () => {
    try {
      const progressiveTab = createDeepCopy(this._tab.getValue());
      const parsedSchema = JSON.parse(progressiveTab.property.graphql.schema);
      let _query;
      if (
        progressiveTab.property.graphql.state.operationNavigation ===
        GraphqlRequestOperationTabEnum.QUERY
      ) {
        _query = await this.generateGraphQLQuery(parsedSchema.Query, "Query");
      } else {
        _query = await this.generateGraphQLQuery(
          parsedSchema.Mutation,
          "Mutation",
        );
      }

      progressiveTab.property.graphql.query = _query;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      console.error("error", error);
    }
  };

  /**
   *
   * @param _headers - request headers
   */
  public updateSchema = async (_schema: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.schema = _schema;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    await this.updateQueryAsPerSchema();
    this.compareRequestWithServer();
  };

  /**
   *
   * @param headers - request auto generated headers
   */
  public updateAutoGeneratedHeaders = async (
    headers: GraphqlRequestKeyValueCheckedTabInterface[],
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.autoGeneratedHeaders = headers;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _state - request state
   */
  public updateRequestState = async (
    _state: Partial<GraphqlRequestStateTabInterface>,
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.state = {
      ...progressiveTab.property.graphql.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    await this.updateQueryAsPerSchema();
    this.compareRequestWithServer();
  };

  /**
   *
   * @param  - response state
   */
  public updateResponseState = async (key: string, val: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (key === "responseNavigation") {
      graphqlExplorerDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.navigation = val;
          restApiDataMap.set(progressiveTab.tabId, data);
        }
        return restApiDataMap;
      });
    }
  };

  /**
   *
   * @param _auth - request auth
   */
  public updateRequestAuth = async (_auth: GraphqlRequestAuthTabInterface) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.graphql.auth = {
      ...progressiveTab.property.graphql.auth,
      ..._auth,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.authHeader = new ReduceAuthHeader(
      progressiveTab.property.graphql.state,
      progressiveTab.property.graphql.auth,
    ).getValue();
    this.compareRequestWithServer();
  };

  /**
   * @description clear response of a request
   */
  public clearResponse = async () => {
    return;
  };

  /**
   * Initiates GraphQL Request to the server.
   * @param _environmentVariables - Environment variables to be embedded in the GraphQL Request.
   */
  public sendRequest = async (
    _environmentVariables: EnvironmentFilteredVariableBaseInterface[] = [],
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const abortController = new AbortController();
    graphqlExplorerDataStore.update((restApiDataMap) => {
      let data = restApiDataMap.get(progressiveTab.tabId);
      if (data) {
        data.abortController = abortController;
      } else {
        data = {
          abortController: abortController,
          response: {
            body: "",
            headers: [],
            status: "",
            time: 0,
            size: 0,
            navigation: ResponseSectionEnum.RESPONSE,
          },
          isSendRequestInProgress: false,
        };
      }
      restApiDataMap.set(progressiveTab.tabId, data);
      return restApiDataMap;
    });
    // Create an AbortController for the request
    const { signal } = abortController;

    graphqlExplorerDataStore.update((restApiDataMap) => {
      let data = restApiDataMap.get(progressiveTab?.tabId);
      if (data) {
        data.isSendRequestInProgress = true;
        restApiDataMap.set(progressiveTab.tabId, data);
      }
      return restApiDataMap;
    });
    const start = Date.now();

    const decodeData = this._decodeGraphql.init(
      this._tab.getValue().property?.graphql as GraphqlRequestTabInterface,
      _environmentVariables,
    );
    console.log(`GraphQL Request initiated with the following details:`);
    console.table({
      url: decodeData[0],
      headers: decodeData[1],
      query: decodeData[2],
      variables: decodeData[3],
    });
    makeGraphQLRequest(
      decodeData[0],
      decodeData[1],
      decodeData[2],
      decodeData[3],
      signal,
    )
      .then((response) => {
        const end = Date.now();
        const byteLength = new TextEncoder().encode(
          JSON.stringify(response),
        ).length;
        const responseSizeKB = byteLength / 1024;
        const duration = end - start;

        const responseBody = response.data.body;
        const formattedHeaders = Object.entries(response?.data?.headers || {});
        const responseHeaders: {
          key: string;
          value: string;
        }[] = [];
        formattedHeaders.forEach((elem) => {
          responseHeaders.push({
            key: elem[0],
            value: elem[1],
          });
        });
        let responseStatus = response.data.status;

        graphqlExplorerDataStore.update((restApiDataMap) => {
          let data = restApiDataMap.get(progressiveTab?.tabId);
          if (data) {
            data.response.body = responseBody;
            data.response.headers = responseHeaders;
            data.response.status = responseStatus;
            data.response.time = duration;
            data.response.size = responseSizeKB;
            data.isSendRequestInProgress = false;
            restApiDataMap.set(progressiveTab.tabId, data);
          }
          return restApiDataMap;
        });
      })
      .catch((error) => {
        console.error(error);
        // Handle cancellation or other errors
        if (error.name === "AbortError") {
          return;
        }

        graphqlExplorerDataStore.update((restApiDataMap) => {
          const data = restApiDataMap.get(progressiveTab?.tabId);
          if (data) {
            data.response.body = "";
            data.response.headers = [];
            data.response.status = ResponseStatusCode.ERROR;
            data.response.time = 0;
            data.response.size = 0;
            data.isSendRequestInProgress = false;
            restApiDataMap.set(progressiveTab.tabId, data);
          }
          return restApiDataMap;
        });
      });
  };

  /**
   * aborts the ongoing api request
   */
  public cancelRequest = async (): Promise<void> => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    let abortController: AbortController | undefined = undefined;
    graphqlExplorerDataStore.update((restApiDataMap) => {
      const data = restApiDataMap.get(progressiveTab.tabId);
      if (data) {
        abortController = data.abortController;
      }
      return restApiDataMap;
    });
    if (abortController) {
      (abortController as AbortController)?.abort(); // Abort the request using the stored controller
      graphqlExplorerDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.isSendRequestInProgress = false;
          restApiDataMap.set(progressiveTab.tabId, data);
        }
        return restApiDataMap;
      });
    }
  };

  /**
   *
   * @param uuid  - collection id
   * @returns - collection Document
   */
  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  /**
   *
   * @param collectionId - collection id
   * @param uuid - request or folder id
   * @returns - request document
   */
  public readRequestOrFolderInCollection = (
    collectionId: string,
    uuid: string,
  ): Promise<object> => {
    return this.collectionRepository.readRequestOrFolderInCollection(
      collectionId,
      uuid,
    );
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param uuid - request id
   * @returns - request document
   */
  public readRequestInFolder = (
    collectionId: string,
    folderId: string,
    uuid: string,
  ) => {
    return this.collectionRepository.readRequestInFolder(
      collectionId,
      folderId,
      uuid,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionId - collection id
   * @param _folderName - folder name
   * @returns - folder status message
   */
  public createFolder = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionId: string,
    _folderName: string,
  ) => {
    let userSource = {};
    const _collection: CollectionDocument =
      await this.readCollection(_collectionId);
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const directory: CreateDirectoryPostBody = {
      name: _folderName,
      description: "",
      ...userSource,
    };

    const isGuestUser = await this.getGuestUserState();

    if (isGuestUser == true) {
      const data = {
        id: uuidv4(),
        name: _folderName,
        description: "",
        type: "FOLDER",
        source: "USER",
        isDeleted: false,
        items: [],
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: "",
        updatedAt: "",
      };

      const latestRoute = {
        id: data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    }

    const res = await insertCollectionDirectory(
      _workspaceMeta.id,
      _collectionId,
      directory,
    );
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: res.data.data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionName - collection name
   * @returns - collection status message
   */
  public createCollection = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionName: string,
  ) => {
    const newCollection = {
      name: _collectionName,
      workspaceId: _workspaceMeta.id,
    };

    const isGuestUser = await this.getGuestUserState();

    if (isGuestUser == true) {
      const collectionId = uuidv4();
      const newCollection = {
        id: collectionId,
        name: _collectionName,
        totalRequests: 0,
        createdBy: "Guest User",
        items: [],
        updatedBy: "Guest User",
        // createdAt: new Date().toISOString,
        // updatedAt: new Date().toISOString,
        createdAt: "",
        createdby: "",
        workspaceId: _workspaceMeta.id,
      };
      const latestRoute = {
        id: collectionId,
      };
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: newCollection.name,
        collectionId: newCollection.id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage: newCollection,
          addCollection: this.addCollection,
        },
      };
    }

    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data._id,
      };
      const storage = res.data.data;
      const _id = res.data.data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   * Save Request
   * @param saveDescriptionOnly - refers save overall request data or only description as a documentation purpose.
   * @returns save status
   */
  public saveRequest = async () => {
    MixpanelEvent(Events.Save_GraphQL_Request);
    const graphqlTabData = this._tab.getValue();
    const { folderId, collectionId, workspaceId } = graphqlTabData.path as Path;

    if (!workspaceId || !collectionId) {
      return {
        status: "error",
        message: "request is not a part of any workspace or collection",
      };
    }

    const graphqlTabAdapter = new GraphqlTabAdapter();
    const unadaptedRequest = graphqlTabAdapter.unadapt(graphqlTabData as Tab);

    const isGuestUser = await this.getGuestUserState();
    /**
     * Handle save GraphQL Request for guest user
     */
    if (isGuestUser) {
      const guestGraphqlRequest = {
        id: graphqlTabData.id,
        name: graphqlTabData.name,
        description: graphqlTabData.description,
        type: CollectionItemTypeBaseEnum.GRAPHQL,
        graphql: {
          url: unadaptedRequest.url as string,
          query: unadaptedRequest.query,
          schema: unadaptedRequest.schema,
          variables: unadaptedRequest.variables,
          headers: unadaptedRequest.headers,
          auth: unadaptedRequest.auth,
          selectedGraphqlAuthType: unadaptedRequest.selectedGraphqlAuthType,
        },
        updatedAt: "",
        updatedBy: "Guest User",
      };

      graphqlTabData.isSaved = true;
      this.tab = graphqlTabData;
      await this.tabRepository.updateTab(
        graphqlTabData.tabId as string,
        graphqlTabData,
      );
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          graphqlTabData.id as string,
          guestGraphqlRequest,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          graphqlTabData.id as string,
          guestGraphqlRequest,
        );
      }
      return {
        status: "success",
        message: "",
      };
    }

    /**
     * Handle save GraphQL Request for registered user
     */

    const graphqlPayload = {
      name: graphqlTabData?.name as string,
      description: graphqlTabData?.description as string,
      url: unadaptedRequest.url as string,
      query: unadaptedRequest.query,
      schema: unadaptedRequest.schema,
      variables: unadaptedRequest.variables,
      headers: unadaptedRequest.headers,
      auth: unadaptedRequest.auth,
      selectedGraphqlAuthType: unadaptedRequest.selectedGraphqlAuthType,
    };

    const res = await this.collectionService.updateGraphqlInCollection(
      graphqlTabData.id as string,
      collectionId,
      workspaceId,
      graphqlPayload,
      folderId,
    );

    if (res.isSuccessful) {
      graphqlTabData.isSaved = true;
      this.tab = graphqlTabData;
      await this.tabRepository.updateTab(
        graphqlTabData.tabId as string,
        graphqlTabData,
      );
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          graphqlTabData.id as string,
          res.data.data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          graphqlTabData.id as string,
          res.data.data,
        );
      }
      return {
        status: "success",
        message: res.message,
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param uuid - workspace id
   * @returns workspace document
   */
  public readWorkspace = (uuid: string): Promise<WorkspaceDocument> => {
    return this.workspaceRepository.readWorkspace(uuid);
  };

  get collection() {
    return this.collectionRepository.getCollection();
  }

  set collection(e) {}

  /**
   *
   * @param collectionId - collection id
   * @param items - request or folder item
   */
  public addRequestOrFolderInCollection = (
    collectionId: string,
    items: object,
  ) => {
    this.collectionRepository.addRequestOrFolderInCollection(
      collectionId,
      items,
    );
  };

  /**
   *
   * @param collection - collection document
   */
  public addCollection = (collection: object) => {
    this.collectionRepository.addCollection(collection);
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request document
   */
  public addRequestInFolder = (
    collectionId: string,
    folderId: string,
    request: object,
  ): void => {
    this.collectionRepository.addRequestInFolder(
      collectionId,
      folderId,
      request,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param path - request stack path
   * @param tabName - request name
   * @param description - request description
   * @param type - save over all request or description only
   */
  public saveAsRequest = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    path: {
      name: string;
      id: string;
      type: string;
    }[],
    tabName: string,
    description: string,
  ) => {
    const componentData = this._tab.getValue();
    let userSource = {};
    const _id = componentData.id;
    if (path.length > 0) {
      const graphqlTabAdapter = new GraphqlTabAdapter();
      const unadaptedRequest = graphqlTabAdapter.unadapt(componentData as Tab);
      let req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.GRAPHQL,
        graphql: unadaptedRequest,
        source: "USER",
        isDeleted: false,
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        /**
         * handle request at collection level
         */
        const _collection = await this.readCollection(path[path.length - 1].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        const isGuestUser = await this.getGuestUserState();

        if (isGuestUser == true) {
          this.addRequestOrFolderInCollection(path[path.length - 1].id, req);
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path?.workspaceId ||
            !componentData.path?.collectionId
          ) {
            /**
             * Update existing request
             */
            this.updateRequestName(req.name);
            this.updateRequestDescription(req.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId as string,
              progressiveTab,
            );
          } else {
            /**
             * Create new copy of the existing request
             */
            const initRequestTab = new InitTab().graphQl(req.id, "UNTRACKED-");
            initRequestTab.updateName(req.name);
            initRequestTab.updateDescription(req.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(req.graphql.url as string);
            initRequestTab.updateQuery(req.graphql.query as string);
            initRequestTab.updateSchema(req.graphql.schema as string);
            initRequestTab.updateVariables(req.graphql.variables as string);
            initRequestTab.updateAuth(
              req.graphql.auth as GraphqlRequestAuthTabInterface,
            );
            initRequestTab.updateHeaders(
              req.graphql.headers as GraphqlRequestHeadersTabInterface[],
            );

            this.tabRepository.createTab(initRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addGraphqlInCollection({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: CollectionItemTypeBaseEnum.GRAPHQL,
            graphql: unadaptedRequest,
          },
        });
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path?.workspaceId ||
            !componentData.path?.collectionId
          ) {
            /**
             * Update existing request
             */
            await this.updateRequestName(res.data.data.name);
            await this.updateRequestDescription(
              res.data.data.description as string,
            );
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(res.data.data.id as string);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId as string,
              progressiveTab,
            );
          } else {
            /**
             * Create new copy of the existing request
             */
            const initRequestTab = new InitTab().graphQl(
              res.data.data.id as string,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(
              res.data.data.description as string,
            );
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.graphql?.url as string);
            initRequestTab.updateQuery(res.data.data.graphql?.query as string);
            initRequestTab.updateSchema(
              res.data.data.graphql?.schema as string,
            );
            initRequestTab.updateVariables(
              res.data.data.graphql?.variables as string,
            );
            initRequestTab.updateAuth(
              res.data.data.graphql?.auth as GraphqlRequestAuthTabInterface,
            );
            initRequestTab.updateHeaders(
              res.data.data.graphql
                ?.headers as GraphqlRequestHeadersTabInterface[],
            );

            this.tabRepository.createTab(initRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        /**
         * handle request at folder level
         */
        const _collection = await this.readCollection(path[0].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        const isGuestUser = await this.getGuestUserState();

        if (isGuestUser == true) {
          this.addRequestInFolder(path[0].id, path[path.length - 1].id, req);
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path?.workspaceId ||
            !componentData.path?.collectionId
          ) {
            await this.updateRequestName(req.name);
            await this.updateRequestDescription(req.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId as string,
              progressiveTab,
            );
          } else {
            const initRequestTab = new InitTab().graphQl(req.id, "UNTRACKED-");
            initRequestTab.updateName(req.name);
            initRequestTab.updateDescription(req.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(req.graphql?.url as string);
            initRequestTab.updateQuery(req.graphql?.query as string);
            initRequestTab.updateVariables(req.graphql?.variables as string);
            initRequestTab.updateSchema(req.graphql?.schema as string);
            initRequestTab.updateAuth(
              req.graphql?.auth as GraphqlRequestAuthTabInterface,
            );
            initRequestTab.updateHeaders(
              req.graphql?.headers as GraphqlRequestHeadersTabInterface[],
            );
            this.tabRepository.createTab(initRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const res = await this.collectionService.addGraphqlInCollection({
          collectionId: path[0].id,
          workspaceId: _workspaceMeta.id,
          folderId: path[path.length - 1].id,
          ...userSource,
          items: {
            id: path[path.length - 1].id,
            type: CollectionItemTypeBaseEnum.FOLDER,
            items: {
              name: tabName,
              description,
              type: CollectionItemTypeBaseEnum.GRAPHQL,
              graphql: unadaptedRequest,
            },
          },
        });
        if (res.isSuccessful) {
          this.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path?.workspaceId ||
            !componentData.path?.collectionId
          ) {
            this.updateRequestName(res.data.data.name);
            this.updateRequestDescription(res.data.data.description as string);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(res.data.data.id as string);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            this.tabRepository.updateTab(
              progressiveTab.tabId as string,
              progressiveTab,
            );
          } else {
            const initRequestTab = new InitTab().graphQl(
              res.data.data.id as string,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(
              res.data.data.description as string,
            );
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.graphql?.url as string);
            initRequestTab.updateQuery(res.data.data.graphql?.query as string);
            initRequestTab.updateVariables(
              res.data.data.graphql?.variables as string,
            );
            initRequestTab.updateSchema(
              res.data.data.graphql?.schema as string,
            );
            initRequestTab.updateAuth(
              res.data.data.graphql?.auth as GraphqlRequestAuthTabInterface,
            );
            initRequestTab.updateHeaders(
              res.data.data.graphql
                ?.headers as GraphqlRequestHeadersTabInterface[],
            );
            this.tabRepository.createTab(initRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      }
      MixpanelEvent(Events.Save_GraphQL_Request);
    }
  };

  /**
   *
   * @param isGlobalVariable - defines to save local or global
   * @param environmentVariables - pre existing environment data
   * @param newVariableObj - new entry to be extended
   * @returns
   */
  public updateEnvironment = async (
    isGlobalVariable: boolean,
    environmentVariables: EnvironmentLocalGlobalJoinBaseInterface,
    newVariableObj: KeyValue,
  ) => {
    const isGuestUser = await this.getGuestUserState();
    if (isGlobalVariable) {
      // api payload
      let payload = {
        name: environmentVariables.global.name,
        variable: [
          ...environmentVariables.global.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];

      if (isGuestUser === true) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.global.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.global.id,
        );
        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path?.workspaceId as string,
        environmentVariables.global.id,
        payload,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    } else {
      // api payload
      const payload = {
        name: environmentVariables.local.name,
        variable: [
          ...environmentVariables.local.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];
      if (isGuestUser) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.local.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.local.id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      // api response
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path?.workspaceId as string,
        environmentVariables.local.id,
        payload,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );
        if (currentTab) {
          const currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    }
  };
  /**
   * Fetches a collection guide based on the provided query.
   *
   * @param query - The query object used to find the collection guide.
   * @returns - A promise that resolves to the collection guide found by the query.
   */
  public fetchCollectionGuide = async (query: GuideQuery) => {
    return await this.guideRepository.findOne(query);
  };

  /**
   * Updates the collection guide to set its active status.
   *
   * @param  query - The query object used to find the collection guide to update.
   * @param  isActive - The new active status to set for the collection guide.
   * @returns - A promise that resolves when the update operation is complete.
   */
  public updateCollectionGuide = async (
    query: GuideQuery,
    isActive: boolean,
  ) => {
    await this.guideRepository.update(query, {
      isActive: isActive,
    });
  };

  /**
   * Handles collection rename
   * @param collection - collction to rename
   * @param newCollectionName :string - the new name of the collection
   */
  public handleRenameCollection = async (
    workspaceId: string,
    collectionId: string,
    newCollectionName: string,
  ) => {
    const isGuestUser = await this.getGuestUserState();
    if (newCollectionName) {
      if (isGuestUser == true) {
        let collection =
          await this.collectionRepository.readCollection(collectionId);
        let col = collection.toMutableJSON();
        col.name = newCollectionName;
        this.collectionRepository.updateCollection(collectionId, col);
        // notifications.success("Collection renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const response = await this.collectionService.updateCollectionData(
        collectionId,
        workspaceId,
        { name: newCollectionName },
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collectionId,
          response.data.data,
        );
        // notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
      return response;
    }
  };

  /**
   * Handle folder rename
   * @param workspaceId - workspace id of the folder
   * @param collectionId - collection id of the folder
   * @param folderId  - folder id to be targetted
   * @param newFolderName - new folder name
   * @returns
   */
  public handleRenameFolder = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    newFolderName: string,
  ) => {
    const collection =
      await this.collectionRepository.readCollection(collectionId);
    const explorer =
      await this.collectionRepository.readRequestOrFolderInCollection(
        collectionId,
        folderId,
      );
    if (newFolderName) {
      let userSource = {};
      if (collection.activeSync && explorer?.source === "USER") {
        userSource = {
          currentBranch: collection.currentBranch
            ? collection.currentBranch
            : collection.primaryBranch,
          source: "USER",
        };
      }
      const isGuestUser = await this.getGuestUserState();
      if (isGuestUser === true) {
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collectionId,
            folderId,
          );
        res.name = newFolderName;

        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          res,
        );
        // notifications.success("Folder renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const response = await this.collectionService.updateFolderInCollection(
        workspaceId,
        collectionId,
        folderId,
        {
          ...userSource,
          name: newFolderName,
        },
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          response.data.data,
        );
        // notifications.success("Folder renamed successfully!");
      } else {
        notifications.error("Failed to rename folder. Please try again.");
      }
      return response;
    }
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  /**
   * Clears GraphQL request query
   */
  public clearQuery = async () => {
    const unchecksAllTheChildNodes = (_item => {
      _item.isSelected = false;
      
      for (let j = 0; j < _item?.items?.length; j++) {
        unchecksAllTheChildNodes(_item.items[j])
      }
    });
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());
    const query = "";
    const schema = progressiveTab.property.graphql?.schema;
    
    if(progressiveTab.property.graphql?.state.operationNavigation === GraphqlRequestOperationTabEnum.QUERY){
      try{
        const JSONSchema = JSON.parse(schema as string);
        const querySchema = JSONSchema?.Query?.items || [];
        for(let i = 0; i < querySchema.length; i++){
          unchecksAllTheChildNodes(querySchema[i]);
        }
        JSONSchema.Query.items = querySchema;
        await this.updateSchema(JSON.stringify(JSONSchema));

      }catch(e){
        console.error(e);
      }
    }
    if(progressiveTab.property.graphql?.state.operationNavigation === GraphqlRequestOperationTabEnum.MUTATION){
      try{
        const JSONSchema = JSON.parse(schema as string);
        const querySchema = JSONSchema?.Mutation?.items || [];
        for(let i = 0; i < querySchema.length; i++){
          unchecksAllTheChildNodes(querySchema[i]);
        }
        JSONSchema.Mutation.items = querySchema;
        await this.updateSchema(JSON.stringify(JSONSchema));
      }catch(e){
        console.error(e);
      }
    }
    await this.updateRequestQuery(query);
    
    notifications.success("Cleared Query successfully.");
  };
}

export default GraphqlExplorerViewModel;
