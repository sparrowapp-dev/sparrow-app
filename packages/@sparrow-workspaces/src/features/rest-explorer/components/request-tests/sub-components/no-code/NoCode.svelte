<script lang="ts">
  import {
    TestCaseConditionOperatorEnum,
    TestCaseSelectionTypeEnum,
  } from "@sparrow/common/types/workspace";
  import TestListItem from "./sub-components/test-list-item/TestListItem.svelte";
  import { WithSelectV4 } from "../../../../../../hoc";
  import { Button } from "@sparrow/library/ui";

  export let tests;
  export let onTestsChange;

  const localTest = tests;

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
      condition: TestCaseConditionOperatorEnum.EQUALS,
      expectedResult: "",
      testPath: "$.path",
      testTarget: TestCaseSelectionTypeEnum.RESPONSE_JSON,
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
    // onTestsChange(localTest);
  };

  const clearTests = () => {
    localTest.noCode = [];
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
    }));
  };
</script>

<!-- Container -->
<div class="border border-top-0 text-light p-2 h-100 rounded-bottom">
  {#if localTest.noCode.length === 0}
    <!-- Empty state -->
    <div
      class="d-flex flex-column align-items-center justify-content-center py-5"
    >
      <p class="w-50 text-muted text-center text-fs-14 mb-3">
        No test Added. Please click ‘+ Add Test’ to create one. You can test
        status code, response time, body content, and more.
      </p>
      <Button
        title={"+ Add Tests"}
        type="primary"
        size="md"
        onClick={addTest}
      />
    </div>
  {:else}
    <!-- Main layout -->
    <div class="d-flex h-100">
      <!-- Left Sidebar -->
      <div class="h-100" style="width: 25%; overflow: auto;">
        <div class="pb-2">
          {#each localTest.noCode as test, index}
            <TestListItem
              {test}
              {selectTest}
              {deleteTest}
              {duplicateTest}
              {index}
            />
          {/each}
        </div>

        <div class="d-flex gap-2" style="flex-wrap:wrap;">
          <div class="">
            <Button
              title={"+ Add Tests"}
              type="primary"
              size="md"
              onClick={addTest}
            />
          </div>
          <div class="">
            <Button
              title={"Clear All"}
              type="secondary"
              size="md"
              onClick={clearTests}
            />
          </div>
        </div>
      </div>

      <!-- Right Form -->
      <div
        class="h-100 d-flex border-start ms-2 ps-2"
        style="width: 75%; overflow: auto; flex-flow:wrap; align-content:flex-start;"
      >
        {#if localTest.noCode.some((t) => t.isActive)}
          {#each localTest.noCode as test}
            {#if test.isActive}
              <div class="px-2 pb-2 w-50">
                <label class="form-label text-fs-12"
                  >Name <span style="color: var(--text-ds-danger-300)">*</span
                  ></label
                >
                <input
                  type="text"
                  class="form-control text-light"
                  bind:value={test.name}
                />
              </div>

              <div class="px-2 pb-2 w-50">
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
                  zIndex={499}
                  disabled={false}
                />
              </div>

              <div class="px-2 pb-2 w-50">
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
                  zIndex={499}
                  disabled={false}
                />
              </div>

              {#if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER || test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON || test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                <div class="px-2 pb-2 w-50">
                  <label class="form-label text-fs-12">
                    {#if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_HEADER}
                      Header
                    {:else if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_JSON}
                      JSON
                    {:else if test?.testTarget === TestCaseSelectionTypeEnum.RESPONSE_XML}
                      XML
                    {/if}

                    Path

                    <span style="color: var(--text-ds-danger-300)">*</span
                    ></label
                  >
                  <input
                    type="text"
                    class="form-control text-light"
                    bind:value={test.testPath}
                  />
                  <small class="text-success"
                    >✔ Path valid. Example: {test.testPath}</small
                  >
                </div>
              {/if}

              <div class="px-2 pb-2 w-50">
                <label class="form-label text-fs-12"
                  >Expected Value <span style="color: var(--text-ds-danger-300)"
                    >*</span
                  ></label
                >
                <input
                  type="text"
                  class="form-control text-light"
                  bind:value={test.expectedResult}
                />
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
  }
</style>
