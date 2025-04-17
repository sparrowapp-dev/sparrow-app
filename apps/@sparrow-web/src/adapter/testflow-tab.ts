import { createDeepCopy } from "@sparrow/common/utils";
import { TabPersistenceTypeEnum, type Tab } from "@sparrow/common/types/workspace/tab";
import { InitTab } from "@sparrow/common/factory";
import { HttpRequestAuthTypeBaseEnum, HttpRequestContentTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
import { RequestDatasetEnum, RequestDataTypeEnum } from "@sparrow/common/types/workspace";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class TestflowTabAdapter {
  constructor() {}

private unsetBodyType = (bodyType: RequestDataTypeEnum | RequestDatasetEnum) : HttpRequestContentTypeBaseEnum => {
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
        contentType = HttpRequestContentTypeBaseEnum["application/x-www-form-urlencoded"];
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

   private unsetAuthType = (auth: HttpRequestAuthTypeBaseEnum) : HttpRequestAuthTypeBaseEnum => {
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

    private setAuthType = (auth: HttpRequestAuthTypeBaseEnum) : HttpRequestAuthTypeBaseEnum => {
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
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request tab frontend data
   * @returns
   */
  public adapt(
    workspaceId: string,
    _testflow: any,
  ): Tab {

    const testflow = createDeepCopy(_testflow);
    const initTestflowTab = new InitTab().testflow(
        testflow._id,
        workspaceId,
      );
  
      const nds = testflow.nodes.map((_nd : any)=>{
  
        if(_nd?.type === "startBlock"){
          return {
            ..._nd,
            data:{
              ..._nd?.data,
            }
          };
        }
        else{

             // parsing body type
            let requestBodyLanguage;
            let requestBodyNavigation;
            let requestAuthNavigation;

            const selectedRequestBodyType = _nd.data?.requestData?.selectedRequestBodyType;
            if (selectedRequestBodyType) {
            const bodyType = this.setBodyType(_nd.data?.requestData?.selectedRequestBodyType);
            requestBodyLanguage = bodyType.requestBodyLanguage;
            requestBodyNavigation = bodyType.requestBodyNavigation;
            } 
            

            // parsing request auth
            const selectedRequestAuthType = _nd.data?.requestData?.selectedRequestAuthType;
            if (selectedRequestAuthType) {
            const AuthType = this.setAuthType(_nd.data?.requestData?.selectedRequestAuthType);
            requestAuthNavigation = AuthType; 
            }


            delete _nd.data?.requestData?.selectedRequestBodyType;
            delete _nd.data?.requestData?.selectedRequestAuthType;
            _nd.data.requestData.autoGeneratedHeaders = [];

            return {
                ..._nd,
                data:{
                    ..._nd?.data,
                    requestData: {
                        ..._nd?.data?.requestData,
                        state: {
                            requestBodyLanguage: requestBodyLanguage ? requestBodyLanguage :"Text",
                            requestBodyNavigation: requestBodyNavigation ? requestBodyNavigation : "None",
                            requestAuthNavigation: requestAuthNavigation ? requestAuthNavigation : "No Auth",
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
                        }
            
                    }
                }
            };
        }
      });
    
      initTestflowTab.updateName(testflow.name);
      initTestflowTab.setNodes(nds);
      initTestflowTab.setEdges(testflow.edges);
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
    const nodes = requestTab?.property?.testflow?.nodes.map((nd) => {

    const bodyType =
        nd.data.requestData?.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? nd.data.requestData?.state.requestBodyLanguage
        : nd.data.requestData?.state.requestBodyNavigation;
      return {
        ...nd,
        data: {
            ...nd.data,
            name: nd.data?.requestData?.name,
            method: nd.data?.requestData?.method,
            requestData: {
                ...nd.data.requestData,
                selectedRequestBodyType: this.unsetBodyType(bodyType as RequestDataTypeEnum | RequestDatasetEnum),
                selectedRequestAuthType: this.unsetAuthType(
                    nd.data.requestData?.state?.requestAuthNavigation as HttpRequestAuthTypeBaseEnum,),

            }
            
        }
      }
    });
    nodes.forEach(nd => {
        if(nd?.type === "startBlock"){
            nd.data.requestData = null;
            nd.data.name = "";
            nd.data.method = "";
        }else{
            if(nd?.data?.requestData?.state){
                delete nd.data.requestData.state;
            }
            if(nd?.data?.requestData.autoGeneratedHeaders){
                delete nd.data.requestData.autoGeneratedHeaders
            }
        }
    });
    return {
        name: requestTab.name,
        nodes: nodes,
        edges: requestTab?.property?.testflow?.edges,
    };
  }
}
