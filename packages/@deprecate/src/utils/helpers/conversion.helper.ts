import { RequestMethodEnum } from "@sparrow/common/types/workspace";

const createDeepCopy = (data) => {
  return JSON.parse(JSON.stringify(data));
};

const getMethodStyle = (method: RequestMethodEnum | undefined) => {
  if (method === RequestMethodEnum.GET) {
    return "getColor";
  } else if (method === RequestMethodEnum.DELETE) {
    return "deleteColor";
  } else if (method === RequestMethodEnum.HEAD) {
    return "headColor";
  } else if (method === RequestMethodEnum.OPTIONS) {
    return "optionsColor";
  } else if (method === RequestMethodEnum.PATCH) {
    return "patchColor";
  } else if (method === RequestMethodEnum.POST) {
    return "postColor";
  } else if (method === RequestMethodEnum.PUT) {
    return "putColor";
  } else {
    return "";
  }
};

export { createDeepCopy, getMethodStyle };
