<script lang="ts">
  import {
    TestCaseConditionOperatorEnum,
    TestCaseSelectionTypeEnum,
  } from "@sparrow/common/types/workspace";
  import TestListItem from "./sub-components/test-list-item/TestListItem.svelte";
  import { WithSelectV4 } from "../../../../../../hoc";
  import { Button, Modal, notifications } from "@sparrow/library/ui";
  import {
    AddRegular,
    CheckmarkCircleFilled,
    DeleteRegular,
    InfoRegular,
  } from "@sparrow/library/icons";
  import { JSONPath } from "jsonpath-plus";
  import * as xpath from "xpath";
  import { DOMParser } from "xmldom";
  import { onDestroy, onMount } from "svelte";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection;
  export let testResults;
  export let responseBody;
  export let responseHeader;
  export let isSaved = false; // New prop to track save state
  const localTest = tests;
  let errors = false;
  let isZoomedIn = false;

  const detectZoom = () => {
    isZoomedIn = window.devicePixelRatio > 1.25;
  };

  onMount(() => {
    detectZoom();
    window.addEventListener("resize", detectZoom);
  });

  onDestroy(() => {
    window.removeEventListener("resize", detectZoom);
  });

  // Function to reset unsaved changes after save
  export const resetUnsavedChanges = () => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      hasUnsavedChanges: false,
      _originalState: {
        name: t.name,
        testTarget: t.testTarget,
        condition: t.condition,
        testPath: t.testPath,
        expectedResult: t.expectedResult,
      },
    }));
  };

  // Watch for isSaved prop changes to reset unsaved state
  $: if (isSaved) {
    resetUnsavedChanges();
  }

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
      } else return undefined;
    } catch (e) {
      return undefined;
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

    // Check test execution results
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

    // Also check for field validation errors
    if (x && !errors) {
      const fieldErrors = validateFields(x);
      errors = !!(
        fieldErrors.name ||
        fieldErrors.testTarget ||
        fieldErrors.condition ||
        fieldErrors.testPath ||
        fieldErrors.expectedResult
      );
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
  }

  // Track unsaved changes by comparing current state with original
  const hasTestChanged = (test) => {
    if (!test._originalState) return false;
    return (
      test.name !== test._originalState.name ||
      test.testTarget !== test._originalState.testTarget ||
      test.condition !== test._originalState.condition ||
      test.testPath !== test._originalState.testPath ||
      test.expectedResult !== test._originalState.expectedResult
    );
  };

  // Validate required fields
  const validateFields = (test) => {
    const errors = {
      name:
        !test.name || test.name.trim() === ""
          ? "This field cannot be empty. Please enter test name"
          : "",
      testTarget: !test.testTarget
        ? "This field cannot be empty. Please select test target"
        : "",
      condition: !test.condition
        ? "This field cannot be empty. Please select condition"
        : "",
      testPath: "",
      expectedResult: "",
    };

    // Test path is required for response JSON, XML, and header
    if (
      test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON ||
      test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML ||
      test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER
    ) {
      if (!test.testPath || test.testPath.trim() === "") {
        let pathType = "path";
        if (test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON) {
          pathType = "JSON path";
        } else if (test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML) {
          pathType = "XML path";
        } else if (
          test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER
        ) {
          pathType = "header key";
        }
        errors.testPath = `This field cannot be empty. Please enter ${pathType}`;
      } else {
        // Check syntax validation if path is provided
        if (
          test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON &&
          !isValidJsonPath(test.testPath)
        ) {
          errors.testPath =
            "Invalid path syntax. Please check your path format.";
        } else if (
          test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML &&
          !isValidXPath(test.testPath)
        ) {
          errors.testPath =
            "Invalid path syntax. Please check your path format.";
        } else if (
          test.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER &&
          !isValidHeaderKey(test.testPath)
        ) {
          errors.testPath =
            "Invalid path syntax. Please check your path format.";
        }
      }
    }

    // Expected result is required for all comparison conditions except EXISTS and DOES_NOT_EXIST
    if (
      test.condition !== TestCaseConditionOperatorEnum.EXISTS &&
      test.condition !== TestCaseConditionOperatorEnum.DOES_NOT_EXIST
    ) {
      if (
        !test.expectedResult ||
        test.expectedResult.toString().trim() === ""
      ) {
        errors.expectedResult =
          "This field cannot be empty. Please enter comparison value";
      }
    }

    return errors;
  };

  const selectTest = (test) => {
    // Track unsaved changes before switching
    const currentTest = localTest.noCode.find((t) => t.isActive);
    if (currentTest) {
      currentTest.hasUnsavedChanges = hasTestChanged(currentTest);
    }

    // Store original state when selecting a test
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      isActive: t.id === test.id,
      _originalState:
        t.id === test.id && !t._originalState
          ? {
              name: t.name,
              testTarget: t.testTarget,
              condition: t.condition,
              testPath: t.testPath,
              expectedResult: t.expectedResult,
            }
          : t._originalState,
    }));
    onTestsChange(localTest);
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
      _originalState: {
        name: `New Test ${localTest.noCode.length + 1}`,
        testTarget: "",
        condition: "",
        testPath: "",
        expectedResult: "",
      },
    };
    localTest.noCode = [
      ...localTest.noCode.map((t) => ({ ...t, isActive: false })),
      newTest,
    ];
    onTestsChange(localTest);
  };

  // ✅ Duplicate test with incremental naming
  const duplicateTest = (test) => {
    // Extract number from test name if it exists
    const nameMatch = test.name.match(/^(.+?)(\d+)$/);
    let baseName = test.name;
    let nextNumber = 2;

    if (nameMatch) {
      baseName = nameMatch[1].trim();
      nextNumber = parseInt(nameMatch[2]) + 1;
    }

    // Find the highest number for this base name
    const existingNumbers = localTest.noCode
      .map((t) => {
        const match = t.name.match(
          new RegExp(
            `^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(\\d+)$`,
          ),
        );
        return match ? parseInt(match[1]) : 0;
      })
      .filter((n) => n > 0);

    if (existingNumbers.length > 0) {
      nextNumber = Math.max(...existingNumbers) + 1;
    }

    const newTest = {
      ...test,
      id: `${test.id}-copy-${Date.now()}`,
      name: `${baseName} ${nextNumber}`,
      isActive: false,
      hasUnsavedChanges: false,
      _originalState: undefined,
    };
    localTest.noCode = [...localTest.noCode, newTest];
    selectTest(newTest);
    onTestsChange(localTest);
  };

  // Track active test validation
  let activeTestErrors = {
    name: "",
    testTarget: "",
    condition: "",
    testPath: "",
    expectedResult: "",
  };

  $: {
    const activeTest = localTest.noCode.find((t) => t.isActive);
    if (activeTest) {
      activeTestErrors = validateFields(activeTest);
      // Track unsaved changes - update immutably to trigger reactivity
      const hasChanges = hasTestChanged(activeTest);
      if (activeTest.hasUnsavedChanges !== hasChanges) {
        localTest.noCode = localTest.noCode.map((t) =>
          t.id === activeTest.id ? { ...t, hasUnsavedChanges: hasChanges } : t,
        );
        onTestsChange(localTest);
      }
    }
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
      `"${test.name}" is removed from your assertion list.`,
    );
    onTestsChange(localTest);
  };

  const clearTests = () => {
    localTest.noCode = [];
    notifications.success("All tests are removed from your list.");
    onTestsChange(localTest);
  };

  const handleConditionDropdown = (
    conditionItem: TestCaseConditionOperatorEnum,
    test,
  ) => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      condition: t.id === test.id ? conditionItem : t.condition,
    }));
    onTestsChange(localTest);
  };

  const handleTestTargetDropdown = (
    testTargetItem: TestCaseSelectionTypeEnum,
    test,
  ) => {
    // Define conditions that are not allowed for Time Consuming
    const timeConsumingInvalidConditions = [
      TestCaseConditionOperatorEnum.EXISTS,
      TestCaseConditionOperatorEnum.DOES_NOT_EXIST,
      TestCaseConditionOperatorEnum.CONTAINS,
      TestCaseConditionOperatorEnum.DOES_NOT_CONTAIN,
      TestCaseConditionOperatorEnum.IS_EMPTY,
      TestCaseConditionOperatorEnum.IS_NOT_EMPTY,
      TestCaseConditionOperatorEnum.IN_LIST,
      TestCaseConditionOperatorEnum.NOT_IN_LIST,
    ];

    localTest.noCode = localTest.noCode.map((t) => {
      if (t.id === test.id) {
        // Check if switching to Time Consuming and current condition is invalid
        const shouldResetCondition =
          testTargetItem === TestCaseSelectionTypeEnum.TIME_CONSUMING &&
          timeConsumingInvalidConditions.includes(t.condition);

        return {
          ...t,
          testTarget: testTargetItem,
          testPath: "",
          condition: shouldResetCondition ? "" : t.condition,
        };
      }
      return t;
    });
    onTestsChange(localTest);
  };

  const setByDefaultTestName = (test) => {
    localTest.noCode = localTest.noCode.map((t) => ({
      ...t,
      name: t.id === test.id ? `New Test` : t.name,
    }));
    onTestsChange(localTest);
  };

  // Handler for input field blur events
  const handleInputBlur = () => {
    onTestsChange(localTest);
  };

  let isDeletePopup = false;

  const isValidJsonPath = (path: string): boolean => {
    try {
      if (!path.startsWith("$") && !path.startsWith("@")) return false;
      JSONPath({ path, json: {} });
      return true;
    } catch {
      return false;
    }
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

<div
  class="d-flex flex-column w-100 h-100"
  style="position: relative;"
  id="request-tab-test"
>
  <div class="border rounded-top">
    <div class="d-flex align-items-center justify-content-between px-3 py-2">
      <p class="text-fs-12 mb-0 text-muted">Build tests using form fields</p>
    </div>
  </div>
  <div style="flex:1; overflow:auto;">
    <!-- Container -->
    <div class="border border-top-0 text-light p-2 h-100 rounded-bottom">
      {#if localTest.noCode.length === 0}
        <!-- Empty state -->
        <div
          class="d-flex flex-column align-items-center justify-content-center h-100"
          style="overflow: auto;"
        >
          <p class="w-50 text-muted text-center text-fs-14 mb-3">
            No test Added. Please click '+ Add Test' to create one. You can test
            status code, response time, body content, and more.
          </p>
          <Button
            startIcon={AddRegular}
            title={"Add Test"}
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
            class="h-100 d-flex flex-column"
            style="width: {tabSplitDirection === 'vertical'
              ? '100%'
              : '40%'}; overflow: hidden;"
          >
            <div class="pb-2" style="flex: 1; overflow-y: auto;">
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
            <div class="d-flex align-items-center pb-2 pt-2 gap-2">
              <Button
                startIcon={AddRegular}
                title={"Add Test"}
                type="primary"
                customWidth="100px"
                size="small"
                onClick={addTest}
              />
              {#if localTest.noCode.length > 1}
                <Button
                  title={"Remove All"}
                  startIcon={DeleteRegular}
                  type="secondary"
                  customWidth="100px"
                  size="small"
                  onClick={() => {
                    isDeletePopup = true;
                  }}
                />
              {/if}
            </div>
          </div>

          <!-- Right Form -->
          <div
            class="h-100 d-flex {tabSplitDirection === 'vertical'
              ? 'border-top pt-2'
              : 'border-start'}"
            style="width: {tabSplitDirection === 'vertical'
              ? '100%'
              : '60%'}; overflow: auto; flex-flow:wrap; align-content:flex-start; padding: 0 0 0 16px;"
          >
            {#if localTest.noCode.some((t) => t.isActive)}
              {#each localTest.noCode as test}
                {#if test.isActive}
                  <div
                    style="display: flex; flex-direction: column; gap: 1rem; width: 100%;"
                  >
                    <div style="width: 100%;">
                      <label class="form-label text-fs-12"
                        >Name <span style="color: var(--text-ds-danger-300)"
                          >*</span
                        ></label
                      >
                      <input
                        type="text"
                        class="form-control text-light"
                        style="border: {activeTestErrors.name
                          ? '1px solid var(--text-ds-danger-300)'
                          : ''}"
                        bind:value={test.name}
                        on:blur={() => {
                          if (!test.name) {
                            setByDefaultTestName(test);
                          } else {
                            handleInputBlur();
                          }
                        }}
                        placeholder="Enter Test Name"
                      />
                      {#if activeTestErrors.name}
                        <div
                          class="text-fs-10 mt-1"
                          style="color: var(--text-ds-danger-300)"
                        >
                          {activeTestErrors.name}
                        </div>
                      {/if}
                    </div>
                    <div style="width: 100%;">
                      <label class="form-label text-fs-12"
                        >Test Target <span
                          style="color: var(--text-ds-danger-300)">*</span
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
                    <div style="width: 100%;">
                      <label class="form-label text-fs-12"
                        >Condition <span
                          style="color: var(--text-ds-danger-300)">*</span
                        ></label
                      >
                      <WithSelectV4
                        id={"hdregtrgt89fhrbej"}
                        data={test.testTarget === "Time Consuming"
                          ? [
                              {
                                name: "Equals",
                                id: TestCaseConditionOperatorEnum.EQUALS,
                              },
                              {
                                name: "Not Equal",
                                id: TestCaseConditionOperatorEnum.NOT_EQUAL,
                              },

                              {
                                name: "Less Than",
                                id: TestCaseConditionOperatorEnum.LESS_THAN,
                              },
                              {
                                name: "Less Than Or Equal",
                                id: TestCaseConditionOperatorEnum.LESS_THAN_OR_EQUAL,
                              },
                              {
                                name: "Greater Than",
                                id: TestCaseConditionOperatorEnum.GREATER_THAN,
                              },
                              {
                                name: "Greater Than Or Equal",
                                id: TestCaseConditionOperatorEnum.GREATER_THAN_OR_EQUAL,
                              },
                            ]
                          : [
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
                      <div style="width: 100%;">
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
                          on:blur={handleInputBlur}
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
                          style="border: {activeTestErrors.testPath ||
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
                            !isValidHeaderKey(test.testPath))
                            ? '1px solid var(--text-ds-danger-300)'
                            : ''}"
                        />
                        {#if activeTestErrors.testPath}
                          <div
                            class="text-fs-10 mt-1"
                            style="color: var(--text-ds-danger-300)"
                          >
                            {activeTestErrors.testPath}
                          </div>
                        {:else if test.testPath && test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON}
                          {#if !isValidJsonPath(test.testPath)}
                            <div
                              class="text-fs-10 mt-1"
                              style="color: var(--text-ds-danger-300)"
                            >
                              Invalid path syntax. Please check your path
                              format.
                            </div>
                          {:else if !responseBody}
                            <div
                              class="text-fs-10 mt-1 d-flex"
                              style="color: var(--text-ds-neutral-300)"
                            >
                              <span class="me-1">
                                <InfoRegular
                                  size={"16px"}
                                  color={"var(--icon-ds-neutral-300)"}
                                />
                              </span>
                              <span class="">
                                Response not available. Path cannot be validated
                                yet.
                              </span>
                            </div>
                          {:else if getJsonPathValue(test.testPath, responseBody) || getJsonPathValue(test.testPath, responseBody) === 0 || getJsonPathValue(test.testPath, responseBody) === -0 || getJsonPathValue(test.testPath, responseBody) === ""}
                            <div
                              class="text-fs-12 d-flex mt-1 ellipsis text-muted"
                            >
                              <span class="me-1">
                                <CheckmarkCircleFilled
                                  size={"16px"}
                                  color={"var(--icon-ds-success-500)"}
                                />
                              </span>
                              <span
                                class="ellipsis"
                                style="color: var(--text-ds-neutral-300);"
                              >
                                Path valid. Sample value: {test.testPath}
                                = {getJsonPathValue(
                                  test.testPath,
                                  responseBody,
                                )}
                              </span>
                            </div>
                          {:else}
                            <div
                              class="text-fs-10 mt-1 d-flex"
                              style="color: var(--text-ds-neutral-300)"
                            >
                              <span class="me-1">
                                <InfoRegular
                                  size={"16px"}
                                  color={"var(--icon-ds-neutral-300)"}
                                />
                              </span>
                              <span>
                                Path is valid but value not found in response.
                              </span>
                            </div>
                          {/if}
                        {:else if test.testPath && test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                          {#if !isValidXPath(test.testPath)}
                            <div
                              class="text-fs-10 mt-1"
                              style="color: var(--text-ds-danger-300)"
                            >
                              Invalid path syntax. Please check your path
                              format.
                            </div>
                          {:else if !responseBody}
                            <div
                              class="text-fs-10 mt-1 d-flex"
                              style="color: var(--text-ds-neutral-300)"
                            >
                              <span class="me-1">
                                <InfoRegular
                                  size={"16px"}
                                  color={"var(--icon-ds-neutral-300)"}
                                />
                              </span>
                              <span>
                                Response not available. Path cannot be validated
                                yet.
                              </span>
                            </div>
                          {:else if getXPathValue(test.testPath, responseBody)}
                            <div
                              class="text-fs-12 d-flex mt-1 ellipsis text-muted"
                            >
                              <span class="me-1">
                                <CheckmarkCircleFilled
                                  size={"16px"}
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
                          {:else}
                            <div
                              class="text-fs-10 mt-1 d-flex"
                              style="color: var(--text-ds-neutral-300)"
                            >
                              <span class="me-1">
                                <InfoRegular
                                  size={"16px"}
                                  color={"var(--icon-ds-neutral-300)"}
                                />
                              </span>
                              <span>
                                Path is valid but value not found in response.
                              </span>
                            </div>
                          {/if}
                        {:else if test.testPath && test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER}
                          {#if !isValidHeaderKey(test.testPath)}
                            <div
                              class="text-fs-10 mt-1"
                              style="color: var(--text-ds-danger-300)"
                            >
                              Invalid path syntax. Please check your path
                              format.
                            </div>
                          {:else if !responseHeader}
                            <div
                              class="text-fs-10 mt-1 d-flex"
                              style="color: var(--text-ds-neutral-300)"
                            >
                              <span class="me-1">
                                <InfoRegular
                                  size={"16px"}
                                  color={"var(--icon-ds-neutral-300)"}
                                />
                              </span>
                              <span>
                                Response not available. Path cannot be validated
                                yet.
                              </span>
                            </div>
                          {:else if getHeaderPathValue(test.testPath, responseHeader)}
                            <div
                              class="text-fs-12 d-flex mt-1 ellipsis text-muted"
                            >
                              <span class="me-1">
                                <CheckmarkCircleFilled
                                  size={"16px"}
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
                          {:else}
                            <div
                              class="text-fs-10 mt-1 d-flex"
                              style="color: var(--text-ds-neutral-300)"
                            >
                              <span class="me-1">
                                <InfoRegular
                                  size={"16px"}
                                  color={"var(--icon-ds-neutral-300)"}
                                />
                              </span>
                              <span>
                                Path is valid but header not found in response.
                              </span>
                            </div>
                          {/if}
                        {/if}
                      </div>
                    {/if}
                    {#if test?.condition === TestCaseConditionOperatorEnum.EQUALS || test?.condition === TestCaseConditionOperatorEnum.NOT_EQUAL || test?.condition === TestCaseConditionOperatorEnum.EXISTS || test?.condition === TestCaseConditionOperatorEnum.DOES_NOT_EXIST || test?.condition === TestCaseConditionOperatorEnum.LESS_THAN || test?.condition === TestCaseConditionOperatorEnum.GREATER_THAN || test?.condition === TestCaseConditionOperatorEnum.CONTAINS || test?.condition === TestCaseConditionOperatorEnum.DOES_NOT_CONTAIN || test?.condition === TestCaseConditionOperatorEnum.IN_LIST || test?.condition === TestCaseConditionOperatorEnum.NOT_IN_LIST || test?.condition === TestCaseConditionOperatorEnum.GREATER_THAN_OR_EQUAL || test?.condition === TestCaseConditionOperatorEnum.LESS_THAN_OR_EQUAL}
                      <div style="width: 100%;">
                        <label class="form-label text-fs-12"
                          >Comparison Value <span
                            style="color: var(--text-ds-danger-300)">*</span
                          ></label
                        >
                        <input
                          type="text"
                          class="form-control text-light"
                          bind:value={test.expectedResult}
                          on:blur={handleInputBlur}
                          placeholder="Enter Comparison Value"
                          style="border: {activeTestErrors.expectedResult
                            ? '1px solid var(--text-ds-danger-300)'
                            : ''}"
                        />
                        {#if activeTestErrors.expectedResult}
                          <div
                            class="text-fs-10 mt-1"
                            style="color: var(--text-ds-danger-300)"
                          >
                            {activeTestErrors.expectedResult}
                          </div>
                        {/if}
                      </div>
                    {/if}
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
  </div>
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
