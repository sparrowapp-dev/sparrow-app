import { makeHttpRequestV2 } from "@app/containers/api/api.common";
import { ResponseStatusCode } from "@sparrow/common/enums";
import { environmentType } from "@sparrow/common/enums";
import {
  createDeepCopy,
  InitRequestTab,
  moveNavigation,
} from "@sparrow/common/utils";
import { RequestTabAdapter } from "../../../../adapter";
import type {
  EnvironmentDocument,
  TabDocument,
} from "../../../../database/database";
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { TabRepository } from "../../../../repositories/tab.repository";
import { TestflowRepository } from "../../../../repositories/testflow.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { TestflowService } from "../../../../services/testflow.service";
import {
  RequestDataTypeEnum,
  type HttpRequestCollectionLevelAuthTabInterface,
} from "@sparrow/common/types/workspace";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import type {
  ENVDocumentType,
  ENVExtractVariableType,
} from "@sparrow/common/types/workspace/environment";
import type {
  TFAPIResponseType,
  TFDataStoreType,
  TFEdgeType,
  TFHistoryAPIResponseStoreType,
  TFHistoryStoreType,
  TFKeyValueStoreType,
  TFNodeStoreType,
  TFNodeType,
} from "@sparrow/common/types/workspace/testflow";
import { CompareArray, Debounce, ParseTime } from "@sparrow/common/utils";
import { notifications } from "@sparrow/library/ui";
import { DecodeRequest } from "@sparrow/workspaces/features/rest-explorer/utils";
import { testFlowDataStore } from "@sparrow/workspaces/features/testflow-explorer/store";
import { BehaviorSubject, Observable } from "rxjs";
import {
  CollectionAuthTypeBaseEnum,
  CollectionRequestAddToBaseEnum,
} from "@sparrow/common/types/workspace/collection-base";
import {
  transformRequestData,
  extractAuthData,
} from "../../../../../../../packages/@sparrow-common/src/utils/testFlow.helper";
import { isGuestUserActive } from "@app/store/auth.store";
import { EnvironmentService } from "@app/services/environment.service";
import type { EnvironmentDocType } from "@app/models/environment.model";

export class TestflowExplorerPageViewModel {
  private _tab = new BehaviorSubject<Partial<Tab>>({});
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();

  private guestUserRepository = new GuestUserRepository();
  private testflowService = new TestflowService();
  private compareArray = new CompareArray();
  private environmentService = new EnvironmentService();

  /**
   * Utils
   */
  private _decodeRequest = new DecodeRequest();

  /**
   * Constructor to initialize the TestflowExplorerPageViewModel class
   * @param doc - TabDocument that contains information about the active tab
   */
  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        this.tab = t;
      }, 0);
    }
  }

  /**
   * Returns an observable that emits the current state of the tab
   */
  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

  /**
   * Sets the value of the tab and updates the observable
   * @param value - the updated tab value
   */
  private set tab(value: Tab) {
    this._tab.next(value);
  }

  /**
   * Return active workspace of the user
   */
  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  /**
   * Updates the nodes in the testflow with debounce to avoid frequent calls
   * @param _nodes - nodes of the testflow
   */
  private updateNodesDebounce = async (_nodes: TFNodeType[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const nodes = _nodes.map((elem) => {
      return {
        id: elem.id,
        blockName: elem.blockName,
        type: elem.type,
        data: {
          name: elem.data.name, // not required to save in db
          requestId: elem.data.requestId,
          workspaceId: elem.data.workspaceId,
          folderId: elem.data.folderId,
          collectionId: elem.data.collectionId,
          method: elem.data.method, // not required to save in db
          requestData: elem.data.requestData,
          isDeleted: elem.data.isDeleted,
        },
        position: { x: elem.position.x, y: elem.position.y },
      };
    });
    progressiveTab.property.testflow.nodes = nodes;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareTestflowWithServer();
  };

  /**
   * Debounced method for updating testflow nodes
   */
  public updateNodes = new Debounce().debounce(
    this.updateNodesDebounce as any,
    300,
  );

  /**
   * Updates the edges in the testflow with debounce to avoid frequent calls
   * @param _edges - edges of the testflow
   */
  private updateEdgesDebounce = async (_edges: TFEdgeType[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const edges = _edges.map((elem) => {
      return {
        id: elem.id,
        source: elem.source,
        target: elem.target,
      };
    });
    progressiveTab.property.testflow.edges = edges;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareTestflowWithServer();
  };

  /**
   * Debounced method for updating testflow edges
   */
  public updateEdges = new Debounce().debounce(
    this.updateEdgesDebounce as any,
    300,
  );

  /**
   * Placeholder for method to update selected API
   */
  public updateSelectedAPI = async () => {};

  /**
   * Retrieves the list of collections from the current active workspace
   * @returns - the list of collections
   */
  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
  };

  /**
   * Compares the current testflow tab with the server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareTestflowWithServerDebounced = async () => {
    let result = true;
    const progressiveTab = createDeepCopy(this._tab.getValue());

    let testflowServer = await this.testflowRepository.readTestflow(
      progressiveTab.id,
    );
    testflowServer = testflowServer?.toMutableJSON();
    // console.log(progressiveTab, testflowServer); will be used for debugging in some time

    if (!testflowServer) {
      result = false;
    }

    // name
    else if (testflowServer.name !== progressiveTab.name) {
      result = false;
    }

    // nodes
    else if (
      !this.compareArray.init(
        testflowServer.nodes,
        progressiveTab.property.testflow.nodes,
      )
    ) {
      result = false;
    }

    // nodes
    else if (
      !this.compareArray.init(
        testflowServer.edges,
        progressiveTab.property.testflow.edges,
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
        persistence: TabPersistenceTypeEnum.PERMANENT,
      });
      progressiveTab.isSaved = false;
      progressiveTab.persistence = TabPersistenceTypeEnum.PERMANENT;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current request tab with the server version.
   */
  private compareTestflowWithServer = new Debounce().debounce(
    this.compareTestflowWithServerDebounced,
    1000,
  );

  /**
   * Fetches the active environments for the current workspace
   * @param currentWorkspaceId - the current workspace ID
   * @returns - environment variables filtered for the workspace
   */
  private getActiveEnvironments = async (currentWorkspaceId: string) => {
    let environmentId: string;
    const activeWorkspace =
      await this.workspaceRepository.getActiveWorkspaceDoc();

    if (activeWorkspace) {
      currentWorkspaceId = activeWorkspace.get("_id");
      environmentId = activeWorkspace.get("environmentId");
    }

    const environments = await this.environmentRepository.getEnvironment();
    let environmentDocuments: EnvironmentDocument[] = [];

    environments.subscribe((value) => {
      if (value) {
        environmentDocuments = value;
      }
    });

    let environmentVariables: {
      filtered: ENVExtractVariableType[];
    } = {
      filtered: [],
    };

    if (environmentDocuments && currentWorkspaceId) {
      if (environmentDocuments?.length > 0) {
        const filteredEnv = environmentDocuments
          .filter((elem) => {
            return elem.workspaceId === currentWorkspaceId;
          })
          .filter((elem) => {
            if (
              elem.type === environmentType.GLOBAL ||
              elem.id === environmentId
            ) {
              return true;
            }
          });
        if (filteredEnv?.length > 0) {
          const envs: ENVExtractVariableType[] = [];
          filteredEnv.forEach((elem) => {
            environmentVariables = {
              filtered: [],
            };

            const temp = elem.toMutableJSON() as ENVDocumentType;
            temp.variable.forEach((variable) => {
              if (variable.key && variable.checked) {
                envs.unshift({
                  key: variable.key,
                  value: variable.value,
                  type: temp.type === environmentType.GLOBAL ? "G" : "E",
                  environment: temp.name,
                });
              }
            });
            environmentVariables.filtered = envs;
          });
        }
      }
    }
    return environmentVariables;
  };

  /**
   * Handles running the test flow by processing each node sequentially and recording the results
   */
  public handleSampleTestFlowRun = (): TFNodeStoreType => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const adaptedRequest = new InitRequestTab("fewfe", "fewfe");
    adaptedRequest.updateName("Sample API");
    adaptedRequest.updateUrl("https://sample-api.com/");
    const nodes = {
      id: "2",
      response: {
        body: `{"api":"Sample API"}`,
        headers: [],
        status: ResponseStatusCode.OK,
        time: 200,
        size: 400,
        responseContentType: RequestDataTypeEnum.JSON,
      },
      request: adaptedRequest.getValue(),
    };
    return nodes;
  };

  private fetchCollectionAuth = async (_collectionId: string) => {
    const collectionRx =
      await this.collectionRepository.readCollection(_collectionId);
    const collectionDoc = collectionRx?.toMutableJSON();
    let collectionAuth;
    if (collectionDoc?.auth) {
      collectionAuth = {
        auth: collectionDoc?.auth,
        collectionAuthNavigation: collectionDoc?.selectedAuthType,
      } as HttpRequestCollectionLevelAuthTabInterface;
    } else {
      collectionAuth = {
        auth: {
          bearerToken: "",
          basicAuth: {
            username: "",
            password: "",
          },
          apiKey: {
            authKey: "",
            authValue: "",
            addTo: CollectionRequestAddToBaseEnum.HEADER,
          },
        },
        collectionAuthNavigation: CollectionAuthTypeBaseEnum.NO_AUTH,
      };
    }
    return collectionAuth;
  };

  /**
   * Handles running the test flow by processing each node sequentially and recording the results
   */
  public handleTestFlowRun = async (_id: string, _event: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const environments = await this.getActiveEnvironments(
      progressiveTab.path.workspaceId,
    );
    const nodes = progressiveTab?.property?.testflow?.nodes;
    const abortController = new AbortController();
    const { signal } = abortController;

    let runningNodes : any[] = [];

    if(_event === "run-from-here"){
      nodes.forEach((node: any)=>{
        if(node.id >= _id){
          runningNodes.push(node);
        }
      });
    }
    else if (_event === "run-till-here") {
        nodes.forEach((node: any)=>{
          if(node.id <= _id){
            runningNodes.push(node);
          }
        });
    }else{
      runningNodes = [...nodes];
    }

    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(progressiveTab.tabId);
      if (wsData) {
        wsData.nodes = [];
        wsData.isTestFlowRunning = true;
        wsData.abortController = abortController;
      } else {
        wsData = {
          abortController: abortController,
          nodes: [],
          history: [],
          isRunHistoryEnable: false,
          isTestFlowRunning: true,
          isTestFlowSaveInProgress: false,
        };
      }
      testFlowDataMap.set(progressiveTab.tabId, wsData);
      return testFlowDataMap;
    });

    let successRequests = 0;
    let failedRequests = 0;
    let totalTime = 0;
    const history: TFHistoryStoreType = {
      status: "fail",
      successRequests: "",
      failedRequests: "",
      totalTime: "",
      timestamp: new Date().toISOString(),
      requests: [],
      expand: false,
    };

    // Sequential execution
    for (const element of runningNodes) {
      if (element?.type === "requestBlock") {
        // Read the API request data from the tab
        const requestData = await this.collectionRepository.readRequestInTab(
          progressiveTab.tabId,
          element.data.requestId,
        );

        const request = transformRequestData(requestData);

        const requestTabAdapter = new RequestTabAdapter();
        const adaptedRequest: Tab = requestTabAdapter.adapt(
          progressiveTab.path.workspaceId ?? "",
          element?.data?.collectionId ?? "",
          element?.data?.folderId ?? "",
          request,
        );

        // Extract the auth data from the API request
        const collectionAuth = extractAuthData(request);

        const decodeData = this._decodeRequest.init(
          adaptedRequest.property.request,
          environments?.filtered || [],
          collectionAuth,
        );
        const start = Date.now();

        try {
          const response = await makeHttpRequestV2(
            decodeData[0],
            decodeData[1],
            decodeData[2],
            decodeData[3],
            decodeData[4],
            signal
          );
          const end = Date.now();
          const duration = end - start;

          testFlowDataStore.update((testFlowDataMap) => {
            const existingTestFlowData = testFlowDataMap.get(
              progressiveTab.tabId,
            );
            if (existingTestFlowData) {
              let resData: TFHistoryAPIResponseStoreType;
              if (response.isSuccessful) {
                const byteLength = new TextEncoder().encode(
                  JSON.stringify(response),
                ).length;
                const responseSizeKB = byteLength / 1024;
                const responseData: TFAPIResponseType = response.data;
                const responseBody = responseData.body;
                const formattedHeaders = Object.entries(
                  response?.data?.headers || {},
                ).map(([key, value]) => ({
                  key,
                  value,
                })) as TFKeyValueStoreType[];
                const responseStatus = response?.data?.status;
                resData = {
                  body: responseBody,
                  headers: formattedHeaders,
                  status: responseStatus,
                  time: duration,
                  size: responseSizeKB,
                  responseContentType:
                    this._decodeRequest.setResponseContentType(
                      formattedHeaders,
                    ),
                };

                if (
                  Number(resData.status.split(" ")[0]) >= 200 &&
                  Number(resData.status.split(" ")[0]) < 300
                ) {
                  successRequests++;
                } else {
                  failedRequests++;
                }
                totalTime += duration;
                const req = {
                  method: request?.request?.method as string,
                  name: request?.name as string,
                  status: resData.status,
                  time: new ParseTime().convertMilliseconds(duration),
                };
                history.requests.push(req);
              } else {
                resData = {
                  body: "",
                  headers: [],
                  status: ResponseStatusCode.ERROR,
                  time: duration,
                  size: 0,
                };
                failedRequests++;
                totalTime += duration;
                const req = {
                  method: request?.request?.method as string,
                  name: request?.name as string,
                  status: ResponseStatusCode.ERROR,
                  time: new ParseTime().convertMilliseconds(duration),
                };
                history.requests.push(req);
              }
              existingTestFlowData.nodes.push({
                id: element.id,
                response: resData,
                request: adaptedRequest,
              });

              testFlowDataMap.set(progressiveTab.tabId, existingTestFlowData);
            }
            return testFlowDataMap;
          });
        } catch (error) {
          if (error?.name === "AbortError") {
            break;
          }
          testFlowDataStore.update((testFlowDataMap) => {
            const existingTestFlowData = testFlowDataMap.get(
              progressiveTab.tabId,
            );
            if (existingTestFlowData) {
              const resData = {
                body: "",
                headers: [],
                status: ResponseStatusCode.ERROR,
                time: 0,
                size: 0,
              };

              existingTestFlowData.nodes.push({
                id: element.id,
                response: resData,
                request: adaptedRequest,
              });

              testFlowDataMap.set(progressiveTab.tabId, existingTestFlowData);
            }
            return testFlowDataMap;
          });
          failedRequests++;
          totalTime += 0;
          const req = {
            method: request?.request?.method as string,
            name: request?.name as string,
            status: ResponseStatusCode.ERROR,
            time: 0 + " ms",
          };
          history.requests.push(req);
        }
      }
    }

    // Now update the history and log it after all requests are done
    history.totalTime = new ParseTime().convertMilliseconds(totalTime);
    history.successRequests = successRequests.toString();
    history.failedRequests = failedRequests.toString();
    if (failedRequests === 0) {
      history.status = "pass";
    }

    testFlowDataStore.update((testFlowDataMap) => {
      const wsData = testFlowDataMap.get(progressiveTab.tabId);
      if (wsData) {
        if (successRequests + failedRequests >= 1) {
          const hs = wsData.history;
          hs.unshift(history);
          wsData.history = hs;
        }
        wsData.isTestFlowRunning = false;
        testFlowDataMap.set(progressiveTab.tabId, wsData);
      }
      return testFlowDataMap;
    });
    if (nodes.length >= 2) {
      notifications.success(
        `Test Completed: ${successRequests} Passed, ${failedRequests} Failed`,
      );
    }
  };

  /**
   * Runs a single test flow node and updates the testFlowDataStore
   * @param nodeId - The id of the node to be executed
   */
  public handleSingleTestFlowNodeRun = async (nodeId: string) => {
    const tab = createDeepCopy(this._tab.getValue());
    const environments = await this.getActiveEnvironments(tab.path.workspaceId);

    const node = tab?.property?.testflow?.nodes.find(
      (item) => item.id === nodeId,
    );

    if (node && node?.type !== "requestBlock") return;

    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(tab.tabId);
      if (wsData) {
        wsData.nodes = [];
        wsData.isTestFlowRunning = false;
      } else {
        wsData = {
          nodes: [],
          history: [],
          isRunHistoryEnable: false,
          isTestFlowRunning: false,
          isTestFlowSaveInProgress: false,
        };
      }
      testFlowDataMap.set(tab.tabId, wsData);
      return testFlowDataMap;
    });

    // Read the API request data
    const requestData = await this.collectionRepository.readRequestInTab(
      tab.tabId,
      node.data.requestId,
    );

    const request = transformRequestData(requestData);
    const requestTabAdapter = new RequestTabAdapter();

    const adaptedRequest: Tab = requestTabAdapter.adapt(
      tab.path.workspaceId ?? "",
      node?.data?.collectionId ?? "",
      node?.data?.folderId ?? "",
      request,
    );

    const collectionAuth = extractAuthData(request);
    const decodeData = this._decodeRequest.init(
      adaptedRequest.property.request,
      environments?.filtered || [],
      collectionAuth,
    );

    const start = Date.now();
    let resData: TFHistoryAPIResponseStoreType;
    let status: string;
    let duration = 0;

    try {
      const response = await makeHttpRequestV2(
        decodeData[0],
        decodeData[1],
        decodeData[2],
        decodeData[3],
        decodeData[4],
      );
      const end = Date.now();
      duration = end - start;

      if (response.isSuccessful) {
        const byteLength = new TextEncoder().encode(
          JSON.stringify(response),
        ).length;
        const responseSizeKB = byteLength / 1024;
        const responseData: TFAPIResponseType = response.data;
        const formattedHeaders = Object.entries(
          responseData?.headers || {},
        ).map(([key, value]) => ({ key, value })) as TFKeyValueStoreType[];

        resData = {
          body: responseData.body,
          headers: formattedHeaders,
          status: responseData.status,
          time: duration,
          size: responseSizeKB,
          responseContentType:
            this._decodeRequest.setResponseContentType(formattedHeaders),
        };
      } else {
        resData = {
          body: "",
          headers: [],
          status: ResponseStatusCode.ERROR,
          time: duration,
          size: 0,
        };
      }
      status = resData.status;
    } catch (error) {
      resData = {
        body: "",
        headers: [],
        status: ResponseStatusCode.ERROR,
        time: 0,
        size: 0,
      };
      status = ResponseStatusCode.ERROR;
    }

    // Update testFlowDataStore with this single result
    testFlowDataStore.update((testFlowDataMap) => {
      const wsData = testFlowDataMap.get(tab.tabId);
      if (wsData) {
        const updatedNodes = wsData.nodes.filter((n) => n.id !== node.id);
        updatedNodes.push({
          id: node.id,
          response: resData,
          request: adaptedRequest,
        });
        wsData.nodes = updatedNodes;
        testFlowDataMap.set(tab.tabId, wsData);
      }
      return testFlowDataMap;
    });
  };

  /**
   * Toggles the visibility of the history container for the test flow.
   * If the tab data is already available, it updates the `isRunHistoryEnable` property.
   * If the tab data is not found, it initializes it with the provided toggle state.
   * @param _toggleState - boolean flag to enable or disable the history container.
   */
  public toggleHistoryContainer = (_toggleState: boolean) => {
    const progressiveTab = createDeepCopy(this._tab.getValue()); // Create a deep copy of the current tab
    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(progressiveTab.tabId); // Retrieve data for the current tab

      // Update existing data or initialize if not found
      if (wsData) {
        wsData.isRunHistoryEnable = _toggleState;
      } else {
        wsData = {
          isRunHistoryEnable: _toggleState,
          history: [],
          nodes: [],
          isTestFlowRunning: false,
          isTestFlowSaveInProgress: false,
        };
      }
      testFlowDataMap.set(progressiveTab.tabId, wsData); // Save the updated tab data
      return testFlowDataMap;
    });
  };

  /**
   * Removes nodes with an ID less than the specified ID and updates the testFlowDataStore.
   * @param tabId - The ID of the tab to update.
   * @param id - The ID threshold; nodes with an ID less than this will be removed.
   */
  public deleteNodeResponse = (tabId: string, id: string) => {
    // Create a deep copy of the current tab data
    const progressiveTab = createDeepCopy(this._tab.getValue());

    testFlowDataStore.update((testFlowDataMap) => {
      // Retrieve the data for the specific tab using tabId
      const wsData = testFlowDataMap.get(tabId);

      // If there is data for this tab, proceed to update the nodes
      if (wsData) {
        // Filter out nodes with ID less than the specified ID
        wsData.nodes = wsData.nodes.filter((node) => node.id < id);

        // Update the testFlowDataStore with the modified data
        testFlowDataMap.set(tabId, wsData);
      }

      return testFlowDataMap; // Return the updated data map
    });
  };

  /**
   * Toggles the expansion of a specific history entry in the test flow.
   * @param _toggleState - boolean flag to expand or collapse the history details.
   * @param _index - the index of the history entry to be toggled.
   */
  public toggleHistoryDetails = (_toggleState: boolean, _index: number) => {
    const progressiveTab = createDeepCopy(this._tab.getValue()); // Create a deep copy of the current tab
    testFlowDataStore.update((testFlowDataMap) => {
      const wsData = testFlowDataMap.get(progressiveTab.tabId); // Retrieve data for the current tab
      // If the history data exists, update the 'expand' state for the specific entry
      if (wsData && wsData.history[_index]) {
        wsData.history[_index].expand = _toggleState;
        testFlowDataMap.set(progressiveTab.tabId, wsData); // Save the updated history data
      }
      return testFlowDataMap;
    });
  };

  /**
   * Redirects to a specific request based on the provided workspace, collection, folder, and request IDs.
   *
   * @param _workspaceId - The ID of the workspace where the request is located.
   * @param _collectionId - The ID of the collection containing the request.
   * @param _folderId - The ID of the folder containing the request (if applicable).
   * @param _requestId - The ID of the request to be redirected to.
   *
   * @returns Resolves when the redirection process is completed.
   */
  public redirectRequest = async (
    _workspaceId: string,
    _collectionId: string,
    _folderId: string,
    _requestId: string,
  ) => {
    const errorMessage = "id can't be empty while redirecting request!";
    // base conditions
    if (!_workspaceId) {
      console.error("Workspace " + errorMessage);
      return;
    }
    if (!_collectionId) {
      console.error("Collection " + errorMessage);
      return;
    }
    if (!_requestId) {
      console.error("Request " + errorMessage);
      return;
    }

    // fetching request from the db
    let request;
    if (_folderId?.length > 0) {
      request = await this.collectionRepository.readRequestInFolder(
        _collectionId,
        _folderId,
        _requestId,
      );
    } else {
      request = await this.collectionRepository.readRequestOrFolderInCollection(
        _collectionId,
        _requestId,
      );
    }
    if (!request) {
      console.error("Request not found for redirecting!");
      return;
    }

    // creating a tab for the request
    const requestTabAdapter = new RequestTabAdapter();
    const adaptedRequest = requestTabAdapter.adapt(
      _workspaceId || "",
      _collectionId || "",
      _folderId || "",
      request,
    );
    this.tabRepository.createTab(adaptedRequest);
    moveNavigation("right");
  };

  /**
   * @description - updates testflow tab name
   * @param _name - new test flow name
   */
  public updateName = async (_name: string, event = "") => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const trimmedName = _name.trim();

    if (event === "blur" && trimmedName === "") {
      const data = await this.testflowRepository.readTestflow(
        progressiveTab.id,
      );
      progressiveTab.name = data.name;
    } else if (event === "") {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareTestflowWithServer();
  };

  /**
   * @description - saves testflow to the mongo server
   */
  public saveTestflow = async () => {
    const progressiveTab = this._tab.getValue() as Tab;
    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(progressiveTab.tabId); // Retrieve data for the current tab

      // Update existing data or initialize if not found
      if (wsData) {
        wsData.isTestFlowSaveInProgress = true;
      } else {
        wsData = {
          isRunHistoryEnable: false,
          history: [],
          nodes: [],
          isTestFlowRunning: false,
          isTestFlowSaveInProgress: true,
        };
      }
      testFlowDataMap.set(progressiveTab.tabId, wsData); // Save the updated tab data
      return testFlowDataMap;
    });
    const currentTestflow = this._tab.getValue();
    const activeWorkspace = await this.workspaceRepository.readWorkspace(
      currentTestflow?.path?.workspaceId as string,
    );
    // await this.updateEnvironmentState({ isSaveInProgress: true });
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    if (isGuestUser) {
      await this.testflowRepository.updateTestflow(
        currentTestflow?.id as string,
        {
          name: currentTestflow.name,
          nodes: currentTestflow?.property?.testflow?.nodes,
          edges: currentTestflow?.property?.testflow?.edges,
          updatedAt: new Date().toISOString(),
        },
      );
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab as Tab;
      await this.tabRepository.updateTab(
        progressiveTab?.tabId as string,
        progressiveTab,
      );
      // await this.updateEnvironmentState({
      //   isSaveInProgress: false,
      // });
      notifications.success(
        `Changes saved for ${currentTestflow.name} testflow.`,
      );

      testFlowDataStore.update((testFlowDataMap) => {
        let wsData = testFlowDataMap.get(progressiveTab?.tabId as string); // Retrieve data for the current tab

        // Update existing data or initialize if not found
        if (wsData) {
          wsData.isTestFlowSaveInProgress = false;
        }
        testFlowDataMap.set(
          progressiveTab.tabId as string,
          wsData as TFDataStoreType,
        ); // Save the updated tab data
        return testFlowDataMap;
      });
      return;
    }

    const response = await this.testflowService.updateTestflow(
      activeWorkspace._id,
      currentTestflow?.id as string,
      {
        name: currentTestflow.name,
        nodes: currentTestflow?.property?.testflow?.nodes,
        edges: currentTestflow?.property?.testflow?.edges,
      },
    );
    if (response.isSuccessful) {
      this.testflowRepository.updateTestflow(
        response.data.data._id,
        response.data.data,
      );
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab as Tab;
      await this.tabRepository.updateTab(
        progressiveTab?.tabId as string,
        progressiveTab,
      );
      // await this.updateEnvironmentState({
      //   isSaveInProgress: false,
      // });
      notifications.success(
        `Changes saved for ${currentTestflow.name} testflow.`,
      );
    } else {
      // await this.updateEnvironmentState({ isSaveInProgress: false });
      if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error(
          `Failed to save changes for ${currentTestflow.name} testflow.`,
        );
      }
    }
    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(progressiveTab?.tabId as string); // Retrieve data for the current tab

      // Update existing data or initialize if not found
      if (wsData) {
        wsData.isTestFlowSaveInProgress = false;
      }
      testFlowDataMap.set(
        progressiveTab.tabId as string,
        wsData as TFDataStoreType,
      ); // Save the updated tab data
      return testFlowDataMap;
    });
  };

  /**
   * @description - updates environment tab name
   * @param _name - new environment name
   */
  public updateNameWithTestFlowList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (progressiveTab?.name && _name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  /**
   * @description - This function will clear the test flow store data.
   */
  public clearTestFlowData = () => {
    const currentTestflow = this._tab.getValue();
    testFlowDataStore.update((testFlowDataMap) => {
      const wsData: TFDataStoreType | undefined = testFlowDataMap.get(
        currentTestflow?.tabId as string,
      );
      if (wsData) {
        const clearedResponse = wsData.nodes.map((node) => ({
          ...node,
          response: { body: "", headers: [], status: "", time: 0, size: 0 },
        }));
        wsData.nodes = clearedResponse;
        testFlowDataMap.set(currentTestflow?.tabId as string, wsData);
      }
      return testFlowDataMap;
    });
    notifications.success(`Cleared all Responses for testflow.`);
  };

  /**
   * @description - Fetches request data based on collection, request, and folder IDs.
   * @param {string} collectionId - The ID of the collection containing the request.
   * @param {string} requestId - The ID of the specific request to retrieve.
   * @param {string} folderId - The ID of the folder containing the request.
   * @returns {Promise<any>} - Returns the request data asynchronously.
   */
  public getRequestdata = async (
    collectionId: string,
    requestId: string,
    folderId: string,
    nodeId?: string,
    tabId?: string,
  ) => {
    let request;
    if (!collectionId) {
      request = await this.collectionRepository.readRequestDataInNode(
        tabId,
        nodeId,
      );
      return request;
    }
    if (folderId) {
      request = await this.collectionRepository.readRequestInFolder(
        collectionId,
        folderId,
        requestId,
      );
      return request;
    } else {
      request = await this.collectionRepository.readRequestOrFolderInCollection(
        collectionId,
        requestId,
      );
      return request;
    }
  };

  /**
   * @description
   * Read an API request data within a tab.
   */
  public getRequestDataFromTab = async (tabId: string, requestId: string) => {
    let request = await this.collectionRepository.readRequestInTab(
      tabId,
      requestId,
    );
    return request;
  };

  /**
   * @description
   * Read an API request data within a node.
   */
  public checkRequestExistInNode = async (tabId: string, nodeId: string) => {
    let request = await this.collectionRepository.readRequestExistInNode(
      tabId,
      nodeId,
    );
    return request;
  };

  /**
   * @description
   * Update a block data.
   */
  public updateBlockData = async (
    tabId: string,
    nodeId: string,
    requestData: object,
  ) => {
    await this.collectionRepository.updateBlockData(tabId, nodeId, requestData);
  };

  /**
   *
   * @param  - response state
   */
  public updateResponseState = async (key, val) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (key === "responseNavigation") {
      testFlowDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.navigation = val;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
    } else if (key === "responseBodyLanguage") {
      testFlowDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.bodyLanguage = val;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
    } else if (key === "responseBodyFormatter") {
      testFlowDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.bodyFormatter = val;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
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
   *
   * @param isGlobalVariable - defines to save local or global
   * @param environmentVariables - pre existing environment data
   * @param newVariableObj - new entry to be extended
   * @returns
   */
  public updateEnvironment = async (
    isGlobalVariable: boolean,
    environmentVariables,
    newVariableObj: KeyValue,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
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
        this._tab.getValue().path.workspaceId,
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
        this._tab.getValue().path.workspaceId,
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
   * @description - This function stops the api calls in Testflow.
   */
  public handleStopApis = () => {
    let abortController;
    testFlowDataStore.update((testFlowDataMap) => {
      const currentTestflow = this._tab.getValue();
      const wsData = testFlowDataMap.get(currentTestflow?.tabId as string);
      if (wsData) {
        abortController = wsData.abortController;
      }
      return testFlowDataMap;
    });
    if (abortController) {
      abortController.abort();
      testFlowDataStore.update((testFlowDataMap) => {
        const currentTestflow = this._tab.getValue();
        const wsData = testFlowDataMap.get(currentTestflow?.tabId as string);
        if (wsData) {
          wsData.isTestFlowRunning = false;
          testFlowDataMap.set(currentTestflow?.tabId as string, wsData);
        }
        return testFlowDataMap;
      });
    }
  };
}
