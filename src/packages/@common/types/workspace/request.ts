import type {
  ActiveSyncWrapper,
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
  TypeWrapper,
} from "./common";

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
  DOCUMENTATION = "Description",
}

export enum MessageTypeEnum {
  SENDER = "Sender",
  RECEIVER = "Receiver",
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

export enum RequestDatasetEnum {
  FORMDATA = "Form Data",
  URLENCODED = "URL Encoded",
  RAW = "Raw",
  NONE = "None",
}

export enum FormDataTypeEnum {
  TEXT = "text",
  FILE = "file",
}

export enum UntrackedItemsEnum {
  UNTRACKED = "UNTRACKED-",
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
export interface TypeWrapper2 {
  type: FormDataTypeEnum;
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
export interface IsBulkHeaderWrapper {
  isHeaderBulkEditActive: boolean;
}
export interface IsChatbotActive {
  isChatbotActive: boolean;
}
export interface IsChatbotSuggestionsActive {
  isChatbotSuggestionsActive: boolean;
}
export interface IsBulkParameterWrapper {
  isParameterBulkEditActive: boolean;
}
export interface IsChatbotGeneratingResponse {
  isChatbotGeneratingResponse: boolean;
}

export interface IsDocGenerating {
  isDocGenerating: boolean;
}
export interface IsDocAlreadyGenerated {
  isDocAlreadyGenerated: boolean;
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
export interface FormData
  extends KeyWrapper,
    ValueWrapper,
    BaseWrapper,
    CheckedWrapper,
    TypeWrapper2 {}
export interface FormDataWrapper {
  formdata: FormData[];
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
    RequestLeftSplitterWidthPercentageWrapper,
    RequestRightSplitterWidthPercentageWrapper,
    IsSendRequestInProgressWrapper,
    IsSaveDescriptionInProgressWrapper,
    IsSaveRequestInProgressWrapper,
    IsBulkParameterWrapper,
    IsBulkHeaderWrapper,
    IsChatbotActive,
    IsChatbotSuggestionsActive,
    IsDocGenerating,
    IsDocAlreadyGenerated,
    IsChatbotGeneratingResponse {}

export interface StatePartial
  extends Partial<RequestBodyLanguageWrapper>,
    Partial<RequestBodyNavigationWrapper>,
    Partial<RequestNavigationWrapper>,
    Partial<RequestAuthNavigationWrapper>,
    Partial<ResponseNavigationWrapper>,
    Partial<ResponseBodyLanguageWrapper>,
    Partial<ResponseBodyFormatterWrapper>,
    Partial<RequestExtensionNavigationWrapper>,
    Partial<IsExposeEditDescriptionWrapper>,
    Partial<RequestLeftSplitterWidthPercentageWrapper>,
    Partial<RequestRightSplitterWidthPercentageWrapper>,
    Partial<IsSendRequestInProgressWrapper>,
    Partial<IsSaveDescriptionInProgressWrapper>,
    Partial<IsSaveRequestInProgressWrapper>,
    Partial<IsBulkParameterWrapper>,
    Partial<IsBulkHeaderWrapper>,
    Partial<IsChatbotActive>,
    Partial<IsChatbotSuggestionsActive>,
    Partial<IsChatbotGeneratingResponse>,
    Partial<IsDocAlreadyGenerated>,
    Partial<IsDocGenerating> {}

export interface StateWrapper {
  state: State;
}

export interface PromptWrapper {
  prompt: string;
}

export interface TypeWrapper3 {
  type: MessageTypeEnum;
}
export interface MessageIdWrapper {
  messageId: string;
}
export interface MessageWrapper {
  message: string;
}
export interface IsLikedWrapper {
  isLiked: boolean;
}
export interface IsDislikedWrapper {
  isDisliked: boolean;
}
export interface StatusWrapper2 {
  status: boolean;
}

export interface Conversation
  extends TypeWrapper3,
    MessageIdWrapper,
    MessageWrapper,
    IsLikedWrapper,
    IsDislikedWrapper,
    StatusWrapper2 {}
export interface ConversationsWrapper {
  conversations: Conversation[];
}
export interface ThreadIdWrapper {
  threadId: string;
}

export interface Ai
  extends PromptWrapper,
    ConversationsWrapper,
    ThreadIdWrapper {}
export interface AiWrapper {
  ai: Ai;
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
    AiWrapper,
    HeadersWrapper {}

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
