<script lang="ts">
  import {
    TestCaseConditionOperatorEnum,
    TestCaseSelectionTypeEnum,
  } from "@sparrow/common/types/workspace";
  import TestListItem from "./sub-components/test-list-item/TestListItem.svelte";
  import { WithSelectV4 } from "../../../../../../hoc";
  import { Button, Modal, notifications } from "@sparrow/library/ui";
  import { AddRegular, DeleteRegular } from "@sparrow/library/icons";
  import { JSONPath } from "jsonpath-plus";
  import { validate } from "uuid";
  import { TickIcon, TickMarkRoundedIcon } from "@sparrow/library/assets";
  import * as xpath from "xpath";
  import { DOMParser } from "xmldom";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection;
  export let testResults;
  export let responseBody;
  export let responseHeader;
  const localTest = tests;
  let errors = false;

  const getJsonPathValue = (_path, _response) => {
    try {
      const json = JSON.parse(_response);
      // Use JSONPath to extract value, supports $[3].userId, $[0].address.city, etc.
      const result = JSONPath({ path: _path, json });
      // If result is an array, take the first value
      const value = Array.isArray(result) ? result[0] : result;
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return value;
      } else return "";
    } catch (e) {
      return "";
    }
  };

  const getXPathValue = (_path, _response) => {
    try {
      const xml = _response;
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      // test.testPath should be a valid XPath, e.g. "/root/country/city"
      const nodes = xpath.select(_path, doc);
      let actual;
      if (Array.isArray(nodes) && nodes.length > 0) {
        // If it's an attribute node
        if (nodes[0].nodeType === 2) {
          actual = nodes[0].nodeValue;
        } else if (nodes[0].firstChild) {
          actual = nodes[0].firstChild.nodeValue;
        } else if ((nodes[0] as any).data) {
          actual = (nodes[0] as any).data;
        } else {
          actual = nodes[0].toString();
        }
      } else {
        actual = undefined;
      }
      if (
        typeof actual === "string" ||
        typeof actual === "number" ||
        typeof actual === "boolean"
      ) {
        return actual;
      } else return "";
    } catch (e) {
      return "";
    }
  };

  const getHeaderPathValue = (_path, _header) => {
    let actual = _header.find(
      (h) => h.key.toLowerCase() === _path?.toLowerCase(),
    )?.value;
    if (
      typeof actual === "string" ||
      typeof actual === "number" ||
      typeof actual === "boolean"
    ) {
      return actual;
    } else return "";
  };

  $: {
    const x = localTest.noCode.find((t) => t.isActive);
    errors = false;
    if (testResults) {
      for (let testResult of testResults) {
        if (
          x &&
          testResult.testId === x.id &&
          testResult.testStatus === false
        ) {
          errors = true;
          break;
        }
      }
    }
  }

  // Ensure at least one test is active on mount if tests exist
  if (
    localTest.noCode.length > 0 &&
    !localTest.noCode.some((t) => t.isActive)
  ) {
    localTest.noCode = localTest.noCode.map((t, i) => ({
      ...t,
      isActive: i === 0,
    }));
    // onTestsChange(localTest);
  }

  const selectTest = (test) => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      isActive: t.id === test.id,
    }));
    // onTestsChange(localTest);
  };

  const addTest = () => {
    const newId = `case-${localTest.noCode.length + 1}`;
    const newTest = {
      id: newId,
      name: `New Test ${localTest.noCode.length + 1}`,
      condition: "",
      expectedResult: "",
      testPath: "",
      testTarget: "",
      isActive: true,
    };
    localTest.noCode = [
      ...localTest.noCode.map((t) => ({ ...t, isActive: false })),
      newTest,
    ];
    // onTestsChange(localTest);
  };

  // ✅ Duplicate test
  const duplicateTest = (test) => {
    const newTest = {
      ...test,
      id: `${test.id}-copy-${Date.now()}`,
      name: `${test.name} (Copy)`,
      isActive: false,
    };
    localTest.noCode = [...localTest.noCode, newTest];
    selectTest(newTest);
  };

  $: {
    onTestsChange(localTest);
  }

  // ✅ Delete test
  const deleteTest = (test) => {
    localTest.noCode = localTest.noCode.filter((t) => t.id !== test.id);
    // If the deleted test was active, activate the first remaining test (if any)
    if (
      !localTest.noCode.some((t) => t.isActive) &&
      localTest.noCode.length > 0
    ) {
      localTest.noCode = localTest.noCode.map((t, i) => ({
        ...t,
        isActive: i === 0,
      }));
    }
    notifications.success(
      `“${test.name}” is removed from your assertion list.`,
    );
    // onTestsChange(localTest);
  };

  const clearTests = () => {
    localTest.noCode = [];
    notifications.success("All tests are removed from your list.");
    // onTestsChange(localTest);
  };

  const handleConditionDropdown = (
    conditionItem: TestCaseConditionOperatorEnum,
    test,
  ) => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      condition: t.id === test.id ? conditionItem : t.condition,
    }));
  };

  const handleTestTargetDropdown = (
    testTargetItem: TestCaseSelectionTypeEnum,
    test,
  ) => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      testTarget: t.id === test.id ? testTargetItem : t.testTarget,
      testPath: t.id === test.id ? "" : t.testPath,
    }));
  };

  const setByDefaultTestName = (test) => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      name: t.id === test.id ? `New Test` : t.name,
    }));
  };
  let isDeletePopup = false;

  const isValidJsonPath = (path: string): boolean => {
    // Starts with $ or @
    if (!path.startsWith("$") && !path.startsWith("@")) return false;

    // Basic regex for $.key, $.key[index], $.key.subkey
    const regex = /^(\$|@)(\.[a-zA-Z_][a-zA-Z0-9_]*|\[\d+\])*$/;
    return regex.test(path);
  };

  const isValidXPath = (path: string): boolean => {
    // Must start with /, //, or .
    if (!/^(\/{1,2}|\.)/.test(path)) return false;

    // Allow node names, attributes, and common functions like text(), node()
    const regex =
      /^(\/{1,2}([a-zA-Z_][\w-]*|\*)(\[@?[a-zA-Z_][\w-]*=('|")[^'"]+('|")\])?|\(\))*(\/(text\(\)|node\(\)|\*|[a-zA-Z_][\w-]*))*$/;

    return regex.test(path);
  };

  const isValidHeaderKey = (key: string): boolean => {
    // Only allow identifiers like JavaScript variable names
    const regex = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    return regex.test(key);
  };
</script>

<Modal
  title={"Remove All Tests?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      Are you sure you want to remove all {localTest?.noCode?.length} tests?
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      title={"Cancel"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
    />

    <Button
      title={"Remove All"}
      type={"danger"}
      onClick={() => {
        clearTests();
        isDeletePopup = false;
      }}
    />
  </div></Modal
>

<!-- Container -->
<div class="border border-top-0 text-light p-2 h-100 rounded-bottom">
  {#if localTest.noCode.length === 0}
    <!-- Empty state -->
    <div
      class="d-flex flex-column align-items-center justify-content-center h-100"
      style="overflow: auto;"
    >
      <p class="w-50 text-muted text-center text-fs-14 mb-3">
        No test Added. Please click ‘+ Add Test’ to create one. You can test
        status code, response time, body content, and more.
      </p>
      <Button
        startIcon={AddRegular}
        title={"Add Tests"}
        type="primary"
        size="small"
        onClick={addTest}
      />
    </div>
  {:else}
    <!-- Main layout -->
    <div
      class="d-flex h-100 {tabSplitDirection === 'vertical'
        ? 'flex-column'
        : 'flex-row'}"
    >
      <!-- Left Sidebar -->
      <div
        class="h-100"
        style="width: {tabSplitDirection === 'vertical'
          ? '100%'
          : '25%'}; overflow: auto;"
      >
        <div class="pb-2">
          {#each localTest.noCode as test, index}
            <TestListItem
              {test}
              {selectTest}
              {deleteTest}
              {duplicateTest}
              {index}
              {testResults}
            />
          {/each}
        </div>

        <div class="d-flex gap-2 pb-2" style="flex-wrap:wrap;">
          <div class="">
            <Button
              startIcon={AddRegular}
              title={"Add Tests"}
              type="primary"
              size="small"
              onClick={addTest}
            />
          </div>
          <div class="">
            <Button
              title={"Clear All"}
              startIcon={DeleteRegular}
              type="secondary"
              size="small"
              onClick={() => {
                isDeletePopup = true;
              }}
            />
          </div>
        </div>
      </div>

      <!-- Right Form -->
      <div
        class="h-100 gap-2 d-flex {tabSplitDirection === 'vertical'
          ? 'border-top pt-2'
          : 'border-start ms-2 ps-2'}"
        style="width: {tabSplitDirection === 'vertical'
          ? '100%'
          : '75%'}; overflow: auto; flex-flow:wrap; align-content:flex-start;"
      >
        {#if localTest.noCode.some((t) => t.isActive)}
          {#each localTest.noCode as test}
            {#if test.isActive}
              <div
                style="display: flex; flex-wrap: wrap; gap: 1rem; width: 100%;"
              >
                <div style="flex: 1 1 45%; min-width: 0;">
                  <label class="form-label text-fs-12"
                    >Name <span style="color: var(--text-ds-danger-300)">*</span
                    ></label
                  >
                  <input
                    type="text"
                    class="form-control text-light"
                    bind:value={test.name}
                    on:blur={() => {
                      if (!test.name) {
                        setByDefaultTestName(test);
                      }
                    }}
                    placeholder="Enter Test Name"
                  />
                </div>
                <div style="flex: 1 1 45%; min-width: 0;">
                  <label class="form-label text-fs-12"
                    >Test Target <span style="color: var(--text-ds-danger-300)"
                      >*</span
                    ></label
                  >
                  <WithSelectV4
                    id={"hdre89fhrbej"}
                    data={[
                      {
                        name: "Response Header",
                        id: TestCaseSelectionTypeEnum.RESPONSE_HEADER,
                      },
                      {
                        name: "Response JSON",
                        id: TestCaseSelectionTypeEnum.RESPONSE_JSON,
                      },
                      {
                        name: "Response Text",
                        id: TestCaseSelectionTypeEnum.RESPONSE_TEXT,
                      },
                      {
                        name: "Response XML",
                        id: TestCaseSelectionTypeEnum.RESPONSE_XML,
                      },
                      {
                        name: "Time Consuming",
                        id: TestCaseSelectionTypeEnum.TIME_CONSUMING,
                      },
                    ]}
                    titleId={test?.testTarget}
                    onclick={(testTargetItem) => {
                      handleTestTargetDropdown(testTargetItem, test);
                    }}
                    placeholder="Select Test Target"
                    zIndex={499}
                    disabled={false}
                    isError={errors && !test.testTarget}
                  />
                  {#if errors && !test.testTarget}
                    <div
                      class="text-fs-12 mt-1"
                      style="color: var(--text-ds-danger-300)"
                    >
                      Please select a test target
                    </div>
                  {/if}
                </div>
                <div style="flex: 1 1 45%; min-width: 0;">
                  <label class="form-label text-fs-12"
                    >Condition <span style="color: var(--text-ds-danger-300)"
                      >*</span
                    ></label
                  >
                  <WithSelectV4
                    id={"hdregtrgt89fhrbej"}
                    data={[
                      {
                        name: "Equals",
                        id: TestCaseConditionOperatorEnum.EQUALS,
                      },
                      {
                        name: "Not Equal",
                        id: TestCaseConditionOperatorEnum.NOT_EQUAL,
                      },
                      {
                        name: "Exists",
                        id: TestCaseConditionOperatorEnum.EXISTS,
                      },
                      {
                        name: "Does Not Exist",
                        id: TestCaseConditionOperatorEnum.DOES_NOT_EXIST,
                      },
                      {
                        name: "Less Than",
                        id: TestCaseConditionOperatorEnum.LESS_THAN,
                      },
                      {
                        name: "Greater Than",
                        id: TestCaseConditionOperatorEnum.GREATER_THAN,
                      },
                      {
                        name: "Contains",
                        id: TestCaseConditionOperatorEnum.CONTAINS,
                      },
                      {
                        name: "Does Not Contain",
                        id: TestCaseConditionOperatorEnum.DOES_NOT_CONTAIN,
                      },
                      {
                        name: "Is Empty",
                        id: TestCaseConditionOperatorEnum.IS_EMPTY,
                      },
                      {
                        name: "Is Not Empty",
                        id: TestCaseConditionOperatorEnum.IS_NOT_EMPTY,
                      },
                      {
                        name: "In List",
                        id: TestCaseConditionOperatorEnum.IN_LIST,
                      },
                      {
                        name: "Not In List",
                        id: TestCaseConditionOperatorEnum.NOT_IN_LIST,
                      },
                    ]}
                    titleId={test?.condition}
                    onclick={(conditionItem) => {
                      handleConditionDropdown(conditionItem, test);
                    }}
                    placeholder="Select Condition"
                    zIndex={499}
                    disabled={false}
                    isError={errors && !test.condition}
                  />
                  {#if errors && !test.condition}
                    <div
                      class="text-fs-12 mt-1"
                      style="color: var(--text-ds-danger-300)"
                    >
                      Please select a condition
                    </div>
                  {/if}
                </div>
                {#if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER || test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON || test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                  <div style="flex: 1 1 45%; min-width: 0;">
                    <label class="form-label text-fs-12">
                      {#if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER}
                        Header
                      {:else if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON}
                        JSON
                      {:else if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                        XML
                      {/if}
                      Path
                      <span style="color: var(--text-ds-danger-300">*</span
                      ></label
                    >
                    <input
                      type="text"
                      class="form-control text-light"
                      bind:value={test.testPath}
                      placeholder={test?.testTarget ===
                      TestCaseSelectionTypeEnum.RESPONSE_JSON
                        ? "E.g. $.user.name"
                        : test?.testTarget ===
                            TestCaseSelectionTypeEnum.RESPONSE_XML
                          ? "E.g. /root/user/name"
                          : test?.testTarget ===
                              TestCaseSelectionTypeEnum.RESPONSE_HEADER
                            ? "E.g. Content-Type"
                            : "Enter path"}
                      style={errors &&
                      (!test.testPath ||
                        (test.testPath &&
                          test?.testTarget ===
                            TestCaseSelectionTypeEnum.RESPONSE_JSON &&
                          !isValidJsonPath(test.testPath)) ||
                        (test.testPath &&
                          test?.testTarget ===
                            TestCaseSelectionTypeEnum.RESPONSE_XML &&
                          !isValidXPath(test.testPath)) ||
                        (test.testPath &&
                          test?.testTarget ===
                            TestCaseSelectionTypeEnum.RESPONSE_HEADER &&
                          !isValidHeaderKey(test.testPath)))
                        ? "border: 1px solid var(--text-ds-danger-300)"
                        : ""}
                    />
                    {#if errors && !test.testPath}
                      <div
                        class="text-fs-12 mt-1"
                        style="color: var(--text-ds-danger-300)"
                      >
                        Please enter a {#if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER}
                          Header
                        {:else if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON}
                          JSON
                        {:else if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                          XML
                        {/if} Path
                      </div>
                    {:else if test.testPath && test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON}
                      {#if !isValidJsonPath(test.testPath)}
                        <div
                          class="text-fs-12 mt-1"
                          style="color: var(--text-ds-danger-300)"
                        >
                          Invalid Path syntax. Please check your path format.
                        </div>
                      {:else if getJsonPathValue(test.testPath, responseBody)}
                        <div class="text-fs-12 mt-1 ellipsis text-muted">
                          <span class="mr-1">
                            <TickMarkRoundedIcon
                              color={"var(--icon-ds-success-500)"}
                            />
                          </span>
                          <span
                            class="ellipsis"
                            style="color: var(--text-ds-neutral-300);"
                          >
                            Path valid. Sample value: {test.testPath}
                            = {getJsonPathValue(test.testPath, responseBody)}
                          </span>
                        </div>
                      {/if}
                    {:else if test.testPath && test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                      {#if !isValidXPath(test.testPath)}
                        <div
                          class="text-fs-12 mt-1"
                          style="color: var(--text-ds-danger-300)"
                        >
                          Invalid Path syntax. Please check your path format.
                        </div>
                      {:else if getXPathValue(test.testPath, responseBody)}
                        <div class="text-fs-12 mt-1 ellipsis text-muted">
                          <span class="mr-1">
                            <TickMarkRoundedIcon
                              color={"var(--icon-ds-success-500)"}
                            />
                          </span>
                          <span
                            class="ellipsis"
                            style="color: var(--text-ds-neutral-300);"
                          >
                            Path valid. Sample value: {test.testPath}
                            = {getXPathValue(test.testPath, responseBody)}
                          </span>
                        </div>
                      {/if}
                    {:else if test.testPath && test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER}
                      {#if !isValidHeaderKey(test.testPath)}
                        <div
                          class="text-fs-12 mt-1"
                          style="color: var(--text-ds-danger-300)"
                        >
                          Invalid Path syntax. Please check your path format.
                        </div>
                      {:else if getHeaderPathValue(test.testPath, responseHeader)}
                        <div class="text-fs-12 mt-1 ellipsis text-muted">
                          <span class="mr-1">
                            <TickMarkRoundedIcon
                              color={"var(--icon-ds-success-500)"}
                            />
                          </span>
                          <span
                            class="ellipsis"
                            style="color: var(--text-ds-neutral-300);"
                          >
                            Path valid. Sample value: {test.testPath}
                            = {getHeaderPathValue(
                              test.testPath,
                              responseHeader,
                            )}
                          </span>
                        </div>
                      {/if}
                    {/if}
                  </div>
                {/if}
                {#if test?.condition === TestCaseConditionOperatorEnum.EQUALS || test?.condition === TestCaseConditionOperatorEnum.NOT_EQUAL || test?.condition === TestCaseConditionOperatorEnum.EXISTS || test?.condition === TestCaseConditionOperatorEnum.DOES_NOT_EXIST || test?.condition === TestCaseConditionOperatorEnum.LESS_THAN || test?.condition === TestCaseConditionOperatorEnum.GREATER_THAN || test?.condition === TestCaseConditionOperatorEnum.CONTAINS || test?.condition === TestCaseConditionOperatorEnum.DOES_NOT_CONTAIN || test?.condition === TestCaseConditionOperatorEnum.IN_LIST || test?.condition === TestCaseConditionOperatorEnum.NOT_IN_LIST}
                  <div style="flex: 1 1 45%; min-width: 0;">
                    <label class="form-label text-fs-12"
                      >Comparison Value <span
                        style="color: var(--text-ds-danger-300)">*</span
                      ></label
                    >
                    <input
                      type="text"
                      class="form-control text-light"
                      bind:value={test.expectedResult}
                      placeholder="Enter Comparison Value"
                      style={errors && !test.testPath
                        ? "border: 1px solid var(--text-ds-danger-300)"
                        : ""}
                    />
                    {#if errors && !test.expectedResult}
                      <div
                        class="text-fs-12 mt-1"
                        style="color: var(--text-ds-danger-300)"
                      >
                        Please enter comparison value
                      </div>
                    {/if}
                  </div>
                {/if}
                <div style="flex: 1 1 45%; min-width: 0;"></div>
              </div>
            {/if}
          {/each}
        {:else}
          <p class="text-muted">No test selected</p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  input {
    font-size: 12px;
    height: 36px;
    background-color: var(--bg-ds-surface-600);
    border: 1px solid transparent;
  }
  input:hover,
  input:focus {
    background-color: var(--bg-ds-surface-600);
    border: 1px solid var(--border-ds-primary-300);
  }
</style>
