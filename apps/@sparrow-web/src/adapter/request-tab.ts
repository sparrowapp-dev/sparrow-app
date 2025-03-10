import {
  createDeepCopy,
} from "@sparrow/common/utils";
import {
  RequestDatasetEnum,
  RequestDataTypeEnum,
  type FormData,
} from "@sparrow/common/types/workspace";
import { InitRequestTab } from "@sparrow/common/utils";
import { TabPersistenceTypeEnum, type Tab } from "@sparrow/common/types/workspace/tab";
import { HttpRequestAuthTypeBaseEnum, HttpRequestContentTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base"

/**
 * @class - this class makes request tab compatible with backend server
 */
export class RequestTabAdapter {
  constructor() {}

  private unsetBodyType = (bodyType: RequestDataTypeEnum | RequestDatasetEnum) : HttpRequestContentTypeBaseEnum => {
    let contentType = HttpRequestContentTypeBaseEnum["text/plain"];
    switch (bodyType) {
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
    collectionId: string,
    folderId: string,
    request: any,
  ): Tab {
    request = createDeepCopy(request);
    const adaptedRequest = new InitRequestTab(request.id, workspaceId);
    const path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
    };
    adaptedRequest.updateName(request.name);
    adaptedRequest.updateDescription(request.description);
    adaptedRequest.updateMethod(request.request?.method);
    adaptedRequest.updateUrl(request.request?.url);
    adaptedRequest.updateQueryParams(request.request?.queryParams);
    adaptedRequest.updateAuth(request.request?.auth);
    adaptedRequest.updateHeaders(request.request?.headers);
    adaptedRequest.updatePath(path);
    adaptedRequest.updateTabType(TabPersistenceTypeEnum.PERMANENT);

    // parsing body type
    const selectedRequestBodyType = request.request?.selectedRequestBodyType;
    if (selectedRequestBodyType) {
      const bodyType = this.setBodyType(request.request?.selectedRequestBodyType);
      adaptedRequest.updateState({
        requestBodyLanguage: bodyType.requestBodyLanguage,
        requestBodyNavigation: bodyType.requestBodyNavigation,
      });
    }

    // parsing request auth
    const selectedRequestAuthType = request.request?.selectedRequestAuthType;
    if (selectedRequestAuthType) {
      const AuthType = this.setAuthType(request.request?.selectedRequestAuthType);
      adaptedRequest.updateState({
        requestAuthNavigation: AuthType,
      });
    }

    // parsing form data
    const body = request?.request?.body;
    if (body) {
      const textData = body.formdata.text
        .filter((text: FormData) => {
          if (text.key || text.value) {
            return true;
          }
          return false;
        })
        .map((text: FormData) => {
          return {
            key: text.key,
            value: text.value,
            checked: text.checked,
            type: "text",
            base: "",
          };
        });
      const fileData = body.formdata.file
        .filter((file: FormData) => {
          if (file.key || file.value) {
            return true;
          }
          return false;
        })
        .map((file: FormData) => {
          return {
            key: file.key,
            value: file.value,
            checked: file.checked,
            type: "file",
            base: file.base,
          };
        });
      const formdata = [
        ...textData,
        ...fileData,
        {
          key: "",
          value: "",
          checked: false,
          type: "text",
          base: "",
        },
      ];
      request.request.body.formdata = formdata;
      adaptedRequest.updateBody(request.request?.body);
    }
    return adaptedRequest.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(requestTab: Tab) {
    requestTab = createDeepCopy(requestTab);
    const bodyType =
      requestTab.property.request?.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? requestTab.property.request?.state.requestBodyLanguage
        : requestTab.property.request?.state.requestBodyNavigation;
    // parsing form data
    const textFormData : {
      key: string;
      value: string;
      checked: boolean;
    }[] = [];
    const fileFormData : {
      key: string;
      value: string;
      checked: boolean;
      base: string;
    }[] = [];
    
    requestTab.property.request?.body.formdata.map((pair) => {
      if (pair.type == "text") {
        textFormData.push({
          key: pair.key,
          value: pair.value,
          checked: pair.checked,
        });
      } else if (pair.type == "file") {
        fileFormData.push({
          key: pair.key,
          value: pair.value,
          checked: pair.checked,
          base: "",
        });
      }
    });
    return {
      method: requestTab.property.request?.method,
      url: requestTab.property.request?.url,
      body: {
        raw : requestTab.property.savedRequest?.body.raw,
        urlencoded : requestTab.property.savedRequest?.body.urlencoded,
        formdata : {
          text: textFormData,
          file: fileFormData,
        }
      },
      headers: requestTab.property.request?.headers,
      queryParams: requestTab.property.request?.queryParams,
      auth: requestTab.property.request?.auth,
      selectedRequestBodyType: this.unsetBodyType(bodyType as RequestDataTypeEnum | RequestDatasetEnum),
      selectedRequestAuthType: this.unsetAuthType(
        requestTab.property.request?.state?.requestAuthNavigation as HttpRequestAuthTypeBaseEnum,
      ),
    };
  }
}
