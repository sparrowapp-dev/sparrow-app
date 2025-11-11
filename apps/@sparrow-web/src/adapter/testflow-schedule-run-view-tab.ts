import { createDeepCopy } from "@sparrow/common/utils";
import {
  TabPersistenceTypeEnum,
  type Tab,
} from "@sparrow/common/types/workspace/tab";
import { InitTab } from "@sparrow/common/factory";
import {
  HttpRequestAuthTypeBaseEnum,
  HttpRequestContentTypeBaseEnum,
} from "@sparrow/common/types/workspace/http-request-base";
import {
  RequestDatasetEnum,
  RequestDataTypeEnum,
} from "@sparrow/common/types/workspace";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class TestflowScheduleRunViewTabAdapter {
  constructor() {}

  private unsetBodyType = (
    bodyType: RequestDataTypeEnum | RequestDatasetEnum,
  ): HttpRequestContentTypeBaseEnum => {
    let contentType = HttpRequestContentTypeBaseEnum["text/plain"];
    switch (bodyType) {
      case RequestDatasetEnum.NONE:
        contentType = HttpRequestContentTypeBaseEnum["none"];
        break;
      case RequestDataTypeEnum.JSON:
        contentType = HttpRequestContentTypeBaseEnum["application/json"];
        break;
      case RequestDataTypeEnum.XML:
        contentType = HttpRequestContentTypeBaseEnum["application/xml"];
        break;
      case RequestDataTypeEnum.HTML:
        contentType = HttpRequestContentTypeBaseEnum["text/html"];
        break;
      case RequestDataTypeEnum.JAVASCRIPT:
        contentType = HttpRequestContentTypeBaseEnum["application/javascript"];
        break;
      case RequestDataTypeEnum.TEXT:
        contentType = HttpRequestContentTypeBaseEnum["text/plain"];
        break;
      case RequestDatasetEnum.URLENCODED:
        contentType =
          HttpRequestContentTypeBaseEnum["application/x-www-form-urlencoded"];
        break;
      case RequestDatasetEnum.FORMDATA:
        contentType = HttpRequestContentTypeBaseEnum["multipart/form-data"];
        break;
    }
    return contentType;
  };

  private setBodyType = (header: string) => {
    let requestBodyNavigation = RequestDatasetEnum.RAW;
    let requestBodyLanguage = RequestDataTypeEnum.TEXT;
    switch (header) {
      case HttpRequestContentTypeBaseEnum["none"]:
        requestBodyNavigation = RequestDatasetEnum.NONE;
        requestBodyLanguage = RequestDataTypeEnum.TEXT;
        break;
      case HttpRequestContentTypeBaseEnum["application/json"]:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.JSON;
        break;
      case HttpRequestContentTypeBaseEnum["application/xml"]:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.XML;
        break;
      case HttpRequestContentTypeBaseEnum["application/javascript"]:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.JAVASCRIPT;
        break;
      case HttpRequestContentTypeBaseEnum["text/plain"]:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.TEXT;
        break;
      case HttpRequestContentTypeBaseEnum["text/html"]:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.HTML;
        break;
      case HttpRequestContentTypeBaseEnum["application/x-www-form-urlencoded"]:
        requestBodyNavigation = RequestDatasetEnum.URLENCODED;
        break;
      case HttpRequestContentTypeBaseEnum["multipart/form-data"]:
        requestBodyNavigation = RequestDatasetEnum.FORMDATA;
        break;
    }
    return { requestBodyLanguage, requestBodyNavigation };
  };

  private unsetAuthType = (
    auth: HttpRequestAuthTypeBaseEnum,
  ): HttpRequestAuthTypeBaseEnum => {
    let authType = HttpRequestAuthTypeBaseEnum.NO_AUTH;
    switch (auth) {
      case HttpRequestAuthTypeBaseEnum.NO_AUTH:
        authType = HttpRequestAuthTypeBaseEnum.NO_AUTH;
        break;
      case HttpRequestAuthTypeBaseEnum.API_KEY:
        authType = HttpRequestAuthTypeBaseEnum.API_KEY;
        break;
      case HttpRequestAuthTypeBaseEnum.BASIC_AUTH:
        authType = HttpRequestAuthTypeBaseEnum.BASIC_AUTH;
        break;
      case HttpRequestAuthTypeBaseEnum.BEARER_TOKEN:
        authType = HttpRequestAuthTypeBaseEnum.BEARER_TOKEN;
        break;
      case HttpRequestAuthTypeBaseEnum.INHERIT_AUTH:
        authType = HttpRequestAuthTypeBaseEnum.INHERIT_AUTH;
        break;
    }
    return authType;
  };

  private setAuthType = (
    auth: HttpRequestAuthTypeBaseEnum,
  ): HttpRequestAuthTypeBaseEnum => {
    let requestAuthNavigation = HttpRequestAuthTypeBaseEnum.NO_AUTH;
    switch (auth) {
      case HttpRequestAuthTypeBaseEnum.NO_AUTH:
        requestAuthNavigation = HttpRequestAuthTypeBaseEnum.NO_AUTH;
        break;
      case HttpRequestAuthTypeBaseEnum.API_KEY:
        requestAuthNavigation = HttpRequestAuthTypeBaseEnum.API_KEY;
        break;
      case HttpRequestAuthTypeBaseEnum.BASIC_AUTH:
        requestAuthNavigation = HttpRequestAuthTypeBaseEnum.BASIC_AUTH;
        break;
      case HttpRequestAuthTypeBaseEnum.BEARER_TOKEN:
        requestAuthNavigation = HttpRequestAuthTypeBaseEnum.BEARER_TOKEN;
        break;
      case HttpRequestAuthTypeBaseEnum.INHERIT_AUTH:
        requestAuthNavigation = HttpRequestAuthTypeBaseEnum.INHERIT_AUTH;
        break;
    }
    return requestAuthNavigation;
  };

  /**
   * @description - parse backend data to frontend compatible
   * @param workspaceId - workspace id
   * @param _scheduleHistory - schedule history data
   * @param scheduleName - schedule name
   * @param _scheduleId - schedule id
   * @param _testflowId - testflow id
   * @param _selectedDataset - optional dataset information
   * @returns Tab
   */
  public adapt(
    workspaceId: string,
    _scheduleHistory: any,
    scheduleName: string,
    _scheduleId: string,
    _testflowId: string,
    _selectedDataset?: any,
  ): Tab {
    const scheduleHistory = createDeepCopy(_scheduleHistory);

    let actualScheduleData;
    let historyArray = [];
    let nodes = [];
    let edges = [];
    if (scheduleHistory?.originalDataSet?.schedularDataRunHistory) {
      // SCENARIO 1: scheduleHistory with originalDataSet containing schedularDataRunHistory
      actualScheduleData = scheduleHistory;
      historyArray = scheduleHistory.originalDataSet.schedularDataRunHistory;

      // Get nodes/edges from the first dataset run result or from the parent
      nodes = scheduleHistory?.originalDataSet?.nodes || [];
      edges = scheduleHistory?.originalDataSet?.edges || [];
    } else {
      // FALLBACK: Single schedule history object - wrap it in an array for consistent processing
      actualScheduleData = scheduleHistory;
      historyArray = [scheduleHistory]; // Put single object in array
      // Get nodes/edges directly from the schedule history
      nodes = scheduleHistory.nodes || [];
      edges = scheduleHistory.edges || [];
    }

    const initTestflowTab = new InitTab().testflowScheduleRunView(
      actualScheduleData?.id,
      workspaceId,
    );

    // Process nodes
    const processedNodes = nodes.map((_nd: any) => {
      if (_nd?.type === "startBlock") {
        return {
          ..._nd,
          data: {
            ..._nd?.data,
          },
        };
      } else {
        // parsing body type
        let requestBodyLanguage;
        let requestBodyNavigation;
        let requestAuthNavigation;

        const selectedRequestBodyType =
          _nd.data?.requestData?.selectedRequestBodyType;
        if (selectedRequestBodyType) {
          const bodyType = this.setBodyType(
            _nd.data?.requestData?.selectedRequestBodyType,
          );
          requestBodyLanguage = bodyType.requestBodyLanguage;
          requestBodyNavigation = bodyType.requestBodyNavigation;
        }

        // parsing request auth
        const selectedRequestAuthType =
          _nd.data?.requestData?.selectedRequestAuthType;
        if (selectedRequestAuthType) {
          const AuthType = this.setAuthType(
            _nd.data?.requestData?.selectedRequestAuthType,
          );
          requestAuthNavigation = AuthType;
        }

        // Safe property access with null checks
        if (_nd.data?.requestData) {
          delete _nd.data.requestData.selectedRequestBodyType;
          delete _nd.data.requestData.selectedRequestAuthType;

          _nd.data.requestData.autoGeneratedHeaders = [
            {
              key: "Accept",
              value: "*/*",
              checked: true,
            },
            {
              key: "Connection",
              value: "keep-alive",
              checked: true,
            },
            {
              key: "User-Agent",
              value:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
              checked: true,
            },
            {
              key: "Accept-Encoding",
              value: "gzip, br",
              checked: true,
            },
          ];
        }

        return {
          ..._nd,
          data: {
            ..._nd?.data,
            requestData: _nd?.data?.requestData
              ? {
                  ..._nd?.data?.requestData,
                  state: {
                    requestBodyLanguage: requestBodyLanguage
                      ? requestBodyLanguage
                      : "Text",
                    requestBodyNavigation: requestBodyNavigation
                      ? requestBodyNavigation
                      : "None",
                    requestAuthNavigation: requestAuthNavigation
                      ? requestAuthNavigation
                      : "No Auth",
                    requestNavigation: "Parameters",
                    responseNavigation: "Response",
                    responseBodyLanguage: "Text",
                    responseBodyFormatter: "Pretty",
                    requestExtensionNavigation: "",
                    requestLeftSplitterWidthPercentage: 50,
                    requestRightSplitterWidthPercentage: 50,
                    isExposeEditDescription: true,
                    isSendRequestInProgress: false,
                    isSaveDescriptionInProgress: false,
                    isSaveRequestInProgress: false,
                    isParameterBulkEditActive: false,
                    isHeaderBulkEditActive: false,
                    isChatbotActive: false,
                    isChatbotSuggestionsActive: true,
                    isChatbotGeneratingResponse: false,
                    isDocGenerating: false,
                    isDocAlreadyGenerated: false,
                  },
                }
              : null,
          },
        };
      }
    });

    // Create results array without dataset item handling
    const results = historyArray.map((history, index) => {
      return {
        datasetItemIndex: index,
        failedRequests: history.failedRequests || 0,
        successRequests: history.successRequests || 0,
        totalTime: history.totalTime || "0 ms",
        status: history.status || "unknown",
        requests: history.requests || [],
        responses: history.responses || [],
        edges: history.edges || [],
        nodes: history.nodes || [],
        createdAt:
          history.createdAt ||
          actualScheduleData?.createdAt ||
          new Date().toISOString(),
        updatedAt:
          history.updatedAt ||
          actualScheduleData?.updatedAt ||
          new Date().toISOString(),
      };
    });

    // Set basic tab information with enhanced naming
    initTestflowTab.setScheduleName(scheduleName);

    initTestflowTab.setName(scheduleName);
    initTestflowTab.setLastestTime(
      actualScheduleData?.createdAt ||
        historyArray[0]?.createdAt ||
        new Date().toISOString(),
    );
    initTestflowTab.setIsScheduled(actualScheduleData?.isScheduled ?? true);
    initTestflowTab.setNodes(processedNodes);
    initTestflowTab.setEdges(edges);
    initTestflowTab.setResults(results);

    // Set selected dataset information if provided
    if (_selectedDataset) {
      initTestflowTab.setSelectedDataset({
        id: _selectedDataset.id || "",
        name: _selectedDataset.name || "",
        formatType: _selectedDataset.formatType || "",
        fileSize: _selectedDataset.fileSize || "",
      });
    }

    initTestflowTab.updatePath({
      testflowScheduleId: _scheduleId,
      testflowId: _testflowId,
    });
    initTestflowTab.updateTabType(TabPersistenceTypeEnum.TEMPORARY);

    return initTestflowTab.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(_requestTab: Tab): any {
    const requestTab = createDeepCopy(_requestTab);

    const nodes =
      requestTab?.property?.testflowScheduleRunView?.nodes?.map((nd) => {
        const bodyType =
          nd.data?.requestData?.state?.requestBodyNavigation ===
          RequestDatasetEnum.RAW
            ? nd.data?.requestData?.state?.requestBodyLanguage
            : nd.data?.requestData?.state?.requestBodyNavigation;

        return {
          ...nd,
          data: {
            ...nd.data,
            name: nd.data?.requestData?.name || "",
            method: nd.data?.requestData?.method || "",
            requestData: nd.data?.requestData
              ? {
                  ...nd.data.requestData,
                  selectedRequestBodyType: this.unsetBodyType(
                    bodyType as RequestDataTypeEnum | RequestDatasetEnum,
                  ),
                  selectedRequestAuthType: this.unsetAuthType(
                    nd.data.requestData?.state
                      ?.requestAuthNavigation as HttpRequestAuthTypeBaseEnum,
                  ),
                }
              : null,
          },
        };
      }) || [];

    nodes.forEach((nd) => {
      if (nd?.type === "startBlock") {
        nd.data.requestData = null;
        nd.data.name = "";
        nd.data.method = "";
      } else {
        if (nd?.data?.requestData?.state) {
          delete nd.data.requestData.state;
        }
        if (nd?.data?.requestData?.autoGeneratedHeaders) {
          delete nd.data.requestData.autoGeneratedHeaders;
        }
      }
    });

    return {
      name: requestTab.name,
      nodes: nodes,
      edges: requestTab?.property?.testflowScheduleRunView?.edges || [],
    };
  }
}
