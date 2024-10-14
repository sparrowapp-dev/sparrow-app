import {
  createDeepCopy,
  setAuthType,
  setBodyType,
  unsetAuthType,
  unsetBodyType,
} from "@sparrow/common/utils";
import {
  RequestDatasetEnum,
  type FormData,
  type Path,
  type RequestTab,
  type Tab,
} from "@sparrow/common/types/workspace";
import { InitRequestTab } from "@sparrow/common/utils";

/**
 * @class - this class makes request tab compatible with backend server
 */
export class RequestTabAdapter {
  constructor() {}

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
  ): RequestTab {
    request = createDeepCopy(request);
    const adaptedRequest = new InitRequestTab(request.id, workspaceId);
    const path: Path = {
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

    // parsing body type
    const selectedRequestBodyType = request.request?.selectedRequestBodyType;
    if (selectedRequestBodyType) {
      const bodyType = setBodyType(request.request?.selectedRequestBodyType);
      adaptedRequest.updateState({
        requestBodyLanguage: bodyType.requestBodyLanguage,
        requestBodyNavigation: bodyType.requestBodyNavigation,
      });
    }

    // parsing request auth
    const selectedRequestAuthType = request.request?.selectedRequestAuthType;
    if (selectedRequestAuthType) {
      const AuthType = setAuthType(request.request?.selectedRequestAuthType);
      adaptedRequest.updateState({
        requestAuthNavigation: AuthType.requestAuthNavigation,
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
      requestTab.property.request.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? requestTab.property.request.state.requestBodyLanguage
        : requestTab.property.request.state.requestBodyNavigation;
    // parsing form data
    const textFormData = [];
    const fileFormData = [];
    requestTab.property.request.body.formdata.map((pair) => {
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
    requestTab.property.request.body.formdata = {
      text: textFormData,
      file: fileFormData,
    };
    return {
      method: requestTab.property.request.method,
      url: requestTab.property.request.url,
      body: requestTab.property.request.body,
      headers: requestTab.property.request.headers,
      queryParams: requestTab.property.request.queryParams,
      auth: requestTab.property.request.auth,
      selectedRequestBodyType: unsetBodyType(bodyType),
      selectedRequestAuthType: unsetAuthType(
        requestTab.property.request.state?.requestAuthNavigation,
      ),
    };
  }
}
