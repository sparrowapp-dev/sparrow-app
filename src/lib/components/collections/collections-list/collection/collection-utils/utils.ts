import yaml from "js-yaml";
export function isUrlValid(str: string) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i",
  );
  return pattern.test(str);
}

export const debounce = (func, delay = 1000) => {
  let timerId;

  return function (...args) {
    /* eslint-disable @typescript-eslint/no-this-alias */
    const context = this;

    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

export const validateClientURL = (url = "") => {
  const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
};

export const validateClientJSON = (jsonString = "") => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateClientXML = (yamlString = "") => {
  try {
    const parsedYaml = yaml.load(yamlString);

    // Check if parsed content is either an object or an array
    return (
      typeof parsedYaml === "object" &&
      parsedYaml !== null &&
      !Array.isArray(parsedYaml)
    );
  } catch (error) {
    return false;
  }
};
