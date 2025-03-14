/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type KeyValue,
  type KeyValueChecked,
  RequestDataTypeEnum,
} from "@sparrow/common/types/workspace";
import { ReduceAuthHeader } from ".";
import { createDeepCopy } from "@sparrow/common/utils";
import { SetDataStructure } from "@sparrow/common/utils";
import type { GraphqlRequestTabInterface } from "@sparrow/common/types/workspace/graphql-request-tab";
import { type EnvironmentFilteredVariableBaseInterface } from "@sparrow/common/types/workspace/environment-base";

class DecodeGraphql {
  constructor() {}

  /**
   * @description - Extracts the content type from the API response and sets it in the user's state.
   * @param responseHeaders - Response header object
   */
  public setResponseContentType = (
    responseHeaders: KeyValue[],
  ): RequestDataTypeEnum => {
    if (responseHeaders) {
      for (let i = 0; i < responseHeaders.length; i++) {
        const key = responseHeaders[i].key;
        const value = responseHeaders[i].value;
        if (key === "content-type" && value.includes("text/html")) {
          return RequestDataTypeEnum.HTML;
        } else if (
          key === "content-type" &&
          value.includes("application/json")
        ) {
          return RequestDataTypeEnum.JSON;
        } else if (
          key === "content-type" &&
          value.includes("application/hal+json")
        ) {
          return RequestDataTypeEnum.JSON;
        } else if (
          key === "content-type" &&
          value.includes("application/xml")
        ) {
          return RequestDataTypeEnum.XML;
        } else if (
          key === "content-type" &&
          value.includes("application/javascript")
        ) {
          return RequestDataTypeEnum.JAVASCRIPT;
        } else if (key === "content-type" && value.startsWith("image/")) {
          return RequestDataTypeEnum.IMAGE;
        } else if (key === "content-type") {
          return RequestDataTypeEnum.TEXT;
        }
      }
    }
    return RequestDataTypeEnum.TEXT;
  };

  /**
   * Checks if http/https is present or not and modify url
   * @param str - Url String
   */
  private ensureHttpOrHttps = (str: string) => {
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return "";
    } else if (str.startsWith("//")) {
      return "http:";
    } else {
      return "http://";
    }
  };

  /**
   * Return only checked Key Value Pairs
   * @param pairs - Key value Pairs
   * @returns
   */
  private extractKeyValue = (pairs: KeyValueChecked[]): KeyValue[] => {
    const checkedPairs = [];
    for (const pair of pairs) {
      if (pair?.checked) {
        checkedPairs.push(pair);
      }
    }
    return checkedPairs;
  };

  /**
   * Extracts and modifies a URL based on authentication parameters and environment variables.
   * @param url - Request Url
   * @param request - Request Tab
   * @param environmentVariables - Environment Variables Array
   * @returns {string} Modified Url
   */
  private extractURL = (url: string): string => {
    // Get authentication header
    url = url.trim();
    return this.ensureHttpOrHttps(url) + url;
  };

  /**
   * Extracts and modifies a URL based on authentication parameters and environment variables.
   * @param url - Request Url
   * @param request - Request Tab
   * @param environmentVariables - Environment Variables Array
   * @returns {string} Modified Url
   */
  private extractQuery = (_query: string): string => {
    // Get authentication header
    return _query;
  };

  /**
   * Extracts and modifies Variables.
   * @param variables - Request Variables
   */
  private extractVariables = (_variables: string): string => {
    // Get authentication header
    return _variables;
  };

  /**
   * Extracts and combines headers from different sources, including auto-generated headers and authentication headers.
   * @param {KeyValuePair[]} headers - Headers provided by the user.
   * @param {KeyValuePair[]} autoGeneratedHeaders - Auto-generated headers.
   * @param {NewTab} request - Request Tab.
   * @returns {string} Stringified Headers Array.
   */
  private extractHeaders = (
    headers: KeyValueChecked[],
    autoGeneratedHeaders: KeyValueChecked[],
    request: GraphqlRequestTabInterface,
    environmentVariables: EnvironmentFilteredVariableBaseInterface[] = [],
  ): string => {
    // inject environment variable to basic auth before encryption
    const auth = createDeepCopy(request.auth);
    auth.basicAuth.username = this.setEnvironmentVariables(
      auth.basicAuth.username,
      environmentVariables,
    );
    auth.basicAuth.password = this.setEnvironmentVariables(
      auth.basicAuth.password,
      environmentVariables,
    );

    const authHeader: {
      key: string;
      value: string;
    } = new ReduceAuthHeader(request.state, auth).getValue();

    // Combine headers from different sources

    const combinedHeaders = this.extractKeyValue([
      ...autoGeneratedHeaders,
      ...headers,
    ]);

    // Add auth header if it exists
    if (authHeader.key || authHeader.value) {
      combinedHeaders.push({
        ...authHeader,
      });
    }

    // Conclude presedence of headers
    // 1. Auth Section
    // 2. Header Section
    // 3. Auto Generated Section

    // removes header with same key attribute
    const uniqueHeaders = new SetDataStructure().pushArrayOfObjects(
      combinedHeaders.toReversed(),
      "key",
    );

    // removes header with unused key attributes
    const res = uniqueHeaders.filter((elem) => {
      if (
        elem.key === "" ||
        elem.key.toLowerCase() === "content-length"
        // || elem.key.toLowerCase() === "content-type" // if required or not (research in progress)
      )
        return false;
      return true;
    });

    return JSON.stringify(res);
  };

  /**
   * Sets environment variables in a given text by replacing placeholders with corresponding values.
   * @param {string} text - The text containing placeholders for environment variables.
   * @param environmentVariables - Array of objects containing key-value pairs for environment variables.
   * @returns {string} The text with placeholders replaced by environment variable values.
   */
  private setEnvironmentVariables = (
    text: string,
    environmentVariables: EnvironmentFilteredVariableBaseInterface[],
  ): string => {
    let updatedText = text;
    environmentVariables.forEach((element) => {
      const regex = new RegExp(`{{(${element.key})}}`, "g");
      updatedText = updatedText.replace(regex, element.value);
    });
    return updatedText;
  };

  /**
   * Extract details from request and return formatted form of Request
   * @param request - User Request
   * @param environmentVariables - Array of objects containing key-value pairs for environment variables.
   */
  public init(
    request: GraphqlRequestTabInterface,
    environmentVariables: EnvironmentFilteredVariableBaseInterface[] = [],
  ): string[] {
    return [
      this.extractURL(
        this.setEnvironmentVariables(request.url, environmentVariables),
      ),
      this.setEnvironmentVariables(
        this.extractHeaders(
          request.headers,
          request.autoGeneratedHeaders,
          request,
          environmentVariables,
        ),
        environmentVariables,
      ),
      this.extractQuery(request.query),
      this.extractVariables(request.variables),
    ];
  }
}

export { DecodeGraphql };
