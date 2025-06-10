import { createDeepCopy } from "@sparrow/common/utils";
import { InitTab } from "@sparrow/common/factory";
import {
  HttpRequestMockAuthModeBaseEnum,
  HttpRequestMockBodyModeBaseEnum,
  HttpRequestMockMethodBaseEnum,
  HttpResponseMockBodyModeBaseEnum,
} from "@sparrow/common/types/workspace/http-request-mock-base";
import {
  RequestDataTypeEnum,
  RequestDatasetEnum,
  type Auth,
  type KeyValueChecked,
  type Body,
} from "@sparrow/common/types/workspace/http-request-saved-tab";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import type { CollectionItemBaseInterface } from "@sparrow/common/types/workspace/collection-base";
import type { HttpRequestMockMetaDataDtoInterface } from "@sparrow/common/types/workspace/http-request-mock-dto";

/**
 * @class - this class makes mock request tab compatible with backend server
 */
export class RequestMockTabAdapter {
  constructor() {}

  // parsing from frontend to backend
  private unsetAuthType = (
    auth: HttpRequestMockAuthModeBaseEnum,
  ): HttpRequestMockAuthModeBaseEnum => {
    let authType = HttpRequestMockAuthModeBaseEnum.NO_AUTH;
    switch (auth) {
      case HttpRequestMockAuthModeBaseEnum.NO_AUTH:
        authType = HttpRequestMockAuthModeBaseEnum.NO_AUTH;
        break;
      case HttpRequestMockAuthModeBaseEnum.API_KEY:
        authType = HttpRequestMockAuthModeBaseEnum.API_KEY;
        break;
      case HttpRequestMockAuthModeBaseEnum.BASIC_AUTH:
        authType = HttpRequestMockAuthModeBaseEnum.BASIC_AUTH;
        break;
      case HttpRequestMockAuthModeBaseEnum.BEARER_TOKEN:
        authType = HttpRequestMockAuthModeBaseEnum.BEARER_TOKEN;
        break;
    }
    return authType;
  };

  // parsing from frontend to backend
  private unsetBodyType = (
    bodyType: RequestDataTypeEnum | RequestDatasetEnum,
  ) => {
    let contentType = HttpRequestMockBodyModeBaseEnum.TEXT;
    switch (bodyType) {
      case RequestDataTypeEnum.JSON:
        contentType = HttpRequestMockBodyModeBaseEnum.JSON;
        break;
      case RequestDataTypeEnum.XML:
        contentType = HttpRequestMockBodyModeBaseEnum.XML;
        break;
      case RequestDataTypeEnum.HTML:
        contentType = HttpRequestMockBodyModeBaseEnum.HTML;
        break;
      case RequestDataTypeEnum.JAVASCRIPT:
        contentType = HttpRequestMockBodyModeBaseEnum.JAVASCRIPT;
        break;
      case RequestDataTypeEnum.TEXT:
        contentType = HttpRequestMockBodyModeBaseEnum.TEXT;
        break;
      case RequestDatasetEnum.URLENCODED:
        contentType = HttpRequestMockBodyModeBaseEnum.URLENCODED;
        break;
      case RequestDatasetEnum.FORMDATA:
        contentType = HttpRequestMockBodyModeBaseEnum.FORMDATA;
        break;
    }
    return contentType;
  };

  // parsing from frontend to backend
  private unsetResponseBodyType = (
    bodyType: RequestDataTypeEnum | RequestDatasetEnum,
  ) => {
    let contentType = HttpResponseMockBodyModeBaseEnum.TEXT;
    switch (bodyType) {
      case RequestDataTypeEnum.JSON:
        contentType = HttpResponseMockBodyModeBaseEnum.JSON;
        break;
      case RequestDataTypeEnum.XML:
        contentType = HttpResponseMockBodyModeBaseEnum.XML;
        break;
      case RequestDataTypeEnum.HTML:
        contentType = HttpResponseMockBodyModeBaseEnum.HTML;
        break;
      case RequestDataTypeEnum.JAVASCRIPT:
        contentType = HttpResponseMockBodyModeBaseEnum.JAVASCRIPT;
        break;
      case RequestDataTypeEnum.TEXT:
        contentType = HttpResponseMockBodyModeBaseEnum.TEXT;
        break;
    }
    return contentType;
  };

  // parsing from backend to frontend
  private setAuthType = (
    auth: HttpRequestMockAuthModeBaseEnum,
  ): HttpRequestMockAuthModeBaseEnum => {
    let requestAuthNavigation = HttpRequestMockAuthModeBaseEnum.NO_AUTH;
    switch (auth) {
      case HttpRequestMockAuthModeBaseEnum.NO_AUTH:
        requestAuthNavigation = HttpRequestMockAuthModeBaseEnum.NO_AUTH;
        break;
      case HttpRequestMockAuthModeBaseEnum.API_KEY:
        requestAuthNavigation = HttpRequestMockAuthModeBaseEnum.API_KEY;
        break;
      case HttpRequestMockAuthModeBaseEnum.BASIC_AUTH:
        requestAuthNavigation = HttpRequestMockAuthModeBaseEnum.BASIC_AUTH;
        break;
      case HttpRequestMockAuthModeBaseEnum.BEARER_TOKEN:
        requestAuthNavigation = HttpRequestMockAuthModeBaseEnum.BEARER_TOKEN;
        break;
    }
    return requestAuthNavigation;
  };

  // parsing from backend to frontend
  private setBodyType = (header: HttpRequestMockBodyModeBaseEnum) => {
    let requestBodyNavigation = RequestDatasetEnum.RAW;
    let requestBodyLanguage = RequestDataTypeEnum.TEXT;
    switch (header) {
      case HttpRequestMockBodyModeBaseEnum.JSON:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.JSON;
        break;
      case HttpRequestMockBodyModeBaseEnum.XML:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.XML;
        break;
      case HttpRequestMockBodyModeBaseEnum.JAVASCRIPT:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.JAVASCRIPT;
        break;
      case HttpRequestMockBodyModeBaseEnum.TEXT:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.TEXT;
        break;
      case HttpRequestMockBodyModeBaseEnum.HTML:
        requestBodyNavigation = RequestDatasetEnum.RAW;
        requestBodyLanguage = RequestDataTypeEnum.HTML;
        break;
      case HttpRequestMockBodyModeBaseEnum.URLENCODED:
        requestBodyNavigation = RequestDatasetEnum.URLENCODED;
        break;
      case HttpRequestMockBodyModeBaseEnum.FORMDATA:
        requestBodyNavigation = RequestDatasetEnum.FORMDATA;
        break;
    }
    return { requestBodyLanguage, requestBodyNavigation };
  };

  // parsing from backend to frontend
  private setResponseBodyType = (header: HttpResponseMockBodyModeBaseEnum) => {
    let responseBodyNavigation = RequestDatasetEnum.RAW;
    let responseBodyLanguage = RequestDataTypeEnum.TEXT;
    switch (header) {
      case HttpResponseMockBodyModeBaseEnum.JSON:
        responseBodyNavigation = RequestDatasetEnum.RAW;
        responseBodyLanguage = RequestDataTypeEnum.JSON;
        break;
      case HttpResponseMockBodyModeBaseEnum.XML:
        responseBodyNavigation = RequestDatasetEnum.RAW;
        responseBodyLanguage = RequestDataTypeEnum.XML;
        break;
      case HttpResponseMockBodyModeBaseEnum.JAVASCRIPT:
        responseBodyNavigation = RequestDatasetEnum.RAW;
        responseBodyLanguage = RequestDataTypeEnum.JAVASCRIPT;
        break;
      case HttpResponseMockBodyModeBaseEnum.TEXT:
        responseBodyNavigation = RequestDatasetEnum.RAW;
        responseBodyLanguage = RequestDataTypeEnum.TEXT;
        break;
      case HttpResponseMockBodyModeBaseEnum.HTML:
        responseBodyNavigation = RequestDatasetEnum.RAW;
        responseBodyLanguage = RequestDataTypeEnum.HTML;
        break;
    }
    return { responseBodyLanguage, responseBodyNavigation };
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
    // _requestId: string,
    _mockRequest: CollectionItemBaseInterface,
  ): Tab {
    _mockRequest = createDeepCopy(_mockRequest);
    const adaptedRequest = new InitTab().mockRequest(
      _mockRequest.id,
      workspaceId,
    );
    const path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
      // requestId: _requestId,
    };
    adaptedRequest.updateName(_mockRequest.name);
    adaptedRequest.updateDescription(_mockRequest.description);
    adaptedRequest.updateMethod(
      _mockRequest.mockRequest?.method as HttpRequestMockMethodBaseEnum,
    );
    adaptedRequest.updateUrl(_mockRequest.mockRequest?.url as string);
    adaptedRequest.updateQueryParams(
      _mockRequest.mockRequest?.queryParams as KeyValueChecked[],
    );
    adaptedRequest.updateAuth(_mockRequest.mockRequest?.auth as Auth);
    adaptedRequest.updateResponseBody(
      _mockRequest.mockRequest?.responseBody as string,
    );
    adaptedRequest.updateResponseDate(
      _mockRequest.mockRequest?.responseDate as string,
    );
    adaptedRequest.updateResponseHeaders(
      _mockRequest.mockRequest?.responseHeaders as KeyValueChecked[],
    );
    adaptedRequest.updateResponseStatus(
      _mockRequest.mockRequest?.responseStatus as string,
    );
    adaptedRequest.updateHeaders(
      _mockRequest.mockRequest?.headers as KeyValueChecked[],
    );
    adaptedRequest.updatePath(path);
    adaptedRequest.updateItems(_mockRequest.items);

    // parsing body type
    const selectedRequestBodyType =
      _mockRequest.mockRequest?.selectedRequestBodyType;
    if (selectedRequestBodyType) {
      const bodyType = this.setBodyType(
        _mockRequest.mockRequest
          ?.selectedRequestBodyType as HttpRequestMockBodyModeBaseEnum,
      );
      const responseBodyType = this.setResponseBodyType(
        _mockRequest.mockRequest
          ?.selectedResponseBodyType as HttpResponseMockBodyModeBaseEnum,
      );
      adaptedRequest.updateState({
        requestBodyLanguage: bodyType.requestBodyLanguage,
        requestBodyNavigation: bodyType.requestBodyNavigation,
        responseBodyLanguage: responseBodyType.responseBodyLanguage,
      });
    }

    // parsing request auth
    const selectedRequestAuthType =
      _mockRequest.mockRequest?.selectedRequestAuthType;
    if (selectedRequestAuthType) {
      const AuthType = this.setAuthType(
        _mockRequest.mockRequest
          ?.selectedRequestAuthType as HttpRequestMockAuthModeBaseEnum,
      );
      adaptedRequest.updateState({
        requestAuthNavigation: AuthType,
      });
    }

    // parsing form data
    const body = _mockRequest?.mockRequest?.body;
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
        raw: _mockRequest.mockRequest?.body.raw,
        urlencoded: _mockRequest.mockRequest?.body.urlencoded,
        formdata: formdata,
      } as Body);
    }
    return adaptedRequest.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(_requestTab: Tab): HttpRequestMockMetaDataDtoInterface {
    _requestTab = createDeepCopy(_requestTab);
    const bodyType =
      _requestTab?.property?.mockRequest?.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? _requestTab.property?.mockRequest?.state.requestBodyLanguage
        : _requestTab.property?.mockRequest?.state.requestBodyNavigation;
    // parsing form data
    const textFormData: {
      key: string;
      value: string;
      checked: boolean;
    }[] = [];
    const fileFormData: {
      key: string;
      value: string;
      checked: boolean;
      base: string;
    }[] = [];

    _requestTab.property.mockRequest?.body.formdata.map((pair) => {
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
      method: _requestTab.property.mockRequest
        ?.method as HttpRequestMockMethodBaseEnum,
      url: _requestTab.property.mockRequest?.url as string,
      body: {
        raw: _requestTab.property.mockRequest?.body.raw,
        urlencoded: _requestTab.property.mockRequest?.body.urlencoded,
        formdata: {
          text: textFormData,
          file: fileFormData,
        },
      },
      headers: _requestTab.property.mockRequest?.headers,
      responseBody: _requestTab.property.mockRequest?.responseBody,
      responseHeaders: _requestTab.property.mockRequest?.responseHeaders,
      responseStatus: _requestTab.property.mockRequest
        ?.responseStatus as string,
      responseDate: _requestTab.property.mockRequest?.responseDate as string,
      queryParams: _requestTab.property.mockRequest?.queryParams,
      auth: _requestTab.property.mockRequest?.auth,
      selectedRequestBodyType: this.unsetBodyType(
        bodyType as RequestDatasetEnum | RequestDataTypeEnum,
      ),
      selectedResponseBodyType: this.unsetResponseBodyType(
        _requestTab.property.mockRequest?.state
          .responseBodyLanguage as RequestDataTypeEnum,
      ),
      selectedRequestAuthType: this.unsetAuthType(
        _requestTab.property.mockRequest?.state
          ?.requestAuthNavigation as HttpRequestMockAuthModeBaseEnum,
      ),
    };
  }
}
