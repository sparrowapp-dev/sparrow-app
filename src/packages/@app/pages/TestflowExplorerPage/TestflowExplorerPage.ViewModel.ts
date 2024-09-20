import { makeHttpRequestV2 } from "$lib/api/api.common";
import { ResponseStatusCode } from "$lib/utils/enums";
import { environmentType } from "$lib/utils/enums";
import { createDeepCopy } from "$lib/utils/helpers";
import { RequestTabAdapter } from "@app/adapter";
import type { TabDocument } from "@app/database/database";
import { CollectionRepository } from "@app/repositories/collection.repository";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import type { Tab } from "@common/types/workspace";
import type {
  TFAPIResponseType,
  TFNodeType,
} from "@common/types/workspace/testflow";
import { Debounce, ParseTime } from "@common/utils";
import { notifications } from "@library/ui/toast/Toast";
import { DecodeRequest } from "@workspaces/features/rest-explorer/utils";
import {
  testFlowDataStore,
  type TFHistoryAPIResponseStoreType,
  type TFKeyValueStoreType,
} from "@workspaces/features/socket-explorer/store/testflow";
import { BehaviorSubject, Observable } from "rxjs";

export class TestflowExplorerPageViewModel {
  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});
  private tabRepository = new TabRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private workspaceRepository = new WorkspaceRepository();
  /**
   * Utils
   */
  private _decodeRequest = new DecodeRequest();

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        this.tab = t;
      }, 0);
    }
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  private set tab(value: Tab) {
    this._tab.next(value);
  }
  /**
   *
   * @param _nodes - nodes of the testflow
   */

  private updateNodesDebounce = async (_nodes: TFNodeType[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const nodes = _nodes.map((elem) => {
      return {
        id: elem.id,
        type: elem.type,
        data: {
          name: elem.data.name, // not required to save in db
          requestId: elem.data.requestId,
          folderId: elem.data.folderId,
          collectionId: elem.data.collectionId,
          method: elem.data.method, // not required to save in db
        },
        position: { x: elem.position.x, y: elem.position.y },
      };
    });
    progressiveTab.property.testflow.nodes = nodes;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
  };

  public updateNodes = new Debounce().debounce(
    this.updateNodesDebounce as any,
    300,
  );
  /**
   *
   * @param _edges - edges of the testflow
   */
  private updateEdgesDebounce = async (_edges: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.testflow.edges = _edges;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
  };

  public updateEdges = new Debounce().debounce(
    this.updateEdgesDebounce as any,
    300,
  );

  public updateSelectedAPI = async () => {};

  /**
   * Get list of collections from current active workspace
   * @returns :Observable<CollectionDocument[]> - the list of collection from current active workspace
   */
  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
  };

  private getActiveEnvironments = async (currentWorkspaceId: string) => {
    let environmentId: string;
    const activeWorkspace =
      await this.workspaceRepository.getActiveWorkspaceDoc();

    if (activeWorkspace) {
      currentWorkspaceId = activeWorkspace.get("_id");
      environmentId = activeWorkspace.get("environmentId");
    }

    const environments = await this.environmentRepository.getEnvironment();
    let environmentDocuments;
    environments.subscribe((value) => {
      if (value) {
        environmentDocuments = value;
      }
    });
    let environmentVariables;

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
          const envs = [];
          filteredEnv.forEach((elem) => {
            environmentVariables = {
              local: filteredEnv[1],
              global: filteredEnv[0],
              filtered: [],
            };

            const temp = elem.toMutableJSON();
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

  public handleTestFlowRun = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const environments = await this.getActiveEnvironments(
      progressiveTab.path.workspaceId,
    );
    const nodes = progressiveTab?.property?.testflow?.nodes;

    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(progressiveTab.tabId);
      if (wsData) {
        wsData.nodes = [];
      } else {
        wsData = {
          nodes: [],
          history: [],
          isRunHistoryEnable: false,
        };
      }
      testFlowDataMap.set(progressiveTab.tabId, wsData);
      return testFlowDataMap;
    });

    let successRequests = 0;
    let failedRequests = 0;
    let totalTime = 0;
    const history: TFHistoryType = {
      status: "fail",
      successRequests: "",
      failedRequests: "",
      totalTime: "",
      timestamp: new Date().toISOString(),
      requests: [],
      expand: false,
    };

    // Sequential execution
    for (const element of nodes) {
      if (
        element?.type === "requestBlock" &&
        element?.data?.collectionId?.length > 0
      ) {
        let request;
        if (element?.data?.folderId?.length > 0) {
          request = await this.collectionRepository.readRequestInFolder(
            element.data.collectionId,
            element.data.folderId,
            element.data.requestId,
          );
        } else {
          request =
            await this.collectionRepository.readRequestOrFolderInCollection(
              element.data.collectionId,
              element.data.requestId,
            );
        }

        const requestTabAdapter = new RequestTabAdapter();
        const adaptedRequest = requestTabAdapter.adapt(
          progressiveTab.path.workspaceId,
          element.data.collectionId,
          element.data.folderId,
          request,
        );
        const decodeData = this._decodeRequest.init(
          adaptedRequest.property.request,
          environments?.filtered || [],
        );
        const start = Date.now();

        try {
          const response = await makeHttpRequestV2(...decodeData);
          console.log("ggggggggggggg", response);
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
                console.log(formattedHeaders, "formathead");
                console.log(resData);

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
                  status: resData.status, // need to be updated
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
        const hs = wsData.history;
        hs.unshift(history);
        wsData.history = hs;
        testFlowDataMap.set(progressiveTab.tabId, wsData);
      }
      return testFlowDataMap;
    });
    notifications.success(
      `Test Completed: ${successRequests} Passed, ${failedRequests} Failed`,
    );
  };

  public toggleHistoryContainer = (_toggleState: boolean) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    testFlowDataStore.update((testFlowDataMap) => {
      let wsData = testFlowDataMap.get(progressiveTab.tabId);
      if (wsData) {
        wsData.isRunHistoryEnable = _toggleState;
      } else {
        wsData = {
          isRunHistoryEnable: _toggleState,
          history: [],
          nodes: [],
        };
      }
      testFlowDataMap.set(progressiveTab.tabId, wsData);
      return testFlowDataMap;
    });
  };

  public toggleHistoryDetails = (_toggleState: boolean, _index: number) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    testFlowDataStore.update((testFlowDataMap) => {
      const wsData = testFlowDataMap.get(progressiveTab.tabId);
      if (wsData) {
        wsData.history[_index].expand = _toggleState;
        testFlowDataMap.set(progressiveTab.tabId, wsData);
      }
      return testFlowDataMap;
    });
  };
}
