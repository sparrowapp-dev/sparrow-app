// Repositories
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { TabRepository } from "../../../../repositories/tab.repository";

// Servises
import { CollectionService } from "../../../../services/collection.service";

// Types
import type {
  // CollectionDocument,
  TabDocument,
} from "../../../../database/database";

// Utils
import { createDeepCopy, Debounce } from "@sparrow/common/utils";

import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { BehaviorSubject, type Observable } from "rxjs";
import { FolderTabAdapter } from "@app/adapter";
import constants from "@app/constants/constants";
import { notifications } from "@sparrow/library/ui";
import { getSelfhostUrls } from "@app/utils/jwt";
import type { TestflowScheduleStateDto } from "@sparrow/common/types/workspace/testflow-schedule-tab";
import { TestflowRepository } from "@app/repositories/testflow.repository";
import { TestflowService } from "@app/services/testflow.service";
import { updateTestflowSchedules } from "@sparrow/common/store";
import { InitTab } from "@sparrow/common/factory";
import { v4 as uuidv4 } from "uuid";
// import { InitRequestTab } from "@sparrow/common/utils";

class MockHistoryExplorerPage {
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private testflowRepository = new TestflowRepository();
  private testflowService = new TestflowService();
  private initTab = new InitTab();


  private _tab: BehaviorSubject<Tab> = new BehaviorSubject({});

  constructor(_tab: TabDocument) {
    const t = createDeepCopy(_tab.toMutableJSON());
    delete t.isActive;
    delete t.index;
    t.persistence = TabPersistenceTypeEnum.PERMANENT;
    this.tab = t;
    this.getTestflow();
  }

  public get tab(): Observable<Tab> {
    return this._tab.asObservable();
  }

  public set tab(value: Tab) {
    this._tab.next(value);
  }

  public getTestflowObserver = (_testflowId: string) => {
    return this.testflowRepository.getTestflowObserver(_testflowId);
  }

  public constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    const [selfhostBackendUrl] = getSelfhostUrls();
    if (selfhostBackendUrl) {
        return selfhostBackendUrl;
    }

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
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
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getTestflow = async () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const response =  await this.testflowService?.fetchTestflow(progressiveTab.path.testflowId);
     if(response?.isSuccessful){
      const schedules = response.data.data.schedules;
      updateTestflowSchedules(progressiveTab?.path?.testflowId as string, schedules);
    }
  };

  /**
   *
   * @param _state - request state
   */
  public updateScheduleState = async (_state: TestflowScheduleStateDto) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.testflowSchedule.state = {
      ...progressiveTab.property.testflowSchedule.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  public runTestflowSchedule = async() => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
     const baseUrl = await this.constructBaseUrl(
        progressiveTab.path.workspaceId,
      );
    const response = await this.testflowService.runTestflowSchedule(progressiveTab.path.workspaceId, progressiveTab.path.testflowId, progressiveTab.id, baseUrl);
    if(response?.isSuccessful){
      const schedules = response.data.data.schedules;
      updateTestflowSchedules(progressiveTab?.path?.testflowId as string, schedules);
    }
  }

  public handleCreateTestflowSingleScheduleTab = () => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const newTabId = uuidv4();
    const initTestflowScheduleRunViewTab = this.initTab.testflowScheduleRunView(
      newTabId,
      progressiveTab.path.workspaceId,
    );
    initTestflowScheduleRunViewTab.updateName(
      `Result - ${progressiveTab.name}`,
    );
    const nodes = [
      {
        id: "1",
        type: "startBlock",
        data: {
          blockName: "startBlock",
          requestId: "",
          folderId: "",
          collectionId: "",
          requestData: null,
          name: "",
          method: "",
        },
        position: {
          x: 100,
          y: 200,
        },
      },
      {
        id: "2",
        type: "requestBlock",
        data: {
          blockName: "Block 1",
          requestId: "f2a01b62-b948-43e4-8978-c6072659f797",
          folderId: "",
          collectionId: "68651d6c137db413e71a3beb",
          requestData: {
            headers: [
              {
                key: "",
                value: "",
                checked: false,
              },
            ],
            queryParams: [
              {
                key: "",
                value: "",
                checked: false,
              },
            ],
            body: {
              raw: "",
              urlencoded: [
                {
                  key: "",
                  value: "",
                  checked: false,
                },
              ],
              formdata: {
                text: [
                  {
                    key: "",
                    value: "",
                    checked: false,
                  },
                ],
                file: [],
              },
            },
            auth: {
              bearerToken: "",
              basicAuth: {
                username: "",
                password: "",
              },
              apiKey: {
                authKey: "",
                authValue: "",
                addTo: "Header",
              },
            },
            url: "https://jsonplaceholder.typicode.com/todos/1",
            method: "GET",
            name: "Sample-API",
            selectedRequestBodyType: "none",
            selectedRequestAuthType: "No Auth",
          },
          name: "Sample-API",
          method: "GET",
        },
        position: {
          x: 186.74846911869878,
          y: 7.416101248411689,
        },
      },
      {
        id: "3",
        type: "requestBlock",
        data: {
          blockName: "Block 2",
          requestId: "f447bc27-29cc-42ac-9bc5-5e5d5226dd77",
          folderId: "7901a45d-db3d-4cbb-a26b-56db5495e896",
          collectionId: "68ca9741f413f7c8814ea027",
          requestData: {
            headers: [
              {
                key: "",
                value: "",
                checked: false,
              },
            ],
            queryParams: [
              {
                key: "",
                value: "",
                checked: false,
              },
            ],
            body: {
              raw: '{"email":"aakashpabbathi@gmail.com","password":"123456789@"}',
              urlencoded: [
                {
                  key: "",
                  value: "",
                  checked: false,
                },
              ],
              formdata: {
                text: [
                  {
                    key: "",
                    value: "",
                    checked: false,
                  },
                ],
                file: [],
              },
            },
            auth: {
              bearerToken: "",
              basicAuth: {
                username: "",
                password: "",
              },
              apiKey: {
                authKey: "",
                authValue: "",
                addTo: "Header",
              },
            },
            url: "{{BASE_URL}}/api/auth/login",
            method: "POST",
            name: "/api/auth/login",
            selectedRequestBodyType: "application/json",
            selectedRequestAuthType: "No Auth",
          },
          name: "/api/auth/login",
          method: "POST",
        },
        position: {
          x: 437.0496088652046,
          y: 191.35979967907298,
        },
      },
    ];
    const edges = [
      {
        id: "xy-edge__1-2",
        source: "1",
        target: "2",
      },
      {
        id: "xy-edge__2-3",
        source: "2",
        target: "3",
      },
    ];
    const result = {
      status: "fail",
      successRequests: 2,
      failedRequests: 1,
      totalTime: "3.52 sec",
      request: [
        {
          method: "GET",
          name: "Sample-API",
          status: "200 OK",
          time: "866 ms",
        },
        {
          method: "POST",
          name: "/api/auth/login",
          status: "200 OK",
          time: "952 ms",
        },
      ],
      response: [
        {
          headers: [
            { key: "Content-Type", value: "application/json" },
            { key: "Cache-Control", value: "no-cache" },
            { key: "X-Request-ID", value: "abc123xyz" },
          ],
          status: "200 OK",
          body: JSON.stringify({
            message: "Success",
            data: {
              id: 101,
              name: "Sample Item",
              active: true,
            },
          }),
          time: 245,
          size: 512,
          responseContentType: "JSON",
        },
        {
          headers: [
            { key: "Content-Type", value: "application/json" },
            { key: "Cache-Control", value: "no-cache" },
            { key: "X-Request-ID", value: "abc123xyz" },
          ],
          status: "200 OK",
          body: JSON.stringify({
            message: "Success",
            data: {
              id: 101,
              name: "Sample Item",
              active: true,
            },
          }),
          time: 245,
          size: 512,
          responseContentType: "JSON",
        },
      ],
    };
    initTestflowScheduleRunViewTab.setNodes(nodes);
    initTestflowScheduleRunViewTab.setEdges(edges);
    initTestflowScheduleRunViewTab.setResult(result);
    initTestflowScheduleRunViewTab.updatePath({
      workspaceId: progressiveTab.path.workspaceId,
      testflowId: progressiveTab.path.testflowId,
    });
    this.tabRepository.createTab(initTestflowScheduleRunViewTab.getValue());
  };
}

export default MockHistoryExplorerPage;
