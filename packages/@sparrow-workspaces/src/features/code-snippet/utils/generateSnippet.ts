export type HeaderType = {
  key: string;
  value: string;
};

export type RequestData = {
  method: string;
  url: string;
  headers?: HeaderType[];
  body?: any;
};

const formatHeaders = (headersArr: HeaderType[] = []) => {
  const obj: Record<string, string> = {};

  headersArr.forEach((h) => {
    if (h?.key?.trim() && h?.value?.trim()) {
      obj[h.key.trim()] = h.value.trim();
    }
  });

  return obj;
};

/* ================= FETCH ================= */
export const generateFetchSnippet = (req: RequestData) => {
  const headersObj = formatHeaders(req.headers);

  const headers =
    Object.keys(headersObj).length > 0
      ? JSON.stringify(headersObj, null, 2)
      : "";

  const body =
    req.body && req.method !== "GET"
      ? `body: JSON.stringify(${JSON.stringify(req.body, null, 2)}),`
      : "";

  return `const requestOptions = {
  method: "${req.method}",
  ${headers ? `headers: ${headers},` : ""}
  ${body}
  redirect: "follow"
};

fetch("${req.url}", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));`;
};

/* ================= jQuery ================= */
export const generateJquerySnippet = (req: RequestData) => {
  return `var settings = {
  "url": "${req.url}",
  "method": "${req.method}",
  "headers": ${JSON.stringify(formatHeaders(req.headers), null, 2)},
  ${
    req.body && req.method !== "GET"
      ? `"data": ${JSON.stringify(req.body, null, 2)},`
      : ""
  }
};

$.ajax(settings).done(function (response) {
  console.log(response);
});`;
};

/* ================= XHR ================= */
export const generateXHRSnippet = (req: RequestData) => {
  return `var xhr = new XMLHttpRequest();
xhr.open("${req.method}", "${req.url}");

${Object.entries(formatHeaders(req.headers))
  .map(([k, v]) => `xhr.setRequestHeader("${k}", "${v}");`)
  .join("\n")}

xhr.onload = function () {
  console.log(xhr.responseText);
};

xhr.send(${req.body ? JSON.stringify(req.body) : ""});`;
};
