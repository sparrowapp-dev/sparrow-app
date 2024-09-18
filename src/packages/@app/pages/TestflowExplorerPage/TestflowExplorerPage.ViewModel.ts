import { makeHttpRequestV2 } from "$lib/api/api.common";
import { environmentType } from "$lib/utils/enums";
import { createDeepCopy } from "$lib/utils/helpers";
import { RequestTabAdapter } from "@app/adapter";
import type { TabDocument, WorkspaceDocument } from "@app/database/database";
import { CollectionRepository } from "@app/repositories/collection.repository";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import type { Tab } from "@common/types/workspace";
import { Debounce } from "@common/utils";
import { DecodeRequest } from "@workspaces/features/rest-explorer/utils";
import { testFlowDataStore } from "@workspaces/features/socket-explorer/store/testflow";
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

  private updateNodesDebounce = async (_nodes) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const nodes = _nodes.map((elem) => {
      return {
        id: elem.id,
        type: elem.type,
        data: {
          name: elem.data.name,
          requestId: elem.data.requestId,
          folderId: elem.data.folderId,
          collectionId: elem.data.collectionId,
          method: elem.data.method,
        },
        position: { x: elem.position.x, y: elem.position.y },
      };
    });
    progressiveTab.property.testflow.nodes = nodes;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    // this.compareRequestWithServer();
  };

  public updateNodes = new Debounce().debounce(this.updateNodesDebounce, 300);
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

  public updateEdges = new Debounce().debounce(this.updateEdgesDebounce, 300);

  public updateSelectedAPI = async (nodeId: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
  };

  /**
   * Get list of collections from current active workspace
   * @returns :Observable<CollectionDocument[]> - the list of collection from current active workspace
   */
  public getCollectionList = () => {
    return this.collectionRepository.getCollection();
  };

  private refreshEnvironment = async (currentWorkspaceId: string) => {
    let environmentId: string;
    const activeWorkspace = await this.workspaceRepository.getActiveWorkspace();
    const activeWorkspaceSubscribe = activeWorkspace.subscribe(
      async (value: WorkspaceDocument) => {
        const activeWorkspaceRxDoc = value;
        if (activeWorkspaceRxDoc) {
          currentWorkspaceId = activeWorkspaceRxDoc.get("_id");
          environmentId = activeWorkspaceRxDoc.get("environmentId");
        }
      },
    );
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
          let envs = [];
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
    // debugger;
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const environments = await this.refreshEnvironment(
      progressiveTab.path.workspaceId,
    );
    const nodes = progressiveTab?.property?.testflow?.nodes;
    testFlowDataStore.update((testFlowDataMap) => {
      testFlowDataMap.set(progressiveTab.tabId, {
        nodes: [],
      });
      return testFlowDataMap;
    });
    nodes.forEach(async (element) => {
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
          testFlowDataStore.update((testFlowDataMap) => {
            const existingTestFlowData = testFlowDataMap.get(
              progressiveTab.tabId,
            );

            // Check if the node with the same id already exists
            if (existingTestFlowData) {
              const existingNodeIndex = existingTestFlowData.nodes.findIndex(
                (n) => n.id === element.id,
              );
              let resData;
              const end = Date.now();
              const duration = end - start;
              if (response.isSuccessful) {
                const byteLength = new TextEncoder().encode(
                  JSON.stringify(response),
                ).length;
                const responseSizeKB = byteLength / 1024;

                const responseBody = response.data.body;
                const formattedHeaders = Object.entries(
                  response?.data?.headers || {},
                );
                const responseHeaders = [];
                formattedHeaders.forEach((elem) => {
                  responseHeaders.push({
                    key: elem[0],
                    value: elem[1],
                  });
                });
                const responseStatus = response?.data?.status;

                resData = {
                  body: responseBody,
                  headers: responseHeaders,
                  status: responseStatus,
                  time: duration,
                  size: responseSizeKB,
                };
              } else {
                resData = {
                  body: "",
                  headers: [],
                  status: "Not Found",
                  time: duration,
                  size: 0,
                };
              }

              if (existingNodeIndex > -1) {
                // Update the existing node's response
                existingTestFlowData.nodes[existingNodeIndex].response =
                  resData;
              } else {
                // Add a new node
                existingTestFlowData.nodes.push({
                  id: element.id,
                  response: resData,
                });
              }

              // Set the updated data back into the map
              testFlowDataMap.set(progressiveTab.tabId, existingTestFlowData);
            }
            return testFlowDataMap;
          });
        } catch (error) {
          testFlowDataStore.update((testFlowDataMap) => {
            const existingTestFlowData = testFlowDataMap.get(
              progressiveTab.tabId,
            );

            // Check if the node with the same id already exists
            if (existingTestFlowData) {
              const existingNodeIndex = existingTestFlowData.nodes.findIndex(
                (n) => n.id === element.id,
              );

              const resData = {
                body: "",
                headers: [],
                status: "Not Found",
                time: 0,
                size: 0,
              };

              if (existingNodeIndex > -1) {
                // Update the existing node's response
                existingTestFlowData.nodes[existingNodeIndex].response =
                  resData;
              } else {
                // Add a new node
                existingTestFlowData.nodes.push({
                  id: element.id,
                  response: resData,
                });
              }
              // Set the updated data back into the map
              testFlowDataMap.set(progressiveTab.tabId, existingTestFlowData);
            }
            return testFlowDataMap;
          });
        }
      }
    });
  };
}
