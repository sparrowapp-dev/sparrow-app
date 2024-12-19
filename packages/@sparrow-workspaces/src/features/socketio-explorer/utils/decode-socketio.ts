/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type KeyValue,
  type KeyValueChecked,
} from "@sparrow/common/types/workspace";
import { SetDataStructure } from "@sparrow/common/utils";

class DecodeSocketio {
  constructor() {}

  /**
   * Return only checked Key Value Pairs
   * @param pairs - Key value Pairs
   * @returns
   */
  private extractKeyValue = (pairs: KeyValueChecked[]): KeyValue[] => {
    const checkedPairs = [];
    for (const pair of pairs) {
      if (pair) {
        if (pair.checked) {
          checkedPairs.push(pair);
        }
      }
    }
    return checkedPairs;
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
  ): string => {
    // Combine headers from different sources
    const combinedHeaders = this.extractKeyValue([
      ...(autoGeneratedHeaders ?? []),
      ...(headers ?? []),
    ]);

    // Presedence of headers
    // 2. Header Section
    // 3. Auto Generated Section

    // removes header with same key attribute
    const uniqueHeaders = new SetDataStructure().pushArrayOfObjects(
      combinedHeaders.toReversed(),
      "key",
    );

    return JSON.stringify(
      uniqueHeaders.filter((elem) => {
        return elem.key !== "";
      }),
    );
  };

  /**
   * Sets environment variables in a given text by replacing placeholders with corresponding values.
   * @param {string} text - The text containing placeholders for environment variables.
   * @param environmentVariables - Array of objects containing key-value pairs for environment variables.
   * @returns {string} The text with placeholders replaced by environment variable values.
   */
  private setEnvironmentVariables = (
    _text: string,
    _environmentVariables,
  ): string => {
    let updatedText = _text;
    _environmentVariables.forEach((element) => {
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
  public init(_socketio, _environmentVariables): string[] {
    return [
      this.setEnvironmentVariables(_socketio.url, _environmentVariables),
      this.setEnvironmentVariables(
        this.extractHeaders(_socketio.headers, _socketio.autoGeneratedHeaders),
        _environmentVariables,
      ),
    ];
  }
}

export { DecodeSocketio };
