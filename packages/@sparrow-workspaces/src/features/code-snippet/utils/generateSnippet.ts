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

const getSafeUrl = (url?: string) => {
  try {
    return new URL(url || "http://localhost");
  } catch {
    return new URL("http://localhost");
  }
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
  const r = buildRequest(req);

  return `const requestOptions = {
  method: "${r.method}",
  headers: ${
    Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
  },
  ${
    r.body && r.method !== "GET"
      ? `body: JSON.stringify(${JSON.stringify(r.body, null, 2)}),`
      : ""
  }
};

fetch("${r.url}", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));`;
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
  const r = buildRequest(req);

  return `import axios from "axios";

const options = {
  method: "${r.method}",
  url: "${r.url}",
  headers: ${
    Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
  },
  ${
    r.body && r.method !== "GET"
      ? `data: ${JSON.stringify(r.body, null, 2)},`
      : ""
  }
};

axios.request(options)
  .then(response => console.log(response.data))
  .catch(error => console.log(error));`;
};

/* ================= cURL ================= */
export const generateCurlSnippet = (req: RequestData) => {
  const r = buildRequest(req);

  const headers = Object.entries(r.headers)
    .map(([k, v]) => `--header '${k}: ${v}'`)
    .join(" \\\n");

  return `curl --location '${r.url}' \\
${headers}
${
  r.body && r.method !== "GET" ? `--data-raw '${JSON.stringify(r.body)}'` : ""
}`;
};

export const generatePythonSnippet = (req: RequestData) => {
  const r = buildRequest(req);

  return `import requests

url = "${r.url}"

headers = ${
    Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
  }

${
  r.body && r.method !== "GET"
    ? `payload = ${JSON.stringify(r.body, null, 2)}`
    : ""
}

response = requests.request(
    "${r.method}",
    url,
    headers=headers,${r.body && r.method !== "GET" ? "\n    json=payload" : ""}
)

print(response.text)`;
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
        ? `RequestBody.create(MediaType.parse("application/json"), "${JSON.stringify(req.body || {}, null, 2)}")`
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
      ? `CURLOPT_POSTFIELDS => '${JSON.stringify(req.body || {}, null, 2)}',`
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
      ? `RequestBody.create("${JSON.stringify(req.body || {}, null, 2)}".toRequestBody())`
      : "null"
  })
  .build()

val response = client.newCall(request).execute()
println(response.body?.string())`;
};

export const generateGenericSnippet = (req: RequestData, lang: string) => {
  return `// ${lang} snippet coming soon 🚀

Method: ${req.method}
URL: ${req.url}

Headers:
${JSON.stringify(formatHeaders(req.headers), null, 2)}

Body:
${JSON.stringify(req.body, null, 2)}
`;
};

type Template = (req: any) => string;

const buildRequest = (req: RequestData) => {
  const headers = formatHeaders(req.headers);

  const isJSON =
    headers["Content-Type"]?.includes("application/json") ||
    typeof req.body === "object";

  return {
    method: req.method,
    url: appendQueryParams(req.url, req.params),
    headers,
    body: req.body,
    isJSON,
  };
};

export const TEMPLATES: Record<string, Template> = {
  "python-httpclient": (req) => {
    const r = buildRequest(req);

    return `import http.client
import json

conn = http.client.HTTPSConnection("${r.url.replace("https://", "").split("/")[0]}")

payload = ${r.body || "''"}

headers = ${
      Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
    }

conn.request("${r.method}", "${getSafeUrl(r.url).pathname}", payload, headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))`;
  },

  "node-axios": (req) => {
    const r = buildRequest(req);

    return `const axios = require('axios');

let config = {
  method: '${r.method}',
  maxBodyLength: Infinity,
  url: '${r.url}',
  headers: ${
    Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
  },
  ${r.body ? `data: JSON.stringify(${JSON.stringify(r.body, null, 2)})` : ""}
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});`;
  },

  "shell-wget": (req) => {
    const r = buildRequest(req);

    return `wget --method=${r.method} "${r.url}" \\
${Object.entries(r.headers)
  .map(([k, v]) => `  --header="${k}: ${v}"`)
  .join(" \\\n")}
${r.body ? `  --body-data='${r.body}'` : ""}`;
  },

  "shell-httpie": (req) => {
    const r = buildRequest(req);

    return `http ${r.method} ${r.url} \\
${Object.entries(r.headers)
  .map(([k, v]) => `${k}:${v}`)
  .join(" \\\n")}
${r.body ? JSON.stringify(JSON.parse(r.body)) : ""}`;
  },

  "php-httprequest2": (req) => {
    const r = buildRequest(req);

    return `<?php
require_once 'HTTP/Request2.php';

$request = new HTTP_Request2('${r.url}');
$request->setMethod(HTTP_Request2::METHOD_${r.method});

$request->setHeader(${
      Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
    });
${r.body ? `$request->setBody('${r.body}');` : ""}

$response = $request->send();
echo $response->getBody();`;
  },

  "powershell-restmethod": (req) => {
    const r = buildRequest(req);

    return `$headers = ${
      Object.keys(r.headers).length ? JSON.stringify(r.headers, null, 2) : "{}"
    }

$response = Invoke-RestMethod -Uri "${r.url}" -Method ${r.method} -Headers $headers ${
      r.body ? `-Body '${r.body}'` : ""
    }

$response`;
  },

  "rust-reqwest": (req) => {
    const r = buildRequest(req);

    return `use reqwest;

#[tokio::main]
async fn main() {
  let client = reqwest::Client::new();

  let res = client
    .${r.method.toLowerCase()}("${r.url}")
    ${r.body ? `.body(serde_json::to_string(&${JSON.stringify(req.body || {}, null, 2)}).unwrap())` : ""}
    .send()
    .await
    .unwrap();

  println!("{}", res.text().await.unwrap());
}`;
  },
};

export const generateNodeAxiosSnippet = (req: RequestData) => {
  return `const axios = require("axios");

axios({
  method: "${req.method}",
  url: "${req.url}",
  headers: ${JSON.stringify(formatHeaders(req.headers), null, 2)},
  data: ${JSON.stringify(req.body || {}, null, 2)}
})
.then(res => console.log(res.data))
.catch(console.error);`;
};

export const generateNodeNativeSnippet = (req: RequestData) => {
  return `fetch("${req.url}", {
  method: "${req.method}",
  headers: ${JSON.stringify(formatHeaders(req.headers), null, 2)},
  body: JSON.stringify(${JSON.stringify(req.body || {}, null, 2)})
})
.then(res => res.json())
.then(console.log)
.catch(console.error);`;
};

export const generateNodeRequestSnippet = (req: RequestData) => {
  return `const request = require("request");

request({
  method: "${req.method}",
  url: "${req.url}",
  headers: ${JSON.stringify(formatHeaders(req.headers), null, 2)},
  body: JSON.stringify(${JSON.stringify(req.body || {}, null, 2)})
}, (err, res) => {
  if (err) throw err;
  console.log(res.body);
});`;
};

export const generateNodeUnirestSnippet = (req: RequestData) => {
  return `const unirest = require("unirest");

unirest("${req.method}", "${req.url}")
.headers(${JSON.stringify(formatHeaders(req.headers), null, 2)})
.send(${JSON.stringify(req.body || {}, null, 2)})
.end(res => console.log(res.body));`;
};

TEMPLATES["shell-httpie"] = (req) => {
  const headers = formatHeaders(req.headers);

  const headerString = Object.entries(headers || {})
    .map(([k, v]) => `${k}:"${v}"`)
    .join(" \\\n  ");

  const body = req.body
    ? Object.entries(req.body)
        .map(([k, v]) => `${k}:=${JSON.stringify(v)}`)
        .join(" \\\n  ")
    : "";

  return `http ${req.method} "${req.url}" \\
  ${headerString}${body ? " \\\n  " + body : ""}`;
};

export const generateShellWgetSnippet = (req: RequestData) => {
  return `wget --method=${req.method} "${req.url}"`;
};

/* ================= REGISTER ALL TEMPLATES ================= */

TEMPLATES["fetch"] = generateFetchSnippet;
TEMPLATES["axios"] = generateAxiosSnippet;
TEMPLATES["xhr"] = generateXHRSnippet;
TEMPLATES["jquery"] = generateJquerySnippet;

TEMPLATES["curl"] = generateCurlSnippet;

TEMPLATES["python-requests"] = generatePythonSnippet;

TEMPLATES["node-axios"] = generateNodeAxiosSnippet;
TEMPLATES["node-native"] = (req) => {
  const url = getSafeUrl(req.url);

  return `const https = require("https");

const options = {
  method: "${req.method}",
  hostname: "${url.hostname}",
  path: "${url.pathname}",
  headers: ${JSON.stringify(formatHeaders(req.headers), null, 2)}
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(data);
  });
});

${req.body ? `req.write(JSON.stringify(${JSON.stringify(req.body, null, 2)}));` : ""}

req.end();`;
};
TEMPLATES["node-request"] = generateNodeRequestSnippet;
TEMPLATES["node-unirest"] = generateNodeUnirestSnippet;

TEMPLATES["java-okhttp"] = generateJavaOkHttpSnippet;

/* 🚀 ADD THIS (YOU WERE MISSING) */
TEMPLATES["java-unirest"] = (req) => {
  return `Unirest.${req.method.toLowerCase()}("${req.url}")
  .asString();`;
};

TEMPLATES["csharp-restsharp"] = generateCSharpSnippet;

/* 🚀 ADD THIS (MISSING) */
TEMPLATES["csharp-httpclient"] = (req) => {
  return `var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${req.method}, "${req.url}");
var response = await client.SendAsync(request);
var result = await response.Content.ReadAsStringAsync();`;
};

TEMPLATES["go-native"] = generateGoSnippet;

TEMPLATES["php-curl"] = generatePHPSnippet;

/* 🚀 ADD THESE (YOU MISSED) */
TEMPLATES["php-guzzle"] = (req) => {
  return `$client = new \\GuzzleHttp\\Client();
$response = $client->request('${req.method}', '${req.url}');
echo $response->getBody();`;
};

TEMPLATES["dart-http"] = generateDartSnippet;

/* 🚀 ADD THIS */
TEMPLATES["dart-dio"] = (req) => {
  return `final dio = Dio();
final response = await dio.${req.method.toLowerCase()}("${req.url}");
print(response.data);`;
};

TEMPLATES["kotlin-okhttp"] = generateKotlinSnippet;

/* 🚀 ADD REMAINING LANGUAGES */

TEMPLATES["swift-urlsession"] = (req) => {
  return `let url = URL(string: "${req.url}")!
let task = URLSession.shared.dataTask(with: url) { data, _, _ in
  print(String(data: data!, encoding: .utf8)!)
}
task.resume()`;
};

TEMPLATES["ruby-nethttp"] = (req) => {
  return `require 'net/http'
uri = URI("${req.url}")
res = Net::HTTP.get_response(uri)
puts res.body`;
};

TEMPLATES["r-httr"] = (req) => {
  return `library(httr)
res <- VERB("${req.method}", "${req.url}")
content(res)`;
};

TEMPLATES["r-rcurl"] = (req) => {
  return `library(RCurl)
res <- getURL("${req.url}")
print(res)`;
};

TEMPLATES["powershell-restmethod"] = TEMPLATES["powershell-restmethod"];

TEMPLATES["objc-nsurlsession"] = (req) => {
  return `NSURL *url = [NSURL URLWithString:@"${req.url}"];
NSURLSessionDataTask *task = [[NSURLSession sharedSession]
dataTaskWithURL:url completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
  NSLog(@"%@", [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
}];
[task resume];`;
};

TEMPLATES["c-libcurl"] = (req) => {
  return `CURL *curl = curl_easy_init();
curl_easy_setopt(curl, CURLOPT_URL, "${req.url}");
curl_easy_perform(curl);
curl_easy_cleanup(curl);`;
};

TEMPLATES["java-unirest"] = (req) => {
  return `HttpResponse<String> response = Unirest.${req.method.toLowerCase()}("${req.url}")
  .asString();

System.out.println(response.getBody());`;
};

TEMPLATES["csharp-httpclient"] = (req) => {
  return `var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${req.method}, "${req.url}");

${req.body ? `request.Content = new StringContent(JsonConvert.SerializeObject(${JSON.stringify(req.body, null, 2)}), Encoding.UTF8, "application/json");` : ""}

var response = await client.SendAsync(request);
var result = await response.Content.ReadAsStringAsync();

Console.WriteLine(result);`;
};

TEMPLATES["php-guzzle"] = (req) => {
  return `$client = new \\GuzzleHttp\\Client();

$response = $client->request('${req.method}', '${req.url}', [
  'headers' => ${JSON.stringify(formatHeaders(req.headers), null, 2)},
  ${req.body ? `'json' => ${JSON.stringify(req.body, null, 2)}` : ""}
]);

echo $response->getBody();`;
};

TEMPLATES["dart-dio"] = (req) => {
  return `import 'package:dio/dio.dart';

void main() async {
  final dio = Dio();

  final response = await dio.request(
    "${req.url}",
    options: Options(method: "${req.method}"),
    data: ${JSON.stringify(req.body || {}, null, 2)},
  );

  print(response.data);
}`;
};

TEMPLATES["swift-urlsession"] = (req) => {
  return `import Foundation

let url = URL(string: "${req.url}")!
var request = URLRequest(url: url)
request.httpMethod = "${req.method}"

${req.body ? `request.httpBody = try! JSONSerialization.data(withJSONObject: ${JSON.stringify(req.body || {}, null, 2)}, options: [])` : ""}

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data {
        print(String(data: data, encoding: .utf8)!)
    }
}

task.resume()`;
};

TEMPLATES["ruby-nethttp"] = (req) => {
  return `require 'net/http'
require 'json'

uri = URI("${req.url}")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::${req.method.charAt(0) + req.method.slice(1).toLowerCase()}.new(uri)
request.body = ${JSON.stringify(req.body || {}, null, 2)}.to_json

response = http.request(request)
puts response.body`;
};

TEMPLATES["r-httr"] = (req) => {
  return `library(httr)

res <- VERB(
  "${req.method}",
  "${req.url}",
  body = ${JSON.stringify(req.body || {}, null, 2)},
  encode = "json"
)

content(res)`;
};

TEMPLATES["objc-nsurlsession"] = (req) => {
  return `NSURL *url = [NSURL URLWithString:@"${req.url}"];
NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];

[request setHTTPMethod:@"${req.method}"];

NSURLSession *session = [NSURLSession sharedSession];
NSURLSessionDataTask *task = [session dataTaskWithRequest:request
completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
  if (data) {
    NSString *result = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    NSLog(@"%@", result);
  }
}];

[task resume];`;
};

TEMPLATES["c-libcurl"] = (req) => {
  return `#include <curl/curl.h>

int main(void) {
  CURL *curl = curl_easy_init();

  if(curl) {
    curl_easy_setopt(curl, CURLOPT_URL, "${req.url}");
    curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${req.method}");

    curl_easy_perform(curl);
    curl_easy_cleanup(curl);
  }

  return 0;
}`;
};

export const generatePythonHttpClientSnippet = (req: RequestData) => {
  const url = getSafeUrl(req.url);

  return `import http.client
import json

conn = http.client.HTTPSConnection("${url.host}")

payload = json.dumps(${JSON.stringify(req.body || {}, null, 2)})

headers = ${JSON.stringify(formatHeaders(req.headers), null, 2)}

conn.request("${req.method}", "${url.pathname}", payload, headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))`;
};
