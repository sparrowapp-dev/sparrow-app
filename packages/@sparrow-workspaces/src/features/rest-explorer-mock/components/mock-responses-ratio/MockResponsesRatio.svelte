<script>
  import { NumberInput } from "@sparrow/common/components";
  import {
    CircleSmallFilled,
    ErrorCircleRegular,
  } from "@sparrow/library/icons";
  import { ProgressBar } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  export let isResponseRatioModalOpen;
  export let mockResponses;
  export let onUpdateResponseRatios;
  let inputValues = new Map();

  $: activeResponses = mockResponses.filter(
    (response) => response.mockRequestResponse.isMockResponseActive,
  );

  // Initialize input values when modal opens or responses change
  $: {
    if (activeResponses) {
      activeResponses.forEach((response) => {
        // Only set if not already set by user input
        if (!inputValues.has(response.id)) {
          inputValues.set(
            response.id,
            response.mockRequestResponse.responseWeightRatio,
          );
        }
      });
      calculateTotal();
    }
  }

  let totalPercentage = 0;
  let exceededLimit = false;
  let lastModifiedIndex = null;

  function handleChange(index, event) {
    const isEmpty = event.detail === "" || event.detail === null;
    const activeResponse = activeResponses[index];
    const responseId = activeResponse.id;

    const oldValue = Number(inputValues.get(responseId) || 0);

    const newNumericValue = isEmpty ? 0 : Number(event.detail);

    const potentialTotal = totalPercentage - oldValue + newNumericValue;
    inputValues.set(responseId, isEmpty ? null : newNumericValue);

    // Recalculate total
    calculateTotal();

    // Handle error state
    if (potentialTotal <= 100) {
      exceededLimit = false;
      lastModifiedIndex = null;
    } else {
      exceededLimit = true;
      lastModifiedIndex = index;
    }
  }

  // Calculate total from input values
  function calculateTotal() {
    totalPercentage = 0;

    activeResponses.forEach((response) => {
      const value = inputValues.get(response.id);
      totalPercentage +=
        value === null || value === undefined || value === ""
          ? 0
          : Number(value);
    });
  }

  // Calculate total when component mounts
  onMount(() => {
    activeResponses.forEach((response) => {
      inputValues.set(
        response.id,
        response.mockRequestResponse.responseWeightRatio,
      );
    });
    calculateTotal();
  });
</script>

<div class="d-flex flex-column" style="gap: 24px">
  <div class="text-ds-font-size-14" style="color: var(--text-ds-neutral-100);">
    Assign weights to simulate real-world response scenarios. The higher the
    ratio, the more frequently that response is returned. Total must equal 100%.
  </div>
  <div class="d-flex flex-column" style="gap: 24px">
    <div
      class="d-flex justify-content-between text-ds-font-size-14"
      style="gap: 16px; color: var(--text-ds-neutral-100);"
    >
      <span style="padding-left: 50px;">Responses</span>
      <span style="padding-right: 100px;">Ratios (%)</span>
    </div>
    <div class="response-list">
      {#each activeResponses as response, index}
        <div
          class="d-flex flex-row justify-content-between align-items-center"
          style="gap: 8px"
        >
          <div class="d-flex">
            <span style="display: flex; margin-right:4px;">
              <CircleSmallFilled color="var( --icon-ds-success-400)" />
            </span>
            <div
              class="api-method"
              style="font-size: 9px; color: {response?.mockRequestResponse
                ?.responseStatus >= 200 &&
              response?.mockRequestResponse?.responseStatus < 400
                ? 'var(--text-ds-success-300)'
                : response?.mockRequestResponse?.responseStatus
                  ? 'var(--text-ds-danger-300)'
                  : 'var(--text-ds-neutral-50)'};"
            >
              {response?.mockRequestResponse?.responseStatus
                ? response.mockRequestResponse.responseStatus
                : "-"}
            </div>

            <div
              class="api-name ellipsis"
              style="color: var(--bg-ds-neutral-50);"
            >
              <p
                class="ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
              >
                {response.name}
              </p>
            </div>
          </div>
          <div class="input-container">
            <NumberInput
              value={inputValues.get(response.id)}
              min={0}
              max={100}
              step={1}
              placeholder="Enter ratio (0-100)"
              on:change={(event) => handleChange(index, event)}
              on:input={(event) => handleChange(index, event)}
              variant="primary"
              size="medium"
              isError={exceededLimit && lastModifiedIndex === index}
            />

            {#if exceededLimit && lastModifiedIndex === index}
              <div
                class="d-flex align-items-start
              input-error-message"
                style="gap: 1px"
              >
                <span class="error-icon">
                  <ErrorCircleRegular
                    size={"14px"}
                    color={"var(--icon-ds-danger-300)"}
                  />
                </span>
                Total exceeds 100%. Adjust the values to make the total 100% or less.
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="d-flex justify-content-between" style="gap: 16px">
    <div class="d-flex align-items-center" style="width: 35%">
      <span class="text-ds-font-size-14 text-ds-font-weight-medium">
        <span style="color: var(--text-ds-neutral-400);">Total Assigned:</span>
        {totalPercentage}%
      </span>
    </div>
    <div class="d-flex flex-column w-100">
      <ProgressBar percentage={totalPercentage} isExceeded={exceededLimit} />
      <div class="d-flex justify-content-end">
        <span
          class="text-ds-font-size-14 text-ds-font-weight-medium"
          style="color: var(--text-ds-neutral-400);"
        >
          100%
        </span>
      </div>
    </div>
  </div>
  <div class="d-flex justify-content-end">
    <Button
      title={"Cancel"}
      textStyleProp={"font-size: 14px"}
      buttonClassProp={"me-2"}
      buttonStyleProp={"height: 36px;"}
      type={"secondary"}
      onClick={() => {
        isResponseRatioModalOpen = false;
      }}
    />
    <Button
      title={"Save"}
      textStyleProp={"font-size: 14px"}
      type={"primary"}
      buttonStyleProp={"height: 36px;"}
      onClick={() => {
        if (!exceededLimit) {
          const ratiosToUpdate = activeResponses.map((response) => ({
            mockResponseId: response.id,
            responseWeightRatio: inputValues.get(response.id) || 0,
          }));
          onUpdateResponseRatios(ratiosToUpdate);

          isResponseRatioModalOpen = false;
        }
      }}
      disable={exceededLimit}
    />
  </div>
</div>

<style>
  .response-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 170px;
    padding-right: 8px;
    overflow-y: auto;
  }
  .api-method {
    font-size: 9px;
    font-weight: 500;
    width: 24px !important;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .api-name {
    height: 24px;
    line-height: 18px;
    font-weight: 500;
    width: 150px;
    text-align: left;
    display: flex;
    align-items: center;

    padding: 2px 4px;
    caret-color: var(--bg-ds-primary-300);
  }

  .input-container {
    display: flex;
    flex-direction: column;
    width: 250px;
  }

  .input-error-message {
    color: var(--text-ds-danger-300);
    font-size: 12px;
    margin-top: 2px;
    text-align: left;
    width: 100%;
    white-space: normal;
    overflow-wrap: break-word;
  }

  .error-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-top: 2.5px;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
