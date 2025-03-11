import {
  createDeepCopy,
} from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import { HttpRequestSavedAuthModeBaseEnum, HttpRequestSavedBodyModeBaseEnum, HttpRequestSavedMethodBaseEnum } from "@sparrow/common/types/workspace/http-request-saved-base";
import {  RequestDataTypeEnum, RequestDatasetEnum, type Auth, type KeyValueChecked, type Body } from "@sparrow/common/types/workspace/http-request-saved-tab";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import type { CollectionItemBaseInterface } from "@sparrow/common/types/workspace/collection-base";
import type { HttpRequestSavedMetaDataDtoInterface } from "@sparrow/common/types/workspace/http-request-saved-dto";

/**
 * @class - this class makes saved request tab compatible with backend server
 */
export class RequestSavedTabAdapter {
  constructor() {}

  // parsing from frontend to backend
  private unsetAuthType = (auth: HttpRequestSavedAuthModeBaseEnum): HttpRequestSavedAuthModeBaseEnum => {
    let authType = HttpRequestSavedAuthModeBaseEnum.NO_AUTH;
    switch (auth) {
      case HttpRequestSavedAuthModeBaseEnum.NO_AUTH:
        authType = HttpRequestSavedAuthModeBaseEnum.NO_AUTH;
        break;
      case HttpRequestSavedAuthModeBaseEnum.API_KEY:
        authType = HttpRequestSavedAuthModeBaseEnum.API_KEY;
        break;
      case HttpRequestSavedAuthModeBaseEnum.BASIC_AUTH:
        authType = HttpRequestSavedAuthModeBaseEnum.BASIC_AUTH;
        break;
      case HttpRequestSavedAuthModeBaseEnum.BEARER_TOKEN:
        authType = HttpRequestSavedAuthModeBaseEnum.BEARER_TOKEN;
        break;
    }
    return authType;
  };

  // parsing from frontend to backend
  private unsetBodyType = (bodyType: RequestDataTypeEnum | RequestDatasetEnum) => {
    let contentType = HttpRequestSavedBodyModeBaseEnum.TEXT;
    switch (bodyType) {
      case RequestDataTypeEnum.JSON:
        contentType = HttpRequestSavedBodyModeBaseEnum.JSON;
        break;
      case RequestDataTypeEnum.XML:
        contentType = HttpRequestSavedBodyModeBaseEnum.XML;
        break;
      case RequestDataTypeEnum.HTML:
        contentType = HttpRequestSavedBodyModeBaseEnum.HTML;
        break;
      case RequestDataTypeEnum.JAVASCRIPT:
        contentType = HttpRequestSavedBodyModeBaseEnum.JAVASCRIPT;
        break;
      case RequestDataTypeEnum.TEXT:
        contentType = HttpRequestSavedBodyModeBaseEnum.TEXT;
        break;
      case RequestDatasetEnum.URLENCODED:
        contentType = HttpRequestSavedBodyModeBaseEnum.URLENCODED;
        break;
      case RequestDatasetEnum.FORMDATA:
        contentType = HttpRequestSavedBodyModeBaseEnum.FORMDATA;
        break;
    }
    return contentType;
  };

  // parsing from backend to frontend
  private setAuthType = (auth: HttpRequestSavedAuthModeBaseEnum): HttpRequestSavedAuthModeBaseEnum => {
    let requestAuthNavigation = HttpRequestSavedAuthModeBaseEnum.NO_AUTH;
    switch (auth) {
      case HttpRequestSavedAuthModeBaseEnum.NO_AUTH:
        requestAuthNavigation = HttpRequestSavedAuthModeBaseEnum.NO_AUTH;
        break;
      case HttpRequestSavedAuthModeBaseEnum.API_KEY:
        requestAuthNavigation = HttpRequestSavedAuthModeBaseEnum.API_KEY;
        break;
      case HttpRequestSavedAuthModeBaseEnum.BASIC_AUTH:
        requestAuthNavigation = HttpRequestSavedAuthModeBaseEnum.BASIC_AUTH;
        break;
      case HttpRequestSavedAuthModeBaseEnum.BEARER_TOKEN:
        requestAuthNavigation = HttpRequestSavedAuthModeBaseEnum.BEARER_TOKEN;
        break;
    }
    return requestAuthNavigation ;
  };

  // parsing from backend to frontend
  private setBodyType = (header: HttpRequestSavedBodyModeBaseEnum) => {
    let requestBodyNavigation = RequestDatasetEnum.RAW;
    let requestBodyLanguage = RequestDataTypeEnum.TEXT;
    switch (header) {
      case HttpRequestSavedBodyModeBaseEnum.JSON:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.JSON;
        break;
      case HttpRequestSavedBodyModeBaseEnum.XML:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.XML;
        break;
      case HttpRequestSavedBodyModeBaseEnum.JAVASCRIPT:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.JAVASCRIPT;
        break;
      case HttpRequestSavedBodyModeBaseEnum.TEXT:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.TEXT;
        break;
      case HttpRequestSavedBodyModeBaseEnum.HTML:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.HTML;
        break;
      case HttpRequestSavedBodyModeBaseEnum.URLENCODED:
        requestBodyNavigation = RequestDatasetEnum.URLENCODED;
        break;
      case HttpRequestSavedBodyModeBaseEnum.FORMDATA:
        requestBodyNavigation = RequestDatasetEnum.FORMDATA;
        break;
    }
    return { requestBodyLanguage, requestBodyNavigation };
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
    _requestId: string,
    _savedRequest: CollectionItemBaseInterface,
  ): Tab {
    _savedRequest = createDeepCopy(_savedRequest);
    const adaptedRequest = new InitTab().savedRequest(_savedRequest.id, workspaceId);
    const path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
      requestId: _requestId,
    };
    adaptedRequest.updateName(_savedRequest.name);
    adaptedRequest.updateDescription(_savedRequest.description);
    adaptedRequest.updateMethod(_savedRequest.requestResponse?.method as HttpRequestSavedMethodBaseEnum);
    adaptedRequest.updateUrl(_savedRequest.requestResponse?.url as string);
    adaptedRequest.updateQueryParams(_savedRequest.requestResponse?.queryParams as KeyValueChecked[]);
    adaptedRequest.updateAuth(_savedRequest.requestResponse?.auth as Auth);
    adaptedRequest.updateResponseBody(_savedRequest.requestResponse?.responseBody as string);
    adaptedRequest.updateResponseDate(_savedRequest.requestResponse?.responseDate as string);
    adaptedRequest.updateResponseHeaders(_savedRequest.requestResponse?.responseHeaders as KeyValueChecked[]);
    adaptedRequest.updateResponseStatus(_savedRequest.requestResponse?.responseStatus as string);
    adaptedRequest.updateHeaders(_savedRequest.requestResponse?.headers as KeyValueChecked[]);
    adaptedRequest.updatePath(path);

    // parsing body type
    const selectedRequestBodyType = _savedRequest.requestResponse?.selectedRequestBodyType;
    if (selectedRequestBodyType) {
      const bodyType = this.setBodyType(_savedRequest.requestResponse?.selectedRequestBodyType as HttpRequestSavedBodyModeBaseEnum);
      adaptedRequest.updateState({
        requestBodyLanguage: bodyType.requestBodyLanguage,
        requestBodyNavigation: bodyType.requestBodyNavigation,
      });
    }

    // parsing request auth
    const selectedRequestAuthType = _savedRequest.requestResponse?.selectedRequestAuthType;
    if (selectedRequestAuthType) {
      const AuthType = this.setAuthType(_savedRequest.requestResponse?.selectedRequestAuthType as HttpRequestSavedAuthModeBaseEnum);
      adaptedRequest.updateState({
        requestAuthNavigation: AuthType,
      });
    }

    // parsing form data
    const body = _savedRequest?.requestResponse?.body;
    if (body) {
      const textData = body?.formdata?.text
        .filter((text) => {
          if (text.key || text.value) {
            return true;
          }
          return false;
        })
        .map((text) => {
          return {
            key: text.key,
            value: text.value,
            checked: text.checked,
            type: "text",
            base: "",
          };
        });
      const fileData = body?.formdata?.file
        .filter((file) => {
          if (file.key || file.value) {
            return true;
          }
          return false;
        })
        .map((file) => {
          return {
            key: file.key,
            value: file.value,
            checked: file.checked,
            type: "file",
            base: file.base,
          };
        });

      const formdata = [
        ...(Array.isArray(textData) ? textData : []),
        ...(Array.isArray(fileData) ? fileData : []),
        {
          key: "",
          value: "",
          checked: false,
          type: "text",
          base: "",
        },
      ];
      
      adaptedRequest.updateBody({
        raw: _savedRequest.requestResponse?.body.raw,
        urlencoded: _savedRequest.requestResponse?.body.urlencoded,
        formdata: formdata
      } as Body);
    }
    return adaptedRequest.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(_requestTab: Tab) : HttpRequestSavedMetaDataDtoInterface {
    _requestTab = createDeepCopy(_requestTab);
    const bodyType =
      _requestTab?.property?.savedRequest?.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? _requestTab.property?.savedRequest?.state.requestBodyLanguage
        : _requestTab.property?.savedRequest?.state.requestBodyNavigation;
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
    
    _requestTab.property.savedRequest?.body.formdata.map((pair) => {
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
          base: pair.base,
        });
      }
    });

    return {
      method: _requestTab.property.savedRequest?.method as HttpRequestSavedMethodBaseEnum,
      url: _requestTab.property.savedRequest?.url as string,
      body: {
        raw : _requestTab.property.savedRequest?.body.raw,
        urlencoded : _requestTab.property.savedRequest?.body.urlencoded,
        formdata : {
          text: textFormData,
          file: fileFormData,
        }
      },
      headers: _requestTab.property.savedRequest?.headers,
      responseBody: _requestTab.property.savedRequest?.responseBody,
      responseHeaders: _requestTab.property.savedRequest?.responseHeaders,
      responseStatus: _requestTab.property.savedRequest?.responseStatus as string,
      responseDate: _requestTab.property.savedRequest?.responseDate as string,
      queryParams: _requestTab.property.savedRequest?.queryParams,
      auth: _requestTab.property.savedRequest?.auth,
      selectedRequestBodyType: this.unsetBodyType(bodyType as RequestDatasetEnum | RequestDataTypeEnum),
      selectedRequestAuthType: this.unsetAuthType(
        _requestTab.property.savedRequest?.state?.requestAuthNavigation as HttpRequestSavedAuthModeBaseEnum,
      ),
    };
  }
}
