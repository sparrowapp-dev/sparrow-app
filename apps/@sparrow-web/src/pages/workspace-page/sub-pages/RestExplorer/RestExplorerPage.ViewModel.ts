// ---- Utils
import {
  DecodeRequest,
  ReduceRequestURL,
  ReduceQueryParams,
  ReduceAuthHeader,
  ReduceAuthParameter,
} from "@sparrow/workspaces/features/rest-explorer/utils";
import { createDeepCopy, scrollToTab } from "@sparrow/common/utils";
import {
  startLoading,
  stopLoading,
} from "../../../../../../../packages/@sparrow-common/src/store";
import {
  CompareArray,
  Debounce,
  InitRequestTab,
  MarkdownFormatter,
} from "@sparrow/common/utils";

// ---- DB
import type {
  CollectionDocument,
  TabDocument,
  WorkspaceDocument,
} from "../../../../database/database";

// ---- Repo
import { TabRepository } from "../../../../repositories/tab.repository";
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
import { BehaviorSubject, Observable } from "rxjs";
import {
  Events,
  ItemType,
  ResponseStatusCode,
  UntrackedItems,
} from "@sparrow/common/enums";
import type { CreateDirectoryPostBody } from "@sparrow/common/dto";

// ---- Service
import { makeHttpRequestV2 } from "@app/containers/api/api.common";
import {
  insertCollection,
  insertCollectionDirectory,
  insertCollectionRequest,
  updateCollectionRequest,
} from "../../../../services/collection";
import { EnvironmentService } from "../../../../services/environment.service";

// ---- Events
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import {
  type Auth,
  type Body,
  type KeyValueChecked,
  type Path,
  type Response,
  type KeyValue,
  type RequestTab,
  type StatePartial,
  type Conversation,
  MessageTypeEnum,
  ResponseSectionEnum,
  RequestDataTypeEnum,
  ResponseFormatterEnum,
  type HttpRequestCollectionLevelAuthTabInterface,
  type HttpRequestCollectionLevelAuthProfileTabInterface,
  RequestDatasetEnum,
} from "@sparrow/common/types/workspace";
import { notifications } from "@sparrow/library/ui";
import { RequestTabAdapter } from "../../../../adapter/request-tab";
import { GuideRepository } from "../../../../repositories/guide.repository";
import { CollectionService } from "../../../../services/collection.service";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { isGuestUserActive } from "@app/store/auth.store";
import { v4 as uuidv4 } from "uuid";
import { AiAssistantService } from "../../../../services/ai-assistant.service";
import type { GuideQuery } from "../../../../types/user-guide";
import { AiAssistantWebSocketService } from "../../../../services/ai-assistant.ws.service";
import type { Socket } from "socket.io-client";
import { restExplorerDataStore } from "@sparrow/workspaces/features/rest-explorer/store";
import { CollectionTabAdapter } from "@app/adapter";
import type { Tab } from "@sparrow/common/types/workspace/tab";
import { TabPersistenceTypeEnum } from "@sparrow/common/types/workspace/tab";
import {
  CollectionAuthTypeBaseEnum,
  CollectionItemTypeBaseEnum,
  CollectionRequestAddToBaseEnum,
  type CollectionAuthBaseInterface,
  type CollectionAuthProifleBaseInterface as AuthProfileDto,
  type TransformedRequest,
} from "@sparrow/common/types/workspace/collection-base";
import { HttpRequestAuthTypeBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
import { RequestSavedTabAdapter } from "src/adapter/request-saved-tab";
import { InitTab } from "@sparrow/common/factory";
import type { WorkspaceUserAgentBaseEnum } from "@sparrow/common/types/workspace/workspace-base";

import { getClientUser } from "src/utils/jwt";
import constants from "src/constants/constants";
import * as curlconverter from "curlconverter";
import * as Sentry from "@sentry/svelte";

class RestExplorerViewModel {
  /**
   * Repository
   */
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
  private guideRepository = new GuideRepository();
  private guestUserRepository = new GuestUserRepository();
  private compareArray = new CompareArray();

  /**
   * Service
   */
  private environmentService = new EnvironmentService();
  private collectionService = new CollectionService();
  private aiAssistentService = new AiAssistantService();
  private aiAssistentWebSocketService =
    AiAssistantWebSocketService.getInstance();
  /**
   * Utils
   */
  private _decodeRequest = new DecodeRequest();
  /**
   * Rest tools
   */
  private _authHeader: BehaviorSubject<KeyValue> = new BehaviorSubject({
    key: "",
    value: "",
  });
  private _authParameter: BehaviorSubject<KeyValue> = new BehaviorSubject({
    key: "",
    value: "",
  });
  private _tab: BehaviorSubject<RequestTab> = new BehaviorSubject({});

  public collectionSubscriber(_collectionId: string) {
    return this.collectionRepository.subscribeCollection(_collectionId);
  }

  private _collectionAuth = new BehaviorSubject<
    Partial<HttpRequestCollectionLevelAuthTabInterface>
  >({});

  private _collectionAuthProfile = new BehaviorSubject<
    Partial<HttpRequestCollectionLevelAuthProfileTabInterface>
  >({});

  private fetchCollection = async (_collectionId: string) => {
    const collectionRx =
      await this.collectionRepository.readCollection(_collectionId);
    const collectionDoc = collectionRx?.toMutableJSON();
    if (collectionDoc?.auth) {
      this.collectionAuth = {
        auth: collectionDoc?.auth,
        collectionAuthNavigation: collectionDoc?.selectedAuthType,
      } as HttpRequestCollectionLevelAuthTabInterface;
    } else {
      this.collectionAuth = {
        auth: {
          bearerToken: "",
          basicAuth: {
            username: "",
            password: "",
          },
          apiKey: {
            authKey: "",
            authValue: "",
            addTo: CollectionRequestAddToBaseEnum.HEADER,
          },
        },
        collectionAuthNavigation: CollectionAuthTypeBaseEnum.NO_AUTH,
      };
    }
    return collectionDoc;
  };

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(async () => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        delete t.index;
        t.persistence = TabPersistenceTypeEnum.PERMANENT;
        this.tab = t;

        const collectionDoc = await this.fetchCollection(
          t.path.collectionId as string,
        );
        const m = this._tab.getValue() as Tab;

        // console.log(
        //   "selectedRequestAuthProfileId:>> ",
        //   m.property.request?.state.requestAuthNavigation ===
        //     HttpRequestAuthTypeBaseEnum.AUTH_PROFILES &&
        //     !m.property.request?.state?.selectedRequestAuthProfileId,
        // );
        // if (
        //   m.property.request?.state.requestAuthNavigation ===
        //     HttpRequestAuthTypeBaseEnum.AUTH_PROFILES &&
        //   !m.property.request?.state?.selectedRequestAuthProfileId
        // ) {
        //   console.log("Setting default auth profile id!");
        //   const defaultAuthProfileId =
        //     collectionDoc?.defaultSelectedAuthProfile;
        //   this.updateRequestState({
        //     selectedRequestAuthProfileId: defaultAuthProfileId,
        //   });
        // }

        if (
          m.property.request?.state.requestAuthNavigation ===
          HttpRequestAuthTypeBaseEnum.INHERIT_AUTH
        ) {
          this.authHeader = new ReduceAuthHeader(
            this._collectionAuth.getValue()
              .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
            this._collectionAuth.getValue().auth as CollectionAuthBaseInterface,
          ).getValue();
          this.authParameter = new ReduceAuthParameter(
            this._collectionAuth.getValue()
              .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
            this._collectionAuth.getValue().auth as CollectionAuthBaseInterface,
          ).getValue();
        } else if (
          m.property.request?.state.requestAuthNavigation ===
          HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
        ) {
          const authProfilesList: AuthProfileDto[] =
            collectionDoc?.authProfiles || []; // ToDo: Ensure at least one default profile exists
          const selectedProfileId =
            m.property.request?.state?.selectedRequestAuthProfileId;

          const selectedProfile = selectedProfileId
            ? authProfilesList.find((pf) => pf.authId === selectedProfileId)
            : authProfilesList.find((pf) => pf.defaultKey);

          this.collectionAuthProfile = {
            auth: selectedProfile?.auth,
            authId: selectedProfileId as string,
            authType: selectedProfile?.authType,
          };

          this.authHeader = new ReduceAuthHeader(
            this._collectionAuthProfile.getValue()
              .authType as CollectionAuthTypeBaseEnum,
            this._collectionAuthProfile.getValue()
              .auth as CollectionAuthBaseInterface,
          ).getValue();
          this.authParameter = new ReduceAuthParameter(
            this._collectionAuthProfile.getValue()
              .authType as CollectionAuthTypeBaseEnum,
            this._collectionAuthProfile.getValue()
              .auth as CollectionAuthBaseInterface,
          ).getValue();
        } else {
          this.authHeader = new ReduceAuthHeader(
            this._tab.getValue().property.request?.state.requestAuthNavigation,
            this._tab.getValue().property.request?.auth,
          ).getValue();
          this.authParameter = new ReduceAuthParameter(
            this._tab.getValue().property.request?.state.requestAuthNavigation,
            this._tab.getValue().property.request?.auth,
          ).getValue();
        }
      }, 0);
    }
  }

  public openCollection = async () => {
    const collectionRx = await this.collectionRepository.readCollection(
      this._tab.getValue().path.collectionId,
    );
    const collectionDoc = collectionRx?.toMutableJSON();
    const collectionTab = new CollectionTabAdapter().adapt(
      this._tab.getValue().path.workspaceId,
      collectionDoc,
    );
    this.tabRepository.createTab(collectionTab);
  };

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public get tab(): Observable<RequestTab> {
    return this._tab.asObservable();
  }

  private set tab(value: RequestTab) {
    this._tab.next(value);
  }

  public get collectionAuth(): Observable<
    Partial<HttpRequestCollectionLevelAuthTabInterface>
  > {
    return this._collectionAuth.asObservable();
  }

  private set collectionAuth(
    value: HttpRequestCollectionLevelAuthTabInterface,
  ) {
    this._collectionAuth.next(value);
  }

  public get collectionAuthProfile(): Observable<
    Partial<HttpRequestCollectionLevelAuthProfileTabInterface>
  > {
    return this._collectionAuthProfile.asObservable();
  }

  private set collectionAuthProfile(
    value: HttpRequestCollectionLevelAuthProfileTabInterface,
  ) {
    this._collectionAuthProfile.next(value);
  }

  public get authHeader(): Observable<{
    key: string;
    value: string;
  }> {
    return this._authHeader.asObservable();
  }

  private set authHeader(value: KeyValue) {
    this._authHeader.next(value);
  }

  public get authParameter(): Observable<KeyValue> {
    return this._authParameter.asObservable();
  }

  private set authParameter(value: { key: string; value: string }) {
    this._authParameter.next(value);
  }

  /**
   * Compares the current request tab with the server version and updates the saved status accordingly.
   * This method is debounced to reduce the number of server requests.
   * @return A promise that resolves when the comparison is complete.
   */
  private compareRequestWithServerDebounced = async () => {
    let result = true;
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    const requestTabAdapter = new RequestTabAdapter();
    const unadaptedRequest = requestTabAdapter.unadapt(progressiveTab);
    let requestServer;
    if (progressiveTab.path.folderId) {
      requestServer = await this.collectionRepository.readRequestInFolder(
        progressiveTab.path.collectionId,
        progressiveTab.path.folderId,
        progressiveTab.id,
      );
    } else {
      requestServer =
        await this.collectionRepository.readRequestOrFolderInCollection(
          progressiveTab.path.collectionId,
          progressiveTab.id,
        );
    }
    if (!requestServer) result = false;
    // description
    else if (requestServer.description !== progressiveTab.description) {
      result = false;
    }
    // name
    else if (requestServer.name !== progressiveTab.name) {
      result = false;
    }
    // url
    else if (
      requestServer.request.url !== progressiveTab.property.request.url
    ) {
      result = false;
    }
    // method
    else if (
      requestServer.request.method !== progressiveTab.property.request.method
    ) {
      result = false;
    } else if (
      requestServer.request.selectedRequestAuthType !==
      progressiveTab.property.request.state.requestAuthNavigation
    ) {
      result = false;
    } else if (
      requestServer.request.selectedRequestAuthProfileId !==
      progressiveTab.property.request.state.selectedRequestAuthProfileId
    ) {
      result = false;
    }
    // auth key
    else if (
      requestServer.request.auth.apiKey.authKey !==
      progressiveTab.property.request.auth.apiKey.authKey
    ) {
      result = false;
    }
    // auth value
    else if (
      requestServer.request.auth.apiKey.authValue !==
      progressiveTab.property.request.auth.apiKey.authValue
    ) {
      result = false;
    }
    // addTo
    else if (
      requestServer.request.auth.apiKey.addTo !==
      progressiveTab.property.request.auth.apiKey.addTo
    ) {
      result = false;
    }
    // username
    else if (
      requestServer.request.auth.basicAuth.username !==
      progressiveTab.property.request.auth.basicAuth.username
    ) {
      result = false;
    }
    // password
    else if (
      requestServer.request.auth.basicAuth.password !==
      progressiveTab.property.request.auth.basicAuth.password
    ) {
      result = false;
    }
    // bearer tokem
    else if (
      requestServer.request.auth.bearerToken !==
      progressiveTab.property.request.auth.bearerToken
    ) {
      result = false;
    }
    // raw code
    else if (
      requestServer.request.body.raw !==
      progressiveTab.property.request.body.raw
    ) {
      result = false;
    }
    // url encode
    else if (
      !this.compareArray.init(
        requestServer.request.body.urlencoded,
        progressiveTab.property.request.body.urlencoded,
      )
    ) {
      result = false;
    }
    // form data
    else if (
      !this.compareArray.init(
        requestServer.request.body.formdata.text,
        unadaptedRequest.body.formdata.text,
      )
    ) {
      result = false;
    } else if (
      !this.compareArray.init(
        requestServer.request.body.formdata.file,
        unadaptedRequest.body.formdata.file,
      )
    ) {
      result = false;
    }
    // headers
    else if (
      !this.compareArray.init(
        requestServer.request.headers,
        progressiveTab.property.request.headers,
      )
    ) {
      result = false;
    } else if (
      !this.compareArray.init(
        requestServer.request.queryParams,
        progressiveTab.property.request.queryParams,
      )
    ) {
      result = false;
    }
    // result
    if (result) {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: true,
      });
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
    } else {
      this.tabRepository.updateTab(progressiveTab.tabId, {
        isSaved: false,
      });
      progressiveTab.isSaved = false;
      this.tab = progressiveTab;
    }
  };

  /**
   * Debounced method to compare the current request tab with the server version.
   */
  private compareRequestWithServer = new Debounce().debounce(
    this.compareRequestWithServerDebounced,
    0,
  );
  /**
   *
   * @returns guest user
   */
  public getGuestUser = async () => {
    const response = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    return response?.getLatest().toMutableJSON();
  };

  private formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-GB", options);

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 24h to 12h format

    return `(${formattedDate}, ${hours}:${minutes} ${ampm})`;
  };

  /**
   * Saves saved http request
   * @param componentData - refers overall saved request tab data.
   * @returns newly created saved request id.
   */
  private saveSavedRequest = async (componentData: Tab): Promise<string> => {
    const { folderId, collectionId, workspaceId, requestId } =
      componentData.path;
    let userSource = {};
    if (workspaceId && collectionId && requestId) {
      const requestSavedTabAdapter = new RequestSavedTabAdapter();
      const unadaptedRequest = requestSavedTabAdapter.unadapt(componentData);
      /**
       * handle request at collection level
       */
      const _collection = await this.readCollection(collectionId);
      if (_collection?.activeSync) {
        userSource = {
          currentBranch: _collection?.currentBranch,
          source: "USER",
        };
      }
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });

      if (isGuestUser == true) {
        const savedRequestId = uuidv4();
        const savedRequestData = {
          id: savedRequestId,
          name: componentData.name,
          description: componentData.description,
          type: CollectionItemTypeBaseEnum.SAVED_REQUEST,
          requestResponse: unadaptedRequest,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (folderId) {
          await this.collectionRepository.addSavedRequestInFolder(
            collectionId,
            folderId,
            requestId,
            savedRequestData,
          );
        } else {
          await this.collectionRepository.addSavedRequestInCollection(
            collectionId,
            requestId,
            savedRequestData,
          );
        }
        notifications.success("Response saved successfully.");
        return savedRequestId || "";
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const res = await this.collectionService.createSavedRequestInCollection(
        {
          collectionId: collectionId,
          workspaceId: workspaceId,
          requestId: requestId,
          folderId: folderId,
          ...userSource,
          items: {
            name: componentData.name,
            description: componentData.description,
            type: CollectionItemTypeBaseEnum.SAVED_REQUEST,
            requestResponse: unadaptedRequest,
          },
        },
        baseUrl,
      );
      if (res.isSuccessful) {
        if (folderId) {
          this.collectionRepository.addSavedRequestInFolder(
            collectionId,
            folderId,
            requestId,
            res.data.data,
          );
        } else {
          this.collectionRepository.addSavedRequestInCollection(
            collectionId,
            requestId,
            res.data.data,
          );
        }

        notifications.success("Response saved successfully.");
        return res?.data?.data?.id || "";
      } else {
        notifications.error("Failed to save response. Please try again.");
        return "";
      }
    }
    return "";
  };

  public saveResponse = async () => {
    const progressiveTab: Tab = createDeepCopy(this._tab.getValue());

    const savedRequestTab = new InitTab().savedRequest(
      UntrackedItems.UNTRACKED + uuidv4(),
      progressiveTab.path.workspaceId,
    );
    savedRequestTab.updateBody(progressiveTab.property.request?.body);
    savedRequestTab.updateUrl(progressiveTab.property.request?.url);
    savedRequestTab.updateName(progressiveTab.name + " - Response");
    savedRequestTab.updateDescription(progressiveTab.description);
    savedRequestTab.updateMethod(progressiveTab.property.request?.method);
    savedRequestTab.updateHeaders(progressiveTab.property.request?.headers);
    savedRequestTab.updateAuth(progressiveTab.property.request?.auth);
    savedRequestTab.updateIsSave(true);
    savedRequestTab.updateState({
      requestBodyNavigation:
        progressiveTab.property.request?.state.requestBodyNavigation,
      requestBodyLanguage:
        progressiveTab.property.request?.state.requestBodyLanguage,
      requestAuthNavigation:
        progressiveTab.property.request?.state.requestAuthNavigation,
    });
    savedRequestTab.updatePath({
      ...progressiveTab.path,
      requestId: progressiveTab.id,
    });
    savedRequestTab.updateQueryParams(
      progressiveTab.property.request?.queryParams,
    );
    let responseCode = "";
    restExplorerDataStore.update((restApiDataMap) => {
      let data = restApiDataMap.get(progressiveTab?.tabId);
      if (data) {
        savedRequestTab.updateResponseBody(data.response.body);
        savedRequestTab.updateResponseHeaders(data.response.headers);
        savedRequestTab.updateResponseStatus(data.response.status);
        savedRequestTab.updateResponseDate(this.formatDate(new Date()));
        savedRequestTab.updateState({
          responseBodyLanguage: data.response.bodyLanguage,
          responseBodyFormatter: data?.response?.bodyFormatter,
        });
        savedRequestTab.updateName(
          progressiveTab.name +
            ` (${data.response.status.replace(/^\d+\s*/, "")})`,
        );
        responseCode = data.response.status;
      }
      return restApiDataMap;
    });
    const savedRequestId = await this.saveSavedRequest(
      savedRequestTab.getValue(),
    );
    if (savedRequestId) {
      savedRequestTab.updateId(savedRequestId);
      this.tabRepository.createTab(savedRequestTab.getValue());
      MixpanelEvent(Events.SAVE_RESPONSE, {
        type: "REST",
        status_code: responseCode,
      });
      scrollToTab("");
    }
  };

  /**
   * Handles importing cURL data directly into the current tab
   * @param parsedCurlData The parsed cURL command data
   */
  public handleImportCurl = async (parsedCurlData: TransformedRequest) => {
    if (!parsedCurlData) return false;

    const progressiveTab = createDeepCopy(this._tab.getValue());

    try {
      // Update URL Name
      if (parsedCurlData.request.url && !progressiveTab.path.collectionId) {
        await this.updateRequestName(parsedCurlData.request.url);
      }
      // Update URL
      if (parsedCurlData.request.url) {
        await this.updateRequestUrl(parsedCurlData.request.url, false);
      }

      // Update method
      if (parsedCurlData.request.method) {
        await this.updateRequestMethod(
          parsedCurlData.request.method.toUpperCase(),
        );
      }

      // Update headers
      if (
        parsedCurlData.request.headers &&
        parsedCurlData.request.headers.length > 0
      ) {
        await this.updateHeaders(parsedCurlData.request.headers);
      }

      // Update query parameters if they exist in the parsed data
      if (
        parsedCurlData.request.queryParams &&
        parsedCurlData.request.queryParams.length > 0
      ) {
        await this.updateParams(parsedCurlData.request.queryParams, false);
      }

      // Update body
      if (parsedCurlData.request.body) {
        await this.updateRequestBody({
          raw: parsedCurlData.request.body,
          urlencoded:
            parsedCurlData.request.body.urlencoded ||
            progressiveTab.property.request.body.urlencoded,
          formdata:
            parsedCurlData.request.body.formdata ||
            progressiveTab.property.request.body.formdata,
        });
      }

      // Update auth if present
      if (
        parsedCurlData.request.auth &&
        Object.keys(parsedCurlData.request.auth).length > 0
      ) {
        await this.updateRequestAuth(parsedCurlData.request.auth);
      }
      await this.updateRequestState({
        requestBodyNavigation: RequestDatasetEnum.RAW,
      });

      // Track the event
      MixpanelEvent(Events.IMPORT_API_VIA_CURL, {
        source: "URL input",
      });

      notifications.success("cURL imported successfully!");
      return true;
    } catch (error) {
      console.error("Error importing cURL:", error);
      notifications.error("Failed to import cURL. Please try again.");
      return false;
    }
  };

  public handleFormatCurl = (curlCommand: string): string => {
    const rawLiteralRegex = /(\$'[\s\S]*?')$/m;
    let rawLiteral = "";
    const rawMatch = curlCommand.match(rawLiteralRegex);
    if (rawMatch) {
      rawLiteral = rawMatch[0];
      curlCommand = curlCommand.slice(0, rawMatch.index).trim();
    }
    const heredocRegex = /(<<\s*EOF[\s\S]*?^EOF\s*)$/m;
    const heredocMatch = curlCommand.match(heredocRegex);
    let heredoc = "";
    if (heredocMatch) {
      heredoc = heredocMatch[0]
        .replace(/\r\n/g, "\n")
        .replace(/^\s+|\s+$/g, "");
      curlCommand = curlCommand.slice(0, heredocMatch.index).trim();
    }
    curlCommand = curlCommand.replace(/\\\s*\n\s*/g, " ");
    curlCommand = curlCommand.replace(/\\\s*/g, " ");
    curlCommand = curlCommand.replace(/\s+/g, " ").trim();
    const parts = curlCommand.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    let formatted = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0) {
        formatted += part;
      } else if (
        part.startsWith("--") ||
        (part.startsWith("-") && !/^-\d/.test(part))
      ) {
        formatted += " \\\n  " + part;
      } else if (
        /^https?:\/\//.test(part) ||
        /^\$\{.*\}/.test(part) ||
        /^[\w\/:.?&=%-]+$/.test(part)
      ) {
        if (parts[i - 1] && parts[i - 1].startsWith("--request")) {
          formatted += " " + part;
        } else {
          formatted += " \\\n  " + part;
        }
      } else {
        formatted += " " + part;
      }
    }
    if (heredoc) {
      const [firstLine, ...restLines] = heredoc.split("\n");
      formatted += " \\\n  " + firstLine + "\n" + restLines.join("\n");
    }
    if (rawLiteral && !formatted.includes(rawLiteral)) {
      formatted += ` \\\n  ${rawLiteral}`;
    }
    return formatted.trim();
  };

  public handleFormatUrl = (url: string) => {
    url = url.replace(/^(https?:\/\/\s*)+(https?:\/\/)/, "$2");
    return url;
  };

  public transformRequest = (requestObject: any, username: string) => {
    let url = requestObject.url || "";
    let raw_url = requestObject.raw_url || "";
    let method = requestObject.method || "GET";
    let headers = requestObject.headers || [];
    let body = requestObject.body || requestObject.data || "";
    let files = requestObject.files || [];
    let params = [];
    let auth = requestObject.auth || {};
    let queryParams = [];

    // Format queryParams (always add an empty param at the end)
    if (raw_url && raw_url.includes("?")) {
      const [baseUrl, queryString] = raw_url.split("?");
      url = baseUrl;
      queryParams = queryString
        .split("&")
        .map((pair) => {
          const eqIdx = pair.indexOf("=");
          if (eqIdx === -1) {
            return { key: pair.trim(), value: "", checked: true };
          }
          const key = pair.slice(0, eqIdx).trim();
          const value = pair.slice(eqIdx + 1).trim();
          return { key, value, checked: true };
        })
        .filter((item) => item.key);
      queryParams.push({ key: "", value: "", checked: true });
    } else {
      queryParams = [{ key: "", value: "", checked: true }];
    }

    // Format headers
    if (
      !Array.isArray(headers) &&
      typeof headers === "object" &&
      headers !== null
    ) {
      headers = Object.entries(headers)
        .filter(([key]) => key && key.trim() !== "")
        .map(([key, value]) => ({
          key: key.trim(),
          value:
            value !== undefined && value !== null ? String(value).trim() : "",
          checked: true,
        }));
      headers.push({ key: "", value: "", checked: true });
    } else {
      headers = [{ key: "", value: "", checked: true }];
    }

    // Format files
    files = Array.isArray(files)
      ? files.map((f) =>
          typeof f === "string"
            ? {
                key: f.split("=")[0],
                value: f.split("=").slice(1).join("="),
                checked: true,
              }
            : { key: f.key, value: f.value, checked: true },
        )
      : [];

    // Format body (for JSON, form, etc.)
    if (typeof body === "object" && body !== null) {
      try {
        body = JSON.stringify(body, null, 2);
      } catch {
        body = String(body);
      }
    }

    // Format auth
    if (auth && typeof auth === "object") {
      auth = {
        ...auth,
        checked: true,
      };
    }

    return {
      request: {
        url: this.handleFormatUrl(url),
        method,
        headers,
        body,
        files,
        params,
        auth,
        queryParams,
      },
      username,
    };
  };

  public parseCurl = (curl: string): TransformedRequest => {
    if (!curl || !curl.length) {
      throw new Error();
    }
    const updatedCurl = this.handleFormatCurl(curl);
    const stringifiedCurl = curlconverter.toJsonString(updatedCurl);
    const parsedCurl = JSON.parse(stringifiedCurl);

    // Match all -F flags with their key-value pairs
    const formDataMatches = curl.match(/-F\s+'([^=]+)=@([^;]+)/g);
    const formDataItems = formDataMatches
      ? formDataMatches.map((match) => {
          const [, keyValue] = match.split("-F '");
          const [key, filePath] = keyValue.split("=@");
          const value = filePath.replace(/'/g, "");
          return {
            key,
            value,
            checked: true,
            base: value,
          };
        })
      : [];
    if (formDataItems.length > 0) {
      parsedCurl.files = formDataItems;
    }
    return this.transformRequest(parsedCurl, "anonymous");
  };

  /**
   * Updates the request URL or imports a cURL command.
   * If the input starts with "curl ", it will parse and import the cURL.
   * Otherwise, it will treat the input as a plain URL.
   * @param value - The URL or cURL command.
   * @param effectQueryParams - Whether to update query params from the URL.
   */
  public updateRequestUrl = async (
    _url: string,
    _effectQueryParams: boolean = true,
  ) => {
    if (typeof _url === "string" && _url.trim().startsWith("curl ")) {
      try {
        const parsed = this.parseCurl(_url);
        if (parsed) {
          await this.handleImportCurl(parsed);
          return;
        }
      } catch (err) {
        console.error("Failed to parse cURL command:", err);
        notifications.error("Failed to parse cURL command.");
      }
    }
    // Handle as plain URL
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    if (_url === progressiveTab.property.request.url) {
      return;
    }
    progressiveTab.property.request.url = _url;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (_effectQueryParams) {
      const reducedURL = new ReduceRequestURL(_url);
      await this.updateParams(reducedURL.getQueryParameters(), false);
    }
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _path - request path
   */
  private updateRequestPath = async (_path: Path) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.path = _path;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _id - request mongo id
   */
  private updateRequestId = async (_id: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.id = _id;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _description - request description
   */
  public updateRequestDescription = async (_description: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _description;
    this.tab = progressiveTab;
    try {
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    } catch (error) {
      notifications.error(
        "Failed to update the documentation. Please try again",
      );
    }
    this.compareRequestWithServer();
  };

  /**
   * @description - updates request tab name
   * @param _name - new request name
   */
  public updateNameWithCollectionList = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (_name !== progressiveTab.name) {
      progressiveTab.name = _name;
    }
    this.tab = progressiveTab;
  };

  /**
   *
   * @param _name - request name
   */
  public updateRequestName = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.name = _name;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   * Updates the AI prompt in the request property of the current tab.
   *
   * @param  _prompt - The new AI prompt to set.
   * @returns A promise that resolves when the update is complete.
   */
  public updateRequestAIPrompt = async (_prompt: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.ai.prompt = _prompt;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * Updates the AI thread ID in the request property of the current tab.
   *
   * @param _threadId - The new AI thread ID to set.
   * @returns A promise that resolves when the update is complete.
   */
  public updateRequestAIThread = async (_threadId: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.ai.threadId = _threadId;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };
  /**
   * Updates the AI model name in the request property of the current tab.
   *
   * @param _threadId - The new AI model name to set.
   * @returns A promise that resolves when the update is complete.
   */
  public updateAIModel = async (_modelName: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.ai.aiModelName = _modelName;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * Updates the AI conversations in the request property of the current tab.
   *
   * @param _conversations - The new AI conversations to set.
   * @returns  A promise that resolves when the update is complete.
   */
  public updateRequestAIConversation = async (
    _conversations: Conversation[],
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.ai.conversations = _conversations;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param method request method
   */
  public updateRequestMethod = async (method: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.method = method;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _headers - request headers
   */
  public updateHeaders = async (_headers: KeyValueChecked[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.headers = _headers;
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _params - request query parameters
   * @param _effectURL - lag that effect request url
   */
  public updateParams = async (
    _params: KeyValueChecked[],
    _effectURL: boolean = true,
  ) => {
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    if (
      JSON.stringify(_params) ===
      JSON.stringify(progressiveTab.property.request.queryParams)
    ) {
      return;
    }
    progressiveTab.property.request.queryParams = _params;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (_effectURL) {
      const reducedQueryParams = new ReduceQueryParams(_params);
      const reducedURL = new ReduceRequestURL(
        progressiveTab.property.request?.url,
      );
      if (
        reducedQueryParams.getValue() === "" ||
        reducedQueryParams.getValue() === "="
      ) {
        await this.updateRequestUrl(reducedURL.getHost(), false);
      } else {
        await this.updateRequestUrl(
          reducedURL.getHost() + "?" + reducedQueryParams.getValue(),
          false,
        );
      }
    }
    this.compareRequestWithServer();
  };

  /**
   *
   * @param headers - request auto generated headers
   */
  public updateAutoGeneratedHeaders = async (headers: KeyValueChecked[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.autoGeneratedHeaders = headers;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _state - request state
   */
  public updateRequestState = async (_state: StatePartial) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.state = {
      ...progressiveTab.property.request.state,
      ..._state,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);

    if (_state.requestAuthNavigation || _state.selectedRequestAuthProfileId) {
      if (
        _state.requestAuthNavigation ===
        HttpRequestAuthTypeBaseEnum.INHERIT_AUTH
      ) {
        this.authHeader = new ReduceAuthHeader(
          this._collectionAuth.getValue()
            .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
          this._collectionAuth.getValue().auth as CollectionAuthBaseInterface,
        ).getValue();
        this.authParameter = new ReduceAuthParameter(
          this._collectionAuth.getValue()
            .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
          this._collectionAuth.getValue().auth as CollectionAuthBaseInterface,
        ).getValue();
      } else if (
        _state.requestAuthNavigation ===
        HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
      ) {
        this.authHeader = new ReduceAuthHeader(
          this._collectionAuthProfile.getValue()
            .authType as CollectionAuthTypeBaseEnum,
          this._collectionAuthProfile.getValue()
            .auth as CollectionAuthBaseInterface,
        ).getValue();
        this.authParameter = new ReduceAuthParameter(
          this._collectionAuthProfile.getValue()
            .authType as CollectionAuthTypeBaseEnum,
          this._collectionAuthProfile.getValue()
            .auth as CollectionAuthBaseInterface,
        ).getValue();
      } else if (_state.selectedRequestAuthProfileId) {
        const m = this._tab.getValue() as Tab;
        const collectionDoc = await this.fetchCollection(
          m.path.collectionId as string,
        );

        const authProfilesList: AuthProfileDto[] =
          collectionDoc?.authProfiles || []; // ToDo: Ensure at least one default profile exists
        const selectedProfileId =
          m.property.request?.state?.selectedRequestAuthProfileId;

        const selectedProfile = selectedProfileId
          ? authProfilesList.find((pf) => pf.authId === selectedProfileId)
          : authProfilesList.find((pf) => pf.defaultKey);

        this.collectionAuthProfile = {
          auth: selectedProfile?.auth,
          authId: selectedProfileId as string,
          authType: selectedProfile?.authType,
        };

        this.authHeader = new ReduceAuthHeader(
          this._collectionAuthProfile.getValue()
            .authType as CollectionAuthTypeBaseEnum,
          this._collectionAuthProfile.getValue()
            .auth as CollectionAuthBaseInterface,
        ).getValue();
        this.authParameter = new ReduceAuthParameter(
          this._collectionAuthProfile.getValue()
            .authType as CollectionAuthTypeBaseEnum,
          this._collectionAuthProfile.getValue()
            .auth as CollectionAuthBaseInterface,
        ).getValue();
      } else {
        this.authHeader = new ReduceAuthHeader(
          progressiveTab.property.request.state.requestAuthNavigation,
          progressiveTab.property.request.auth,
        ).getValue();
        this.authParameter = new ReduceAuthParameter(
          progressiveTab.property.request.state.requestAuthNavigation,
          progressiveTab.property.request.auth,
        ).getValue();
      }
    }
    this.compareRequestWithServer();
  };

  /**
   *
   * @param  - response state
   */
  public updateResponseState = async (key, val) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    if (key === "responseNavigation") {
      restExplorerDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.navigation = val;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
    } else if (key === "responseBodyLanguage") {
      restExplorerDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.bodyLanguage = val;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
    } else if (key === "responseBodyFormatter") {
      restExplorerDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.response.bodyFormatter = val;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
    }
  };

  /**
   *
   * @param _auth - request auth
   */
  public updateRequestAuth = async (_auth: Auth) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.auth = {
      ...progressiveTab.property.request.auth,
      ..._auth,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.authHeader = new ReduceAuthHeader(
      progressiveTab.property.request.state.requestAuthNavigation,
      progressiveTab.property.request.auth,
    ).getValue();
    this.authParameter = new ReduceAuthParameter(
      progressiveTab.property.request.state.requestAuthNavigation,
      progressiveTab.property.request.auth,
    ).getValue();
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _body - request body
   */
  public updateRequestBody = async (_body: Body) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.body = {
      ...progressiveTab.property.request.body,
      ..._body,
    };
    this.tab = progressiveTab;
    await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.compareRequestWithServer();
  };

  /**
   *
   * @param _response response
   */
  public updateResponse = async (_response: Response) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.response = _response;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * @description clear response of a request
   */
  public clearResponse = async () => {
    const response = new InitRequestTab(
      UntrackedItems.UNTRACKED,
      "UNTRACKED-",
    ).getValue().property.request?.response as Response;
    this.updateResponse(response);
  };

  /**
   * @description send request
   */
  public sendRequest = async (environmentVariables = []) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    const abortController = new AbortController();
    restExplorerDataStore.update((restApiDataMap) => {
      let data = restApiDataMap.get(progressiveTab.tabId);
      if (data) {
        data.abortController = abortController;
      } else {
        data = {
          abortController: abortController,
          response: {
            body: "",
            headers: [],
            status: "",
            time: 0,
            size: 0,
            navigation: ResponseSectionEnum.RESPONSE,
            bodyLanguage: RequestDataTypeEnum.TEXT,
            bodyFormatter: ResponseFormatterEnum.PRETTY,
          },
          isSendRequestInProgress: false,
        };
      }
      restApiDataMap.set(progressiveTab.tabId, data);
      return restApiDataMap;
    });
    // Create an AbortController for the request
    const { signal } = abortController; // Extract the signal for the request

    restExplorerDataStore.update((restApiDataMap) => {
      let data = restApiDataMap.get(progressiveTab?.tabId);
      if (data) {
        data.isSendRequestInProgress = true;
      }
      restApiDataMap.set(progressiveTab.tabId, data);
      return restApiDataMap;
    });
    const start = Date.now();

    const decodeData = this._decodeRequest.init(
      this._tab.getValue().property.request,
      environmentVariables.filtered,
      this._tab.getValue().property.request.state.requestAuthNavigation ===
        HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
        ? ({
            auth: this._collectionAuthProfile.getValue().auth,
            collectionAuthNavigation:
              this._collectionAuthProfile.getValue().authType,
          } as HttpRequestCollectionLevelAuthTabInterface)
        : this._collectionAuth.getValue(),
    );
    const selectedAgent = localStorage.getItem(
      "selectedAgent",
    ) as WorkspaceUserAgentBaseEnum;
    makeHttpRequestV2(...decodeData, selectedAgent, signal)
      .then((response) => {
        if (response.isSuccessful === false) {
          restExplorerDataStore.update((restApiDataMap) => {
            const data = restApiDataMap.get(progressiveTab?.tabId);
            if (data) {
              data.response.body = response?.message ?? "";
              data.response.headers = [];
              data.response.status = ResponseStatusCode.ERROR;
              data.response.time = 0;
              data.response.size = 0;
              data.isSendRequestInProgress = false;
            }
            restApiDataMap.set(progressiveTab.tabId, data);
            return restApiDataMap;
          });
        } else {
          const end = Date.now();
          const byteLength = new TextEncoder().encode(
            JSON.stringify(response),
          ).length;
          const responseSizeKB = byteLength / 1024;
          const duration = end - start;
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
          let responseStatus = response.data.status;
          const bodyLanguage =
            this._decodeRequest.setResponseContentType(responseHeaders);

          restExplorerDataStore.update((restApiDataMap) => {
            let data = restApiDataMap.get(progressiveTab?.tabId);
            if (data) {
              data.response.body = responseBody;
              data.response.headers = responseHeaders;
              data.response.status = responseStatus;
              data.response.time = duration;
              data.response.size = responseSizeKB;
              data.response.bodyLanguage = bodyLanguage;
              data.isSendRequestInProgress = false;
            }
            restApiDataMap.set(progressiveTab.tabId, data);

            return restApiDataMap;
          });
        }
      })
      .catch((error) => {
        // Handle cancellation or other errors
        if (error.name === "AbortError") {
          return;
        }

        restExplorerDataStore.update((restApiDataMap) => {
          const data = restApiDataMap.get(progressiveTab?.tabId);
          if (data) {
            data.response.body = "";
            data.response.headers = [];
            data.response.status = ResponseStatusCode.ERROR;
            data.response.time = 0;
            data.response.size = 0;
            data.isSendRequestInProgress = false;
          }
          restApiDataMap.set(progressiveTab.tabId, data);
          return restApiDataMap;
        });
      });
  };

  /**
   * aborts the ongoing api request
   */
  public cancelRequest = (): Promise<void> => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    let abortController;
    restExplorerDataStore.update((restApiDataMap) => {
      const data = restApiDataMap.get(progressiveTab.tabId);
      if (data) {
        abortController = data.abortController;
      }
      return restApiDataMap;
    });
    if (abortController) {
      abortController.abort(); // Abort the request using the stored controller
      restExplorerDataStore.update((restApiDataMap) => {
        const data = restApiDataMap.get(progressiveTab?.tabId);
        if (data) {
          data.isSendRequestInProgress = false;
        }
        restApiDataMap.set(progressiveTab.tabId, data);
        return restApiDataMap;
      });
    }
  };

  /**
   *
   * @param uuid  - collection id
   * @returns - collection Document
   */
  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  /**
   *
   * @param collectionId - collection id
   * @param uuid - request or folder id
   * @returns - request document
   */
  public readRequestOrFolderInCollection = (
    collectionId: string,
    uuid: string,
  ): Promise<object> => {
    return this.collectionRepository.readRequestOrFolderInCollection(
      collectionId,
      uuid,
    );
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param uuid - request id
   * @returns - request document
   */
  public readRequestInFolder = (
    collectionId: string,
    folderId: string,
    uuid: string,
  ) => {
    return this.collectionRepository.readRequestInFolder(
      collectionId,
      folderId,
      uuid,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionId - collection id
   * @param _folderName - folder name
   * @returns - folder status message
   */
  public createFolder = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionId: string,
    _folderName: string,
  ) => {
    let userSource = {};
    const _collection: CollectionDocument =
      await this.readCollection(_collectionId);
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const directory: CreateDirectoryPostBody = {
      name: _folderName,
      description: "",
      ...userSource,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser == true) {
      const data = {
        id: uuidv4(),
        name: _folderName,
        description: "",
        type: "FOLDER",
        source: "USER",
        isDeleted: false,
        items: [],
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: "",
        updatedAt: "",
      };

      const latestRoute = {
        id: data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    }

    const res = await insertCollectionDirectory(
      _workspaceMeta.id,
      _collectionId,
      directory,
    );
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: res.data.data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionName - collection name
   * @returns - collection status message
   */
  public createCollection = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionName: string,
  ) => {
    const newCollection = {
      name: _collectionName,
      workspaceId: _workspaceMeta.id,
    };

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });

    if (isGuestUser == true) {
      const data = {
        _id: uuidv4(),
        name: _collectionName,
        totalRequests: 0,
        createdBy: "Guest User",
        items: [],
        updatedBy: "Guest User",
        // createdAt: new Date().toISOString,
        // updatedAt: new Date().toISOString,
        createdAt: "",
        createdby: "",
      };
      const latestRoute = {
        id: data._id,
      };
      const storage = data;
      const _id = data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: data.name,
        collectionId: data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    }

    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data._id,
      };
      const storage = res.data.data;
      const _id = res.data.data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   * Save Request
   * @param saveDescriptionOnly - refers save overall request data or only description as a documentation purpose.
   * @returns save status
   */
  public saveRequest = async () => {
    const componentData: RequestTab = this._tab.getValue();
    const { folderId, collectionId, workspaceId } = componentData.path;
    const tabId = componentData?.tabId;
    startLoading(tabId);

    if (!workspaceId || !collectionId) {
      stopLoading(tabId);
      return {
        status: "error",
        message: "request is not a part of any workspace or collection",
      };
    }
    const _collection = await this.readCollection(collectionId);
    let userSource = {};
    if (_collection?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const _id = componentData.id;

    const requestTabAdapter = new RequestTabAdapter();
    const unadaptedRequest = requestTabAdapter.unadapt(componentData);
    // Save overall api

    const requestMetaData = {
      id: _id,
      name: componentData?.name,
      description: componentData?.description,
      type: ItemType.REQUEST,
    };

    let folderSource;
    let itemSource;
    if (folderId) {
      folderSource = {
        folderId: folderId,
      };
      itemSource = {
        id: folderId,
        type: ItemType.FOLDER,
        items: {
          ...requestMetaData,
          request: unadaptedRequest,
        },
      };
    } else {
      itemSource = {
        ...requestMetaData,
        request: unadaptedRequest,
      };
    }

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const progressiveTab = this._tab.getValue();
      const data = {
        id: progressiveTab.id,
        name: requestMetaData.name,
        description: requestMetaData.description,
        type: "REQUEST",
        request: unadaptedRequest,
        updatedAt: new Date().toISOString(),
        updatedBy: "Guest User",
      };

      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          data,
        );
      }
      stopLoading(tabId);
      return {
        status: "success",
        message: "",
      };
    }
    const res = await updateCollectionRequest(_id, folderId, collectionId, {
      collectionId: collectionId,
      workspaceId: workspaceId,
      ...folderSource,
      ...userSource,
      items: itemSource,
    });

    if (res.isSuccessful) {
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      await this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          res.data.data,
        );
      }
      stopLoading(tabId);
      return {
        status: "success",
        message: res.message,
      };
    } else {
      stopLoading(tabId);
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param uuid - workspace id
   * @returns workspace document
   */
  public readWorkspace = (uuid: string): Promise<WorkspaceDocument> => {
    return this.workspaceRepository.readWorkspace(uuid);
  };

  get collection() {
    return this.collectionRepository.getCollection();
  }

  set collection(e) {}

  /**
   *
   * @param collectionId - collection id
   * @param items - request or folder item
   */
  public addRequestOrFolderInCollection = (
    collectionId: string,
    items: object,
  ) => {
    this.collectionRepository.addRequestOrFolderInCollection(
      collectionId,
      items,
    );
  };

  /**
   *
   * @param collection - collection document
   */
  public addCollection = (collection: object) => {
    this.collectionRepository.addCollection(collection);
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request document
   */
  public addRequestInFolder = (
    collectionId: string,
    folderId: string,
    request: object,
  ): void => {
    this.collectionRepository.addRequestInFolder(
      collectionId,
      folderId,
      request,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param path - request stack path
   * @param tabName - request name
   * @param description - request description
   * @param type - save over all request or description only
   */
  public saveAsRequest = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    path: {
      name: string;
      id: string;
      type: string;
    }[],
    tabName: string,
    description: string,
  ) => {
    const componentData = this._tab.getValue();
    let userSource = {};
    if (path.length > 0) {
      const requestTabAdapter = new RequestTabAdapter();
      const unadaptedRequest = requestTabAdapter.unadapt(componentData);
      const req = {
        id: uuidv4(),
        name: tabName,
        description,
        type: ItemType.REQUEST,
        request: unadaptedRequest,
        source: "USER",
        isDeleted: false,
        createdBy: "Guest User",
        updatedBy: "Guest User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        /**
         * handle request at collection level
         */
        const _collection = await this.readCollection(path[path.length - 1].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });

        if (isGuestUser == true) {
          this.addRequestOrFolderInCollection(path[path.length - 1].id, req);
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            this.updateRequestName(req.name);
            this.updateRequestDescription(req.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );

            const collectionDoc = await this.fetchCollection(
              expectedPath.collectionId as string,
            );
            if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.INHERIT_AUTH
            ) {
              this.authHeader = new ReduceAuthHeader(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            } else if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
            ) {
              const authProfilesList: AuthProfileDto[] =
                collectionDoc?.authProfiles || []; // ToDo: Ensure at least one default profile exists
              const selectedProfileId =
                componentData.property.request?.state
                  ?.selectedRequestAuthProfileId;

              const selectedProfile = selectedProfileId
                ? authProfilesList.find((pf) => pf.authId === selectedProfileId)
                : authProfilesList.find((pf) => pf.defaultKey);

              this.collectionAuthProfile = {
                auth: selectedProfile?.auth,
                authId: selectedProfileId,
                authType: selectedProfile?.authType,
              };

              this.authHeader = new ReduceAuthHeader(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            }
          } else {
            /**
             * Create new copy of the existing request
             */
            const initRequestTab = new InitRequestTab(req.id, "UNTRACKED-");
            initRequestTab.updateName(req.name);
            initRequestTab.updateDescription(req.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(req.request.url);
            initRequestTab.updateMethod(req.request.method);
            initRequestTab.updateBody(req.request.body);
            initRequestTab.updateQueryParams(req.request.queryParams);
            initRequestTab.updateAuth(req.request.auth);
            initRequestTab.updateHeaders(req.request.headers);

            this.tabRepository.createTab(initRequestTab.getValue());
            scrollToTab("");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const baseUrl = await this.constructBaseUrl(_workspaceMeta.id);
        const res = await insertCollectionRequest(
          {
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
            ...userSource,
            items: {
              name: tabName,
              description,
              type: ItemType.REQUEST,
              request: unadaptedRequest,
            },
          },
          baseUrl,
        );
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            await this.updateRequestName(res.data.data.name);
            await this.updateRequestDescription(res.data.data.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );

            const collectionDoc = await this.fetchCollection(
              expectedPath.collectionId as string,
            );
            if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.INHERIT_AUTH
            ) {
              this.authHeader = new ReduceAuthHeader(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            } else if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
            ) {
              const authProfilesList: AuthProfileDto[] =
                collectionDoc?.authProfiles || []; // ToDo: Ensure at least one default profile exists
              const selectedProfileId =
                componentData.property.request?.state
                  ?.selectedRequestAuthProfileId;

              const selectedProfile = selectedProfileId
                ? authProfilesList.find((pf) => pf.authId === selectedProfileId)
                : authProfilesList.find((pf) => pf.defaultKey);

              this.collectionAuthProfile = {
                auth: selectedProfile?.auth,
                authId: selectedProfileId as string,
                authType: selectedProfile?.authType,
              };

              this.authHeader = new ReduceAuthHeader(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            }
          } else {
            /**
             * Create new copy of the existing request
             */
            const initRequestTab = new InitRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(res.data.data.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.request.url);
            initRequestTab.updateMethod(res.data.data.request.method);
            initRequestTab.updateBody(res.data.data.request.body);
            initRequestTab.updateQueryParams(res.data.data.request.queryParams);
            initRequestTab.updateAuth(res.data.data.request.auth);
            initRequestTab.updateHeaders(res.data.data.request.headers);

            this.tabRepository.createTab(initRequestTab.getValue());
            scrollToTab("");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        /**
         * handle request at folder level
         */
        const _collection = await this.readCollection(path[0].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        let isGuestUser;
        isGuestUserActive.subscribe((value) => {
          isGuestUser = value;
        });

        if (isGuestUser == true) {
          this.addRequestInFolder(path[0].id, path[path.length - 1].id, req);
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            await this.updateRequestName(req.name);
            await this.updateRequestDescription(req.description);
            await this.updateRequestPath(expectedPath);
            await this.updateRequestId(req.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            await this.tabRepository.updateTab(
              progressiveTab.tabId,
              progressiveTab,
            );

            const collectionDoc = await this.fetchCollection(
              expectedPath.collectionId as string,
            );
            if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.INHERIT_AUTH
            ) {
              this.authHeader = new ReduceAuthHeader(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            } else if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
            ) {
              const authProfilesList: AuthProfileDto[] =
                collectionDoc?.authProfiles || []; // ToDo: Ensure at least one default profile exists
              const selectedProfileId =
                componentData.property.request?.state
                  ?.selectedRequestAuthProfileId;

              const selectedProfile = selectedProfileId
                ? authProfilesList.find((pf) => pf.authId === selectedProfileId)
                : authProfilesList.find((pf) => pf.defaultKey);

              this.collectionAuthProfile = {
                auth: selectedProfile?.auth,
                authId: selectedProfileId as string,
                authType: selectedProfile?.authType,
              };

              this.authHeader = new ReduceAuthHeader(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            }
          } else {
            const initRequestTab = new InitRequestTab(req.id, "UNTRACKED-");
            initRequestTab.updateName(req.name);
            initRequestTab.updateDescription(req.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(req.request.url);
            initRequestTab.updateMethod(req.request.method);
            initRequestTab.updateBody(req.request.body);
            initRequestTab.updateQueryParams(req.request.queryParams);
            initRequestTab.updateAuth(req.request.auth);
            initRequestTab.updateHeaders(req.request.headers);
            this.tabRepository.createTab(initRequestTab.getValue());
            scrollToTab("");
          }
          return {
            status: "success",
            message: "success",
            data: {
              id: req.id,
            },
          };
        }
        const baseUrl = await this.constructBaseUrl(_workspaceMeta.id);
        const res = await insertCollectionRequest(
          {
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
            folderId: path[path.length - 1].id,
            ...userSource,
            items: {
              id: path[path.length - 1].id,
              name: path[path.length - 1].name,
              type: ItemType.FOLDER,
              items: {
                name: tabName,
                description,
                type: ItemType.REQUEST,
                request: unadaptedRequest,
              },
            },
          },
          baseUrl,
        );
        if (res.isSuccessful) {
          this.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            this.updateRequestName(res.data.data.name);
            this.updateRequestDescription(res.data.data.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);

            const collectionDoc = await this.fetchCollection(
              expectedPath.collectionId as string,
            );
            if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.INHERIT_AUTH
            ) {
              this.authHeader = new ReduceAuthHeader(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuth.getValue()
                  .collectionAuthNavigation as CollectionAuthTypeBaseEnum,
                this._collectionAuth.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            } else if (
              progressiveTab.property.request?.state.requestAuthNavigation ===
              HttpRequestAuthTypeBaseEnum.AUTH_PROFILES
            ) {
              const authProfilesList: AuthProfileDto[] =
                collectionDoc?.authProfiles || []; // ToDo: Ensure at least one default profile exists
              const selectedProfileId =
                componentData.property.request?.state
                  ?.selectedRequestAuthProfileId;

              const selectedProfile = selectedProfileId
                ? authProfilesList.find((pf) => pf.authId === selectedProfileId)
                : authProfilesList.find((pf) => pf.defaultKey);

              this.collectionAuthProfile = {
                auth: selectedProfile?.auth,
                authId: selectedProfileId as string,
                authType: selectedProfile?.authType,
              };

              this.authHeader = new ReduceAuthHeader(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
              this.authParameter = new ReduceAuthParameter(
                this._collectionAuthProfile.getValue()
                  .authType as CollectionAuthTypeBaseEnum,
                this._collectionAuthProfile.getValue()
                  .auth as CollectionAuthBaseInterface,
              ).getValue();
            }
          } else {
            const initRequestTab = new InitRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(res.data.data.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.request.url);
            initRequestTab.updateMethod(res.data.data.request.method);
            initRequestTab.updateBody(res.data.data.request.body);
            initRequestTab.updateQueryParams(res.data.data.request.queryParams);
            initRequestTab.updateAuth(res.data.data.request.auth);
            initRequestTab.updateHeaders(res.data.data.request.headers);
            this.tabRepository.createTab(initRequestTab.getValue());
            scrollToTab("");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      }
      MixpanelEvent(Events.SAVE_API_REQUEST);
    }
  };

  private constructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   *
   * @param isGlobalVariable - defines to save local or global
   * @param environmentVariables - pre existing environment data
   * @param newVariableObj - new entry to be extended
   * @returns
   */
  public updateEnvironment = async (
    isGlobalVariable: boolean,
    environmentVariables,
    newVariableObj: KeyValue,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGlobalVariable) {
      // api payload
      let payload = {
        name: environmentVariables.global.name,
        variable: [
          ...environmentVariables.global.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];

      if (isGuestUser === true) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.global.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.global.id,
        );
        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(
        this._tab.getValue().path.workspaceId,
      );
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path.workspaceId,
        environmentVariables.global.id,
        payload,
        baseUrl,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    } else {
      // api payload
      const payload = {
        name: environmentVariables.local.name,
        variable: [
          ...environmentVariables.local.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];
      if (isGuestUser) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          environmentVariables.local.id,
          payload,
        );

        let currentTab = await this.tabRepository.getTabById(
          environmentVariables.local.id,
        );

        if (currentTab) {
          let currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = payload.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(
        this._tab.getValue().path.workspaceId,
      );
      // api response
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path.workspaceId,
        environmentVariables.local.id,
        payload,
        baseUrl,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );

        let currentTab = await this.tabRepository.getTabById(
          response.data.data._id,
        );
        if (currentTab) {
          const currentTabId = currentTab.tabId;
          const envTab = createDeepCopy(currentTab);
          envTab.property.environment.variable = response.data.data.variable;
          envTab.isSaved = true;
          await this.tabRepository.updateTab(currentTabId as string, {
            property: envTab.property,
            isSaved: envTab.isSaved,
          });
        }

        notifications.success("Environment variable added successfully.");
      } else {
        notifications.error(
          "Failed to add environment variable. Please try again.",
        );
      }
      return response;
    }
  };
  /**
   * Fetches a collection guide based on the provided query.
   *
   * @param query - The query object used to find the collection guide.
   * @returns - A promise that resolves to the collection guide found by the query.
   */
  public fetchCollectionGuide = async (query: GuideQuery) => {
    return await this.guideRepository.findOne(query);
  };

  /**
   * Updates the collection guide to set its active status.
   *
   * @param  query - The query object used to find the collection guide to update.
   * @param  isActive - The new active status to set for the collection guide.
   * @returns - A promise that resolves when the update operation is complete.
   */
  public updateCollectionGuide = async (
    query: GuideQuery,
    isActive: boolean,
  ) => {
    await this.guideRepository.update(query, {
      isActive: isActive,
    });
  };

  /**
   * Handles collection rename
   * @param collection - collction to rename
   * @param newCollectionName :string - the new name of the collection
   */
  public handleRenameCollection = async (
    workspaceId: string,
    collectionId: string,
    newCollectionName: string,
  ) => {
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (newCollectionName) {
      if (isGuestUser == true) {
        let col = await this.collectionRepository.readCollection(collectionId);
        col = col.toMutableJSON();
        col.name = newCollectionName;
        this.collectionRepository.updateCollection(collectionId, col);
        // notifications.success("Collection renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const response = await this.collectionService.updateCollectionData(
        collectionId,
        workspaceId,
        { name: newCollectionName },
        baseUrl,
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateCollection(
          collectionId,
          response.data.data,
        );
        // notifications.success("Collection renamed successfully!");
      } else if (response.message === "Network Error") {
        notifications.error(response.message);
      } else {
        notifications.error("Failed to rename collection. Please try again.");
      }
      return response;
    }
  };

  /**
   * Handle folder rename
   * @param workspaceId - workspace id of the folder
   * @param collectionId - collection id of the folder
   * @param folderId  - folder id to be targetted
   * @param newFolderName - new folder name
   * @returns
   */
  public handleRenameFolder = async (
    workspaceId: string,
    collectionId: string,
    folderId: string,
    newFolderName: string,
  ) => {
    const collection =
      await this.collectionRepository.readCollection(collectionId);
    const explorer =
      await this.collectionRepository.readRequestOrFolderInCollection(
        collectionId,
        folderId,
      );
    if (newFolderName) {
      let userSource = {};
      if (collection.activeSync && explorer?.source === "USER") {
        userSource = {
          currentBranch: collection.currentBranch
            ? collection.currentBranch
            : collection.primaryBranch,
          source: "USER",
        };
      }
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collectionId,
            folderId,
          );
        res.name = newFolderName;

        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          res,
        );
        // notifications.success("Folder renamed successfully!");
        return {
          isSuccessful: true,
        };
      }
      const baseUrl = await this.constructBaseUrl(workspaceId);
      const response = await this.collectionService.updateFolderInCollection(
        workspaceId,
        collectionId,
        folderId,
        {
          ...userSource,
          name: newFolderName,
        },
        baseUrl,
      );
      if (response.isSuccessful) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          folderId,
          response.data.data,
        );
        // notifications.success("Folder renamed successfully!");
      } else {
        notifications.error("Failed to rename folder. Please try again.");
      }
      return response;
    }
  };

  /**
   * Updates the message property of the last conversation in chunks.
   *
   * This function takes a string `data`, divides it into chunks of size `chunkSize`,
   * and appends each chunk to the last conversation message in the component's data.
   * The chunks are appended at intervals specified by `delay`.
   *
   * @param data - The string data to be displayed in chunks.
   * @param chunkSize - The number of characters per chunk.
   * @param delay - The delay in milliseconds between each chunk display.
   */
  private displayDataInChunks = async (data, chunkSize, delay) => {
    let index = 0;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const displayNextChunk = async () => {
      const componentData = this._tab.getValue();

      // Check if generation should be stopped
      if (!componentData?.property?.request?.state?.isChatbotGeneratingResponse)
        return;

      if (index < data.length) {
        const chunk = data.slice(index, index + chunkSize);
        const length =
          componentData?.property?.request?.ai?.conversations.length;
        componentData.property.request.ai.conversations[length - 1].message =
          componentData.property.request.ai.conversations[length - 1].message +
          chunk;
        await this.updateRequestAIConversation([
          ...componentData.property.request.ai.conversations,
        ]);
        index += chunkSize;
        await sleep(delay);
        await displayNextChunk();
      }
    };

    await displayNextChunk();
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  // AI WebSocket - Start

  /**
   * Handles socket connection errors with a consistent approach
   * @param componentData - The current component data
   */
  private async handleAIResponseError(
    componentData: RequestTab,
    errorMessage: string,
  ) {
    Sentry.captureException(errorMessage || "Socket Connection Break");
    await this.updateRequestAIConversation([
      ...(componentData?.property?.request?.ai?.conversations || []),
      {
        message: errorMessage || "Something went wrong. Please try again",
        messageId: uuidv4(),
        type: MessageTypeEnum.RECEIVER,
        isLiked: false,
        isDisliked: false,
        status: false,
      },
    ]);
    await this.updateRequestState({ isChatbotGeneratingResponse: false });
  }

  /**
   * Appends a new chunk to an existing AI message by its messageId
   * @param messageId - ID of the message to update
   * @param chunk - New chunk to append to the message
   */
  private async updateAIResponseByChunk(messageId: string, chunk: string) {
    const componentData = this._tab.getValue();
    const conversations =
      componentData?.property?.request?.ai?.conversations || [];

    let foundIndex = -1;
    // Find the index of the message we need to update
    for (let i = 0; i < conversations.length; i++) {
      if (conversations[i].messageId === messageId) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      // Create a shallow clone of the conversations array
      const updatedConversations = [...conversations];

      // Update only the specific message by appending the new chunk
      updatedConversations[foundIndex] = {
        ...updatedConversations[foundIndex],
        message: updatedConversations[foundIndex].message + chunk,
      };
      await this.updateRequestAIConversation(updatedConversations);
    } else console.error("chunk not found!");
  }

  /**
   * Generates the AI Response from server with websocket communication protocol
   * @param Prompt - Prompt from the user
   */
  public generateAIResponseWS = async (prompt = "") => {
    await this.updateRequestState({ isChatbotGeneratingResponse: true });
    const componentData = this._tab.getValue();

    const userEmail = getClientUser().email;

    let workspaceId = componentData.path.workspaceId;

    let workspaceVal = await this.readWorkspace(workspaceId);

    let teamId = workspaceVal.team?.teamId;

    // extraction of request API data for setting AI Context
    const apiData = {
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      method: componentData.property.request.method,
      queryParams: componentData.property.request.queryParams,
      url: componentData.property.request.url,
      auth: componentData.property.request.auth,
    };

    const rawConversations =
      componentData?.property?.request?.ai?.conversations || [];
    const formattedConversations = rawConversations.map(
      ({ type, message }) => ({
        role: type === "Sender" ? "user" : "assistant",
        content: message,
      }),
    );

    try {
      const userEmail = getClientUser().email;
      let responseMessageId = uuidv4(); // Generate a single message ID for the entire response
      let accumulatedMessage = ""; // Track the accumulated message content
      let messageCreated = false; // Flag to track if we've created the initial message

      const socketResponse = await this.aiAssistentWebSocketService.sendMessage(
        componentData.tabId,
        componentData?.property?.request?.ai?.threadId || null,
        userEmail,
        prompt,
        JSON.stringify(apiData),
        formattedConversations,
        "deepseek",
        "chat",
        teamId,
      );

      if (!socketResponse) {
        Sentry.withScope((scope) => {
            scope.setTag("emailId", userEmail);
            scope.setTag("errorType", "AI");
            Sentry.captureException("No response from Socket (web)");
        });
        Sentry.captureException("Socket Connection Break");
        throw new Error("Something went wrong. Please try again");
      }

      // Remove existing listeners to prevent duplicates
      const STREAMING_STATES = {
        START: "start",
        STREAMING: "streaming",
        END: "end",
      };
      const events = [
        `assistant-response`,
        `assistant-response_${componentData.tabId}`,
        `disconnect`,
        `connect_error`,
      ];
      events.forEach((event) =>
        this.aiAssistentWebSocketService.removeListener(event),
      );

      // Unified event handler
      const handleSocketEvent = async (event, response) => {
        switch (event) {
          case "disconnect":
          case "connect_error":
            // After getting response don't listen again for this the same request
            events.forEach((event) =>
              this.aiAssistentWebSocketService.removeListener(event),
            );
            Sentry.withScope((scope) => {
                scope.setTag("emailId", userEmail);
                scope.setTag("errorType", "AI");
                Sentry.captureException(`Socket Connection Break. Socket Status: ${event} RestExplorerPage.viewmodel(Web)`);   
            });
            await this.handleAIResponseError(
              componentData,
              "Something went wrong. Please try again",
            );
            break;

          // Listening for "assistant-response" because initial "Limit Reached" msg is coming without tabId
          case `assistant-response`:
          case `assistant-response_${componentData.tabId}`:
            // Handle special error messages
            if (
              response.messages &&
              (response.messages.includes("Limit Reached") ||
                response.messages.includes("Some Issue Occurred"))
            ) {
              // After getting error response remove all listeners
              events.forEach((event) =>
                this.aiAssistentWebSocketService.removeListener(event),
              );

              const errorMessage = response.messages.includes("Limit Reached")
                ? "Oh, snap! You have reached your limit for this month. You can resume using Sparrow AI from the next month. Please share your feedback through the community section."
                : "Some issue occurred while processing your request, please try again.";

              await this.updateRequestAIConversation([
                ...(componentData?.property?.request?.ai?.conversations || []),
                {
                  message: errorMessage,
                  messageId: uuidv4(),
                  type: MessageTypeEnum.RECEIVER,
                  isLiked: false,
                  isDisliked: false,
                  status: false,
                },
              ]);
              await this.updateRequestState({
                isChatbotGeneratingResponse: false,
              });
              return;
            }

            // Handle streaming responses
            if (response.stream_status) {
              const { stream_status, messages, thread_Id } = response;

              // Handle thread ID on stream start if not already set
              if (stream_status === STREAMING_STATES.START) {
                // console.log("** stream started ** ");
                const thisTabThreadId =
                  componentData?.property?.request?.ai?.threadId;
                if (!thisTabThreadId && thread_Id) {
                  await this.updateRequestAIThread(thread_Id);
                }

                // Create empty message container that will be updated with chunks
                if (!messageCreated) {
                  await this.updateRequestAIConversation([
                    ...(componentData?.property?.request?.ai?.conversations ||
                      []),
                    {
                      message: "",
                      messageId: responseMessageId,
                      type: MessageTypeEnum.RECEIVER,
                      isLiked: false,
                      isDisliked: false,
                      status: true,
                    },
                  ]);
                  messageCreated = true;
                }
              }

              // Handle incoming message chunk
              else if (
                stream_status === STREAMING_STATES.STREAMING &&
                messages
              ) {
                accumulatedMessage += messages;

                // Append only the new chunk to the existing message
                await this.updateAIResponseByChunk(responseMessageId, messages);
              }

              // Handle end of stream
              else if (stream_status === STREAMING_STATES.END) {
                // Cleanup listeners as stream is complete
                events.forEach((event) =>
                  this.aiAssistentWebSocketService.removeListener(event),
                );

                // Update state to indicate response generation is complete
                await this.updateRequestState({
                  isChatbotGeneratingResponse: false,
                });
              }
            }
            break;
        }
      };

      // Add new listeners
      events.forEach((event) =>
        this.aiAssistentWebSocketService.addListener(event, (response) =>
          handleSocketEvent(event, response),
        ),
      );
    } catch (error) {
      Sentry.withScope((scope) => {
          scope.setTag("emailId", userEmail);
          scope.setTag("errorType", "AI");
          Sentry.captureException(`Error in websocket streaming ${error} RestExplorerPage.viewmodel(Web)`);
      });
      console.error("Something went wrong!:", error.message);
      await this.handleAIResponseError(componentData, error.message);
    }
  };

  /**
   * Stops the response generation from the FE and sends stop generate event to server
   *
   */
  public stopGeneratingAIResponse = async () => {
    const componentData = this._tab.getValue();

    // Handling the case where user clicked stop generating just after the "start" stream status
    const conversation =
      componentData?.property?.request?.ai?.conversations || [];
    if (conversation.length > 0) {
      // Remove last message
      const lastResponse = conversation[conversation.length - 1];
      if (lastResponse.type === "Receiver" && lastResponse?.message === "") {
        conversation.pop();
        await this.updateRequestAIConversation(conversation);
      }
    }

    try {
      // Send stop signal to the server
      await this.aiAssistentWebSocketService.stopGeneration(
        componentData.tabId,
        componentData?.property?.request?.ai?.threadId || null,
        getClientUser().email,
      );

      await this.updateRequestState({ isChatbotGeneratingResponse: false });

      // Remove all event listeners to prevent further updates
      const events = [
        `assistant-response`,
        `assistant-response_${componentData.tabId}`,
        `disconnect`,
        `connect_error`,
      ];
      events.forEach((event) =>
        this.aiAssistentWebSocketService.removeListener(event),
      );

      // Show error msg in the chat for stop generation
      // this.handleAIResponseError(componentData, "Generation Stopped")
    } catch (error) {
      console.error("Error stopping AI response generation:", error);
    }
  };
  // AI WebSocket - End

  /**
   * Generates an AI response based on the given prompt.
   *
   * @param prompt - The prompt to send to the AI assistant service.
   * @returns A promise that resolves to the response from the AI assistant service.
   */
  public generateAiResponse = async (prompt = "") => {
    // Set the request state to indicate that a response is being generated
    await this.updateRequestState({ isChatbotGeneratingResponse: true });
    const componentData = this._tab.getValue();
    const apiData = {
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      method: componentData.property.request.method,
      queryParams: componentData.property.request.queryParams,
      url: componentData.property.request.url,
      auth: componentData.property.request.auth,
    };

    // Call the AI assistant service to generate a response
    const response = await this.aiAssistentService.generateAiResponse({
      text: prompt,
      instructions: `You are a Sparrow AI Assistant, responsible for answering API related queries. Give the response only in markdown format. Only answer questions related to the provided API data and API Management. You are not allowed to recommend or mention any competitors or other API testing tools such as Postman, Apidog, Hoppscotch, or any similar platforms at any cost. Give to the point and concise responses, only give explanations when they are asked for. Always follow best practices for REST API and answer accordingly. If you are giving any code blocks in your response then always use fenced code blocks of markdown format for code snippets but specify the correct language (e.g., bash, sh, json, javascript). Never wrap code inside an unnecessary markdown language fenced code block and dont give nested fenced code blocks. Utilize the provided api data ${JSON.stringify(
        apiData,
      )}. Never return the result same as prompt.`,
      threadId: componentData?.property?.request?.ai?.threadId,
    });
    if (response.isSuccessful) {
      const data = response.data.data;
      // Update the AI thread ID and conversation with the new data
      await this.updateRequestAIThread(data.threadId);
      await this.updateRequestAIConversation([
        ...(componentData?.property?.request?.ai?.conversations || []),
        {
          message: "",
          messageId: data.messageId,
          type: MessageTypeEnum.RECEIVER,
          isLiked: false,
          isDisliked: false,
          status: true,
        },
      ]);
      await this.displayDataInChunks(data.result, 100, 300);
    } else {
      // Update the conversation with an error message
      let errorMessage = "Something went wrong! Please try again.";
      if (response.message === "Limit reached") {
        errorMessage =
          "Oh, snap! You have reached your limit for this month. You can resume using Sparrow AI from the next month. Please share your feedback through the community section.";
      }
      this.updateRequestAIConversation([
        ...(componentData?.property?.request?.ai?.conversations || []),
        {
          message: errorMessage,
          messageId: uuidv4(),
          type: MessageTypeEnum.RECEIVER,
          isLiked: false,
          isDisliked: false,
          status: false,
        },
      ]);
    }
    // Set the request state to indicate that the response generation is complete
    await this.updateRequestState({ isChatbotGeneratingResponse: false });
    return response;
  };

  /*
   * Generates stream wise an AI response based on the given prompt.
   *
   * @param prompt - The prompt to send to the AI assistant service.
   * @returns A promise that resolves to the response from the AI assistant service.
   */
  public generateStreamAiResponse = async (prompt = "") => {
    // Set the request state to indicate that a response is being generated
    await this.updateRequestState({ isChatbotGeneratingResponse: true });
    let componentData = this._tab.getValue();
    const apiData = {
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      method: componentData.property.request.method,
      queryParams: componentData.property.request.queryParams,
      url: componentData.property.request.url,
      auth: componentData.property.request.auth,
    };
    const socketValue: Socket =
      await this.aiAssistentWebSocketService.sendPromptMessage({
        text: prompt,
        instructions: `You are an AI Assistant, responsible for answering API related queries. Give the response only in markdown format. Only answer questions related to the provided API data and API Management. Give to the point and concise responses, only give explanations when they are asked for. Always follow best practices for REST API and answer accordingly. Utilize the provided api data ${JSON.stringify(
          apiData,
        )}. Never return the result same as prompt.`,
        tabId: componentData.tabId,
        threadId: componentData?.property?.request?.ai?.threadId,
      });
    let updatePromise = Promise.resolve(); // Initialize a promise chain
    socketValue.off(`aiResponse_${componentData.tabId}`);
    socketValue?.on(`aiResponse_${componentData.tabId}`, async (response) => {
      updatePromise = updatePromise.then(async () => {
        // Check if the conversation already contains the messageId
        componentData = this._tab.getValue();
        const existingMessageIndex =
          componentData.property.request.ai.conversations.findIndex((conv) => {
            return conv.messageId === response.messageId;
          });
        if (existingMessageIndex === -1 && response?.status) {
          // If the messageId does not exist, add a new message entry

          await this.updateRequestAIThread(response.threadId);
          await this.updateRequestAIConversation([
            ...componentData.property.request.ai.conversations,
            {
              messageId: response.messageId,
              message: response.result,
              type: MessageTypeEnum.RECEIVER,
              isLiked: false,
              isDisliked: false,
              status: true,
            },
          ]);
        } else if (response?.status) {
          componentData.property.request.ai.conversations[
            existingMessageIndex
          ].message =
            componentData.property.request.ai.conversations[
              existingMessageIndex
            ].message + response.result;
          await this.updateRequestAIConversation([
            ...componentData.property.request.ai.conversations,
          ]);
        }
        if (response?.status === "Completed") {
          await this.updateRequestState({
            isChatbotGeneratingResponse: false,
          });
        }
        if (response?.status === "Failed") {
          await this.updateRequestState({
            isChatbotGeneratingResponse: false,
          });
          // Update the conversation with an error message
          this.updateRequestAIConversation([
            ...(componentData?.property?.request?.ai?.conversations || []),
            {
              message: "Something went wrong! Please try again.",
              messageId: uuidv4(),
              type: MessageTypeEnum.RECEIVER,
              isLiked: false,
              isDisliked: false,
              status: false,
            },
          ]);
        }
      });
    });
  };

  /**
   * Generates documentation for the particular API Request Tab.
   *
   * @param prompt - The prompt to be used for generating the documentation.
   * @returns - The response from the AI assistant service.
   */

  public generateDocumentation = async (prompt = "") => {
    await this.updateRequestState({ isDocGenerating: true });
    const componentData = this._tab.getValue();

    let workspaceId = componentData.path.workspaceId;

    let workspaceVal = await this.readWorkspace(workspaceId);

    let teamId = workspaceVal.team?.teamId;

    const apiData = {
      body: componentData.property.request.body,
      headers: componentData.property.request.headers,
      method: componentData.property.request.method,
      queryParams: componentData.property.request.queryParams,
      url: componentData.property.request.url,
      auth: componentData.property.request.auth,
    };
    prompt += `. Utilize the provided api data ${JSON.stringify(apiData)}`;
    const response = await this.aiAssistentService.generateAiResponse({
      text: prompt,
      instructions: `You are an AI Assistant to generate documentation, responsible to generate documentation for API requests, Give response only in text format not in markdown.`,
      model: "deepseek",
      teamId: teamId,
    });
    if (response.isSuccessful) {
      const formatter = new MarkdownFormatter();
      const formattedData = await formatter.FormatData(
        response.data.data.result,
      );
      const stringifyData = JSON.stringify(formattedData.blocks);
      await this.updateRequestDescription(stringifyData);
      await this.updateRequestState({
        isDocAlreadyGenerated: true,
      });
    } else if (response?.message === "Limit reached. Please try again later.") {
      notifications.error(
        "Failed to generate documentation. Your monthly AI usage limit is reached.",
      );
    }
    setTimeout(async () => {
      // renders response before disabling the editor
      await this.updateRequestState({ isDocGenerating: false });
    }, 1000);
  };

  /**
   * Toggles the like or dislike status of a chat message.
   *
   * @param _messageId - The ID of the message to update.
   * @param  _flag - The flag indicating whether the message is liked (true) or disliked (false).
   */
  public toggleChatMessageLike = (_messageId: string, _flag: boolean) => {
    const componentData = this._tab.getValue();
    const data = componentData?.property?.request?.ai;
    this.aiAssistentService.updateAiStats(data.threadId, _messageId, _flag);

    // Map through the conversations and update the like or dislike status of the specified message
    const convo = data?.conversations?.map((elem) => {
      if (elem.messageId === _messageId) {
        if (_flag) {
          elem.isLiked = true;
          elem.isDisliked = false;
        } else {
          elem.isLiked = false;
          elem.isDisliked = true;
        }
      }
      return elem;
    });
    this.updateRequestAIConversation(convo);
  };

  /**
   * Refreshes the tab data by updating conversations and chatbot state from the server.
   *
   * @param tab - The tab data from the server to refresh the current tab data with.
   */
  public refreshTabData = (tab: RequestTab) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());

    if (progressiveTab?.property?.request?.ai?.conversations) {
      // Handles AiConversationClient state
      const AiConversationClient =
        progressiveTab?.property?.request?.ai.conversations;
      const AiConversationServer = tab.property.request.ai.conversations;
      if (AiConversationServer.length > AiConversationClient.length) {
        progressiveTab.property.request.ai.conversations =
          tab.property.request.ai.conversations;
        this.tab = progressiveTab;
      }
    }
    if (progressiveTab?.property?.request?.state) {
      // Handles isChatbotGeneratingResponseClient state
      const isChatbotGeneratingResponseClient =
        progressiveTab?.property?.request?.state?.isChatbotGeneratingResponse;
      const isChatbotGeneratingResponseServer =
        tab.property.request.state.isChatbotGeneratingResponse;
      if (
        isChatbotGeneratingResponseServer !== isChatbotGeneratingResponseClient
      ) {
        progressiveTab.property.request.state.isChatbotGeneratingResponse =
          tab.property.request.state.isChatbotGeneratingResponse;
        this.tab = progressiveTab;
      }
      // Handles isDocGenerating state
      const isDocGeneratingClient =
        progressiveTab?.property?.request?.state?.isDocGenerating;
      const isDocGeneratingServer = tab.property.request.state.isDocGenerating;
      if (isDocGeneratingServer !== isDocGeneratingClient) {
        progressiveTab.property.request.state.isDocGenerating =
          tab.property.request.state.isDocGenerating;
        this.tab = progressiveTab;
      }
      // Handles isDocAlreadyGeneratedClient state
      const isDocAlreadyGeneratedClient =
        progressiveTab?.property?.request?.state?.isDocAlreadyGenerated;
      const isDocAlreadyGeneratedServer =
        tab.property.request.state.isDocAlreadyGenerated;
      if (isDocAlreadyGeneratedServer !== isDocAlreadyGeneratedClient) {
        progressiveTab.property.request.state.isDocAlreadyGenerated =
          tab.property.request.state.isDocAlreadyGenerated;
        this.tab = progressiveTab;
      }
    }
    if (progressiveTab) {
      // Handles apiDescriptionClient state
      const apiDescriptionClient = progressiveTab?.description;
      const apiDescriptionServer = tab.description;
      if (apiDescriptionServer !== apiDescriptionClient) {
        progressiveTab.description = tab.description;
        this.tab = progressiveTab;
      }
    }
  };
}

export default RestExplorerViewModel;
