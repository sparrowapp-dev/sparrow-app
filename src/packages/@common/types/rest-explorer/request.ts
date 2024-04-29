export enum AuthTypeEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export enum AuthSectionEnum {
  HEADER = "Header",
  QUERY_PARAMETER = "Query Parameter",
  COOKIES = "Cookies",
}
export enum RequestMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}
export enum RequestDataTypeEnum {
  JSON = "JSON",
  XML = "XML",
  HTML = "HTML",
  TEXT = "Text",
  JAVASCRIPT = "JavaScript",
  IMAGE = "Image",
}
export enum RequestSectionEnum {
  PARAMETERS = "Parameters",
  AUTHORIZATION = "Authorization",
  HEADERS = "Headers",
  REQUEST_BODY = "Request Body",
}
export enum ResponseFormatterEnum {
  PRETTY = "Pretty",
  RAW = "Raw",
  PREVIEW = "Preview",
  VISUALIZE = "Visualize",
}
export enum ResponseSectionEnum {
  RESPONSE = "Response",
  HEADERS = "Headers",
}
export enum TabTypeEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  COLLECTION = "COLLECTION",
  WORKSPACE = "WORKSPACE",
  PERSONAL = "PERSONAL",
}

export enum RequestDatasetEnum {
  FORMDATA = "Form Data",
  URLENCODED = "URL Encoded",
  RAW = "Raw",
  NONE = "None",
}

export enum UntrackedItemsEnum {
  UNTRACKED = "UNTRACKED-",
}

export interface WorkspaceIdWrapper {
  workspaceId: string;
}
export interface CollectionIdWrapper {
  collectionId: string;
}
export interface FolderIdWrapper {
  folderId: string;
}
export interface Path
  extends WorkspaceIdWrapper,
    CollectionIdWrapper,
    FolderIdWrapper {}
export interface PathWrapper {
  path: Path;
}

export interface KeyWrapper {
  key: string;
}
export interface ValueWrapper {
  value: string;
}
export interface CheckedWrapper {
  checked: boolean;
}
export interface BaseWrapper {
  base: string;
}
export interface RawWrapper {
  raw: string;
}
export interface RequestBodyLanguageWrapper {
  requestBodyLanguage: RequestDataTypeEnum;
}
export interface RequestBodyNavigationWrapper {
  requestBodyNavigation: RequestDatasetEnum;
}
export interface RequestAuthNavigationWrapper {
  requestAuthNavigation: AuthTypeEnum;
}
export interface RequestNavigationWrapper {
  requestNavigation: RequestSectionEnum;
}
export interface ResponseNavigationWrapper {
  responseNavigation: ResponseSectionEnum;
}
export interface ResponseBodyLanguageWrapper {
  responseBodyLanguage: RequestDataTypeEnum;
}
export interface ResponseBodyFormatterWrapper {
  responseBodyFormatter: ResponseFormatterEnum;
}
export interface RequestExtensionNavigationWrapper {
  requestExtensionNavigation: string;
}
export interface IsExposeEditDescriptionWrapper {
  isExposeEditDescription: boolean;
}
export interface RequestSplitterDirectionWrapper {
  requestSplitterDirection: string;
}
export interface RequestLeftSplitterWidthPercentageWrapper {
  requestLeftSplitterWidthPercentage: number;
}
export interface RequestRightSplitterWidthPercentageWrapper {
  requestRightSplitterWidthPercentage: number;
}
export interface IsSendRequestInProgressWrapper {
  isSendRequestInProgress: boolean;
}
export interface IsSaveDescriptionInProgressWrapper {
  isSaveDescriptionInProgress: boolean;
}
export interface IsSaveRequestInProgressWrapper {
  isSaveRequestInProgress: boolean;
}
export interface UsernameWrapper {
  username: string;
}
export interface PasswordWrapper {
  password: string;
}
export interface AuthKeyWrapper {
  authKey: string;
}
export interface AuthValueWrapper {
  authValue: string;
}
export interface AddtoWrapper {
  addTo: AuthSectionEnum;
}
export interface BearerTokenWrapper {
  bearerToken: string;
}
export interface MethodWrapper {
  method: RequestMethodEnum;
}
export interface UrlWrapper {
  url: string;
}
export interface ResponseHeadersWrapper {
  headers: KeyValueChecked[];
}

export interface ResponseStatusWrapper {
  status: string;
}
export interface ResponseBodyWrapper {
  body: string;
}
export interface ResponseTimeWrapper {
  time: number;
}
export interface ResponseSizeWrapper {
  size: number;
}
export interface Response
  extends ResponseStatusWrapper,
    ResponseHeadersWrapper,
    ResponseBodyWrapper,
    ResponseTimeWrapper,
    ResponseSizeWrapper {}

export interface ResponseWrapper {
  response: Response;
}

export interface KeyValue extends KeyWrapper, ValueWrapper {}
export interface KeyValueChecked
  extends KeyWrapper,
    ValueWrapper,
    CheckedWrapper {}
export interface KeyValueCheckedWithBase
  extends KeyWrapper,
    ValueWrapper,
    CheckedWrapper,
    BaseWrapper {}

export interface UrlEncodedWrapper {
  urlencoded: KeyValueChecked[];
}

export interface TextWrapper {
  text: KeyValueChecked[];
}
export interface FileWrapper {
  file: KeyValueCheckedWithBase[];
}
export interface FormData extends TextWrapper, FileWrapper {}
export interface FormDataWrapper {
  formdata: FormData;
}
export interface Body extends RawWrapper, UrlEncodedWrapper, FormDataWrapper {}

export interface BodyWrapper {
  body: Body;
}

export interface State
  extends RequestBodyLanguageWrapper,
    RequestBodyNavigationWrapper,
    RequestNavigationWrapper,
    RequestAuthNavigationWrapper,
    ResponseNavigationWrapper,
    ResponseBodyLanguageWrapper,
    ResponseBodyFormatterWrapper,
    RequestExtensionNavigationWrapper,
    IsExposeEditDescriptionWrapper,
    RequestSplitterDirectionWrapper,
    RequestLeftSplitterWidthPercentageWrapper,
    RequestRightSplitterWidthPercentageWrapper,
    IsSendRequestInProgressWrapper,
    IsSaveDescriptionInProgressWrapper,
    IsSaveRequestInProgressWrapper {}

export interface StateWrapper {
  state: State;
}

export interface BasicAuth extends UsernameWrapper, PasswordWrapper {}
export interface BasicAuthWrapper {
  basicAuth: BasicAuth;
}
export interface ApiKey
  extends AuthKeyWrapper,
    AuthValueWrapper,
    AddtoWrapper {}
export interface ApiKeyWrapper {
  apiKey: ApiKey;
}
export interface Auth
  extends BearerTokenWrapper,
    BasicAuthWrapper,
    ApiKeyWrapper {}
export interface AuthWrapper {
  auth: Auth;
}

export interface HeadersWrapper {
  headers: KeyValueChecked[];
}
export interface UrlEncoded extends KeyValueChecked {}
export interface Headers extends KeyValueChecked {}
export interface QueryParams extends KeyValueChecked {}
export interface AutoGeneratedHeaders extends KeyValueChecked {}
export interface QueryParamsWrapper {
  queryParams: KeyValueChecked[];
}
export interface AutoGeneratedHeadersWrapper {
  autoGeneratedHeaders: KeyValueChecked[];
}

export interface RequestWrapper {
  request: Request;
}
export interface Request
  extends MethodWrapper,
    BodyWrapper,
    QueryParamsWrapper,
    AutoGeneratedHeadersWrapper,
    StateWrapper,
    ResponseWrapper,
    AuthWrapper,
    UrlWrapper,
    HeadersWrapper {}

export interface Collection extends IdWrapper {}
export interface Folder extends IdWrapper {}
export interface Workspace extends IdWrapper {}
export interface CollectionWrapper {
  collection: Collection;
}

export interface WorkspaceWrapper {
  workspace: Workspace;
}

export interface FolderWrapper {
  folder: Folder;
}
//////////////////////////
export interface DescriptionWrapper {
  description: string;
}
export interface IdWrapper {
  id: string;
}
export interface NameWrapper {
  name: string;
}
export interface TypeWrapper {
  type: TabTypeEnum;
}
export interface IsDeletedWrapper {
  isDeleted: boolean;
}
export interface ActiveSyncWrapper {
  activeSync: boolean;
}

export interface SourceWrapper {
  source: string;
}
export interface IsActiveWrapper {
  isActive: boolean;
}
export interface IsSavedWrapper {
  isSaved: boolean;
}
export interface TimestampWrapper {
  timestamp: string;
}
export interface IndexWrapper {
  index: number;
}
export interface Property
  extends RequestWrapper,
    CollectionWrapper,
    WorkspaceWrapper,
    FolderWrapper {}
export interface PropertyWrapper {
  property: Property;
}
export interface TabIdWrapper {
  tabId: string;
}
export interface Tab
  extends ActiveSyncWrapper,
    DescriptionWrapper,
    IdWrapper,
    IndexWrapper,
    IsActiveWrapper,
    IsDeletedWrapper,
    IsSavedWrapper,
    NameWrapper,
    PathWrapper,
    SourceWrapper,
    TabIdWrapper,
    TimestampWrapper,
    TypeWrapper {
  property: {
    request?: Request;
    folder?: Folder;
    collection?: Collection;
    workspace?: Workspace;
  };
}

export interface RequestTab
  extends ActiveSyncWrapper,
    DescriptionWrapper,
    IdWrapper,
    IndexWrapper,
    IsActiveWrapper,
    IsDeletedWrapper,
    IsSavedWrapper,
    NameWrapper,
    PathWrapper,
    SourceWrapper,
    TabIdWrapper,
    TimestampWrapper,
    TypeWrapper {
  property: {
    request: Request;
  };
}
export interface FolderTab
  extends ActiveSyncWrapper,
    DescriptionWrapper,
    IdWrapper,
    IndexWrapper,
    IsActiveWrapper,
    IsDeletedWrapper,
    IsSavedWrapper,
    NameWrapper,
    PathWrapper,
    SourceWrapper,
    TabIdWrapper,
    TimestampWrapper,
    TypeWrapper {
  property: {
    folder: Folder;
  };
}
export interface CollectionTab
  extends ActiveSyncWrapper,
    DescriptionWrapper,
    IdWrapper,
    IndexWrapper,
    IsActiveWrapper,
    IsDeletedWrapper,
    IsSavedWrapper,
    NameWrapper,
    PathWrapper,
    SourceWrapper,
    TabIdWrapper,
    TimestampWrapper,
    TypeWrapper {
  property: {
    collection: Collection;
  };
}
export interface WorkspaceTab
  extends ActiveSyncWrapper,
    DescriptionWrapper,
    IdWrapper,
    IndexWrapper,
    IsActiveWrapper,
    IsDeletedWrapper,
    IsSavedWrapper,
    NameWrapper,
    PathWrapper,
    SourceWrapper,
    TabIdWrapper,
    TimestampWrapper,
    TypeWrapper {
  property: {
    workspace: Workspace;
  };
}
