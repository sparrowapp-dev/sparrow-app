export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DEL = "DEL",
  TRAC = "TRAC",
  PATC = "PATC",
  HEAD = "HEAD",
  OPT = "OPT",
  CON = "CON",
}

export enum RequestDefault {
  NAME = "API Request Name",
  METHOD = "GET",
}

export enum RequestType {
  JSON = "JSON",
  XML = "XML",
  HTML = "HTML",
  Text = "Text",
  JavaScript = "JavaScript",
}

export enum RequestDataset {
  FORMDATA = "Form Data",
  URLENCODED = "URL Encoded",
  RAW = "Raw",
  NONE = "None",
}

export enum RequestSection {
  PARAMETERS = "Parameters",
  AUTHORIZATION = "Authorization",
  HEADERS = "Headers",
  REQUEST_BODY = "Request Body",
}
