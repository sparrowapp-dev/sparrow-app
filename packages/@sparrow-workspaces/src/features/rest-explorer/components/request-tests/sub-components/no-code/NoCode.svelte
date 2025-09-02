<script>
  import {
    TestCaseConditionOperatorEnum,
    TestCaseSelectionTypeEnum,
  } from "@sparrow/common/types/workspace";
  import TestListItem from "./sub-components/test-list-item/TestListItem.svelte";

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
</script>

<!-- Container -->
<div class="border bg-dark text-light p-3 rounded">
  {#if localTest.noCode.length === 0}
    <!-- Empty state -->
    <div
      class="d-flex flex-column align-items-center justify-content-center py-5"
    >
      <p class="text-muted text-center mb-3">
        No test Added. Please click <b>‘+ Add Test’</b> to create one. You can test
        status code, response time, body content, and more.
      </p>
      <button class="btn btn-primary btn-sm" on:click={addTest}
        >+ Add Tests</button
      >
    </div>
  {:else}
    <!-- Main layout -->
    <div class="d-flex">
      <!-- Left Sidebar -->
      <div class="me-3" style="min-width: 220px;">
        {#each localTest.noCode as test}
          <TestListItem {test} {selectTest} {deleteTest} {duplicateTest} />
        {/each}

        <div class="mt-3">
          <button class="btn btn-primary btn-sm me-2" on:click={addTest}
            >+ Add Tests</button
          >
          <button class="btn btn-outline-light btn-sm" on:click={clearTests}
            >Clear All</button
          >
        </div>
      </div>

      <!-- Right Form -->
      <div class="flex-grow-1 p-3 border-start">
        {#if localTest.noCode.some((t) => t.isActive)}
          {#each localTest.noCode as test}
            {#if test.isActive}
              <div class="mb-3">
                <label class="form-label">Name *</label>
                <input
                  type="text"
                  class="form-control bg-dark text-light"
                  bind:value={test.name}
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Test Target *</label>
                <select
                  class="form-select bg-dark text-light"
                  bind:value={test.testTarget}
                >
                  <option value={TestCaseSelectionTypeEnum.RESPONSE_JSON}
                    >Response JSON</option
                  >
                  <option value={TestCaseSelectionTypeEnum.RESPONSE_TEXT}
                    >Response Text</option
                  >
                  <option value={TestCaseSelectionTypeEnum.RESPONSE_HEADER}
                    >Response Header</option
                  >
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Condition *</label>
                <select
                  class="form-select bg-dark text-light"
                  bind:value={test.condition}
                >
                  <option value={TestCaseConditionOperatorEnum.EQUALS}
                    >Equals</option
                  >
                  <option value={TestCaseConditionOperatorEnum.CONTAINS}
                    >Contains</option
                  >
                  <option value={TestCaseConditionOperatorEnum.DOES_NOT_EXIST}
                    >Does Not Exist</option
                  >
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">JSON Path *</label>
                <input
                  type="text"
                  class="form-control bg-dark text-light"
                  bind:value={test.testPath}
                />
                <small class="text-success"
                  >✔ Path valid. Example: {test.testPath}</small
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Expected Value *</label>
                <input
                  type="text"
                  class="form-control bg-dark text-light"
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
  .selected {
    border: 1px solid #0d6efd;
    background-color: #2a2a2a !important;
  }
</style>
