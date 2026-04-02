export type HeaderType = {
  key: string;
  value: string;
};

export type RequestData = {
  method: string;
  url: string;
  headers?: HeaderType[];
  body?: any;
  params?: Record<string, string>;
  auth?: {
    type: "bearer";
    token: string;
  } | null;
};

const appendQueryParams = (url: string, params?: Record<string, string>) => {
  if (!params || Object.keys(params).length === 0) return url;

  const query = new URLSearchParams(params).toString();
  return `${url}?${query}`;
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

  // AUTH
  if (req.auth?.type === "bearer" && req.auth.token) {
    headersObj["Authorization"] = `Bearer ${req.auth.token}`;
  }

  const finalUrl = appendQueryParams(req.url, req.params);

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
};

fetch("${finalUrl}", requestOptions)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
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

/* ================= AXIOS ================= */

export const generateAxiosSnippet = (req: RequestData) => {
  const headersObj = formatHeaders(req.headers);

  if (req.auth?.type === "bearer" && req.auth.token) {
    headersObj["Authorization"] = `Bearer ${req.auth.token}`;
  }

  const finalUrl = appendQueryParams(req.url, req.params);

  return `import axios from "axios";

const options = {
  method: "${req.method}",
  url: "${finalUrl}",
  headers: ${JSON.stringify(headersObj, null, 2)},
  ${
    req.body && req.method !== "GET"
      ? `data: ${JSON.stringify(req.body, null, 2)},`
      : ""
  }
};

axios.request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`;
};

/* ================= cURL ================= */
export const generateCurlSnippet = (req: RequestData) => {
  const headersObj = formatHeaders(req.headers);

  if (req.auth?.type === "bearer" && req.auth.token) {
    headersObj["Authorization"] = `Bearer ${req.auth.token}`;
  }

  const finalUrl = appendQueryParams(req.url, req.params);

  const headers = Object.entries(headersObj)
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(" \\\n  ");

  const body =
    req.body && req.method !== "GET"
      ? ` \\\n  -d '${JSON.stringify(req.body)}'`
      : "";

  return `curl --location --request ${req.method} '${finalUrl}' \\
  ${headers}${body}`;
};

export const generatePythonSnippet = (req: RequestData) => {
  const headersObj = formatHeaders(req.headers);

  if (req.auth?.type === "bearer" && req.auth.token) {
    headersObj["Authorization"] = `Bearer ${req.auth.token}`;
  }

  const finalUrl = appendQueryParams(req.url, req.params);

  return `import requests

url = "${finalUrl}"

headers = ${JSON.stringify(headersObj, null, 2)}

${
  req.body && req.method !== "GET"
    ? `data = ${JSON.stringify(req.body, null, 2)}`
    : ""
}

response = requests.request(
    "${req.method}",
    url,
    headers=headers,${req.body && req.method !== "GET" ? "\n    json=data" : ""}
)

print(response.text)
`;
};

export const generateJavaOkHttpSnippet = (req: RequestData) => {
  const headers = Object.entries(formatHeaders(req.headers))
    .map(([k, v]) => `.addHeader("${k}", "${v}")`)
    .join("\n    ");

  return `OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
    .url("${req.url}")
    .method("${req.method}", ${
      req.body && req.method !== "GET"
        ? `RequestBody.create(MediaType.parse("application/json"), "${JSON.stringify(req.body)}")`
        : "null"
    })
    ${headers}
    .build();

Response response = client.newCall(request).execute();`;
};

export const generateCSharpSnippet = (req: RequestData) => {
  const headers = Object.entries(formatHeaders(req.headers))
    .map(([k, v]) => `request.AddHeader("${k}", "${v}");`)
    .join("\n");

  return `var client = new RestClient("${req.url}");
var request = new RestRequest(Method.${req.method});

${headers}

${
  req.body && req.method !== "GET"
    ? `request.AddJsonBody(${JSON.stringify(req.body, null, 2)});`
    : ""
}

IRestResponse response = client.Execute(request);`;
};

export const generateGoSnippet = (req: RequestData) => {
  const headers = Object.entries(formatHeaders(req.headers))
    .map(([k, v]) => `req.Header.Add("${k}", "${v}")`)
    .join("\n");

  return `package main

import (
  "fmt"
  "net/http"
  "strings"
)

func main() {
  client := &http.Client{}

  var body = strings.NewReader(\`${JSON.stringify(req.body || {})}\`)

  req, _ := http.NewRequest("${req.method}", "${req.url}", body)

  ${headers}

  res, _ := client.Do(req)
  defer res.Body.Close()

  fmt.Println(res.Status)
}`;
};

export const generatePHPSnippet = (req: RequestData) => {
  const headers = Object.entries(formatHeaders(req.headers))
    .map(([k, v]) => `"${k}: ${v}"`)
    .join(",\n");

  return `$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${req.url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${req.method}",
  CURLOPT_HTTPHEADER => [
    ${headers}
  ],
  ${
    req.body && req.method !== "GET"
      ? `CURLOPT_POSTFIELDS => '${JSON.stringify(req.body)}',`
      : ""
  }
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;`;
};

export const generateDartSnippet = (req: RequestData) => {
  return `import 'package:http/http.dart' as http;

void main() async {
  var response = await http.${req.method.toLowerCase()}(
    Uri.parse("${req.url}"),
    headers: ${JSON.stringify(formatHeaders(req.headers), null, 2)},
    ${
      req.body && req.method !== "GET"
        ? `body: ${JSON.stringify(req.body, null, 2)},`
        : ""
    }
  );

  print(response.body);
}`;
};

export const generateKotlinSnippet = (req: RequestData) => {
  return `val client = OkHttpClient()

val request = Request.Builder()
  .url("${req.url}")
  .method("${req.method}", ${
    req.body && req.method !== "GET"
      ? `RequestBody.create("${JSON.stringify(req.body)}".toRequestBody())`
      : "null"
  })
  .build()

val response = client.newCall(request).execute()
println(response.body?.string())`;
};
