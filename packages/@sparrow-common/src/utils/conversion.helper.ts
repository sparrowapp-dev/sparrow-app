import { HttpRequestMethodBaseEnum } from "../types/workspace/http-request-base";

const createDeepCopy = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

const getMethodStyle = (method: HttpRequestMethodBaseEnum) => {
  if (method === HttpRequestMethodBaseEnum.GET) {
    return "getColor";
  } else if (method === HttpRequestMethodBaseEnum.DELETE) {
    return "deleteColor";
  } else if (method === HttpRequestMethodBaseEnum.HEAD) {
    return "headColor";
  } else if (method === HttpRequestMethodBaseEnum.OPTIONS) {
    return "optionsColor";
  } else if (method === HttpRequestMethodBaseEnum.PATCH) {
    return "patchColor";
  } else if (method === HttpRequestMethodBaseEnum.POST) {
    return "postColor";
  } else if (method === HttpRequestMethodBaseEnum.PUT) {
    return "putColor";
  } else {
    return "";
  }
};

export { createDeepCopy, getMethodStyle };
