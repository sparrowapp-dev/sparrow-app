import {
  createDeepCopy,
  setAuthType,
  setBodyType,
  unsetAuthType,
  unsetBodyType,
} from "$lib/utils/helpers";
import {
  RequestDatasetEnum,
  type FormData,
  type Path,
  type RequestTab,
} from "@common/types/workspace";
import { InitRequestTab } from "@common/utils";

export class RequestTabAdapter {
  constructor() {}

  // Method to adapt an OriginalObject to an AdaptedObject
  adapt(
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

    const selectedRequestBodyType = request.request?.selectedRequestBodyType;
    if (selectedRequestBodyType) {
      const bodyType = setBodyType(request.request?.selectedRequestBodyType);
      adaptedRequest.updateState({
        requestBodyLanguage: bodyType.requestBodyLanguage,
        requestBodyNavigation: bodyType.requestBodyNavigation,
      });
    }

    const selectedRequestAuthType = request.request?.selectedRequestAuthType;
    if (selectedRequestAuthType) {
      const AuthType = setAuthType(request.request?.selectedRequestAuthType);
      adaptedRequest.updateState({
        requestAuthNavigation: AuthType.requestAuthNavigation,
      });
    }

    const body = request?.request?.body;
    if (body) {
      console.log(body.formdata);
      const textData = body.formdata.text.map((text: FormData) => {
        return {
          key: text.key,
          value: text.value,
          checked: text.checked,
          type: "text",
          base: "",
        };
      });
      const fileData = body.formdata.file.map((file: FormData) => {
        return {
          key: file.key,
          value: file.value,
          checked: file.checked,
          type: "file",
          base: file.base,
        };
      });
      const formdata = [...textData, ...fileData];
      request.request.body.formdata = formdata;
      adaptedRequest.updateBody(request.request?.body);
    }
    return adaptedRequest.getValue();
  }

  // Method to unadapt an AdaptedObject back to an OriginalObject
  unadapt(requestTab: RequestTab) {
    requestTab = createDeepCopy(requestTab);
    const bodyType =
      requestTab.property.request.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? requestTab.property.request.state.requestBodyLanguage
        : requestTab.property.request.state.requestBodyNavigation;
    // compute form data
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
