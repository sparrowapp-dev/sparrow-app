import { RequestMethod } from "../../../enums/request.enum";

const createDeepCopy = (data) => {
  return JSON.parse(JSON.stringify(data));
};

const getMethodStyle = (method: string) => {
  if (method === RequestMethod.GET) {
    return "getColor";
  } else if (method === RequestMethod.DELETE) {
    return "deleteColor";
  } else if (method === RequestMethod.HEAD) {
    return "headColor";
  } else if (method === RequestMethod.OPTIONS) {
    return "optionsColor";
  } else if (method === RequestMethod.PATCH) {
    return "patchColor";
  } else if (method === RequestMethod.POST) {
    return "postColor";
  } else if (method === RequestMethod.PUT) {
    return "putColor";
  } else {
    return "";
  }
};

export { createDeepCopy, getMethodStyle };
