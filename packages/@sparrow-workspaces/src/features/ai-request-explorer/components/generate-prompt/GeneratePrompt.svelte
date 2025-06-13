<script lang="ts">
  import { Alert, Button, notifications } from "@sparrow/library/ui";
  import { Textarea } from "@sparrow/library/forms";
  import { createEventDispatcher } from "svelte";

  // Props
  export let generatePromptTarget: "UserPrompt" | "SystemPrompt" | "None" =
    "None";
  export let onGenerateAiPrompt: (
    target: string,
    prompt: string,
  ) => Promise<any>;
  export let onHandleInsertPrompt: (
    target: string,
    response: string,
  ) => Promise<void>;

  // Event dispatcher for parent communication
  const dispatch = createEventDispatcher<{
    close: void;
    insert: { target: string; response: string };
  }>();

  // Component state
  let userPromptExpectation = "";
  let aiPromptQueryResponse = "";
  let isPromptGenerating = false;
  let insertBtnLoader = false;
  let isSparrowAiLimitReached = false;
  let isErrorWhileGeneratePrompt = false;
  let errorMsgForGeneratePrompt = "";

  // Computed properties
  $: isUserPromptEmpty = !userPromptExpectation.trim().length;
  $: isAiResponseEmpty = !aiPromptQueryResponse.trim().length;
  $: isAnyActionInProgress = isPromptGenerating || insertBtnLoader;
  $: generateButtonTitle = aiPromptQueryResponse.length
    ? "Regenerate Response"
    : "Generate Response";

  // Methods
  const resetState = (): void => {
    userPromptExpectation = "";
    aiPromptQueryResponse = "";
    isPromptGenerating = false;
    insertBtnLoader = false;
    isSparrowAiLimitReached = false;
    isErrorWhileGeneratePrompt = false;
    errorMsgForGeneratePrompt = "";
  };

  const handleCancel = (): void => {
    resetState();
    dispatch("close");
  };

  const handleGenerateResponse = async (): Promise<void> => {
    if (isUserPromptEmpty) return;

    isPromptGenerating = true;
    isErrorWhileGeneratePrompt = false;
    errorMsgForGeneratePrompt = "";

    try {
      const response = await onGenerateAiPrompt(
        generatePromptTarget,
        userPromptExpectation,
      );

      if (response.successStatus) {
        aiPromptQueryResponse = response.aiGeneratedPrompt;
        isSparrowAiLimitReached = false;
      } else if (response.isLimitReached) {
        isSparrowAiLimitReached = true;
      } else {
        isErrorWhileGeneratePrompt = true;
        errorMsgForGeneratePrompt =
          response.message || "Unknown error occurred";
        notifications.error(
          "Something went wrong while prompt generation. Please try again",
        );
      }
    } catch (error) {
      isErrorWhileGeneratePrompt = true;
      errorMsgForGeneratePrompt = "Network error or unexpected failure";
      notifications.error(
        "Something went wrong while prompt generation. Please try again",
      );
    } finally {
      isPromptGenerating = false;
    }
  };

  const handleInsertPrompt = async (): Promise<void> => {
    if (isAiResponseEmpty) return;

    insertBtnLoader = true;

    try {
      await onHandleInsertPrompt(generatePromptTarget, aiPromptQueryResponse);

      // Dispatch insert event with data
      dispatch("insert", {
        target: generatePromptTarget,
        response: aiPromptQueryResponse,
      });

      // Reset state and close modal
      resetState();
      dispatch("close");
    } catch (error) {
      notifications.error("Failed to insert prompt. Please try again.");
    } finally {
      insertBtnLoader = false;
    }
  };

  // Lifecycle - reset state when target changes
  $: if (generatePromptTarget) {
    // Only reset if this is a fresh modal opening
    if (generatePromptTarget !== "None") {
      userPromptExpectation = "";
      aiPromptQueryResponse = "";
      isPromptGenerating = false;
      isSparrowAiLimitReached = false;
    }
  }
</script>

<!-- Description Text -->
<div class="mb-4">
  <p
    class="text-muted mb-0 text-ds-font-size-14 text-ds-font-weight-medium text-ds-line-height-130"
  >
    Describe your task or goal to generate a suitable {generatePromptTarget ===
    "UserPrompt"
      ? "user"
      : "system"} prompt.
  </p>
</div>

<!-- Two Column Layout -->
<div class="row g-3 {isSparrowAiLimitReached ? 'mb-2' : 'mb-4'}">
  <!-- Left Column - Your Message -->
  <div class="col-6">
    <div class="d-flex flex-column h-100">
      <label
        class="form-label mb-2 text-ds-font-size-12 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-200);"
        for="user-prompt-textarea"
      >
        Your Message
      </label>
      <Textarea
        id="user-prompt-textarea"
        bind:value={userPromptExpectation}
        placeholder="Describe your task..."
        height="150px"
        defaultBorderColor="transparent"
        hoveredBorderColor="var(--border-ds-neutral-300)"
        focusedBorderColor="var(--border-ds-primary-300)"
        class="text-ds-font-size-12 bg-tertiary-300 text-ds-font-weight-medium p-2 border-radius-4 flex-grow-1"
        style="outline:none; resize: none; min-height: 150px;"
        disabled={isAnyActionInProgress}
        maxlength={1000}
        placeholderColor="var(--text-secondary-200)"
      />
    </div>
  </div>

  <!-- Right Column - Generated Response -->
  <div class="col-6">
    <div class="d-flex flex-column h-100">
      <label
        class="form-label mb-2 text-ds-font-size-12 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-200);"
        for="ai-response-textarea"
      >
        Generated Response
      </label>
      <Textarea
        id="ai-response-textarea"
        bind:value={aiPromptQueryResponse}
        placeholder="Your response will be generated here"
        height="150px"
        defaultBorderColor="transparent"
        hoveredBorderColor="var(--border-ds-neutral-300)"
        focusedBorderColor="var(--border-ds-primary-300)"
        class="text-ds-font-size-12 bg-tertiary-300 text-ds-font-weight-medium p-2 border-radius-4 flex-grow-1"
        style="outline:none; resize: none; min-height: 150px;"
        disabled={isAnyActionInProgress}
        maxlength={1000}
        placeholderColor="var(--text-secondary-200)"
      />
    </div>
  </div>
</div>

<!-- Alert for limit reached -->
{#if isSparrowAiLimitReached}
  <div class="mb-4">
    <Alert
      heading="Generate Prompt Monthly Limit Reached"
      description="You've hit your monthly usage limit for generate prompt. You can resume next month or explore our discord community for feedback and discussions. Thanks for understanding!"
      varient="info"
      ctaShow={false}
      containerWidth="100%"
      closeIconRequired={false}
      onClickClose={() => {}}
    />
  </div>
{/if}

<!-- Action Buttons -->
<div class="d-flex justify-content-between gap-2 mt-2 w-100">
  <Button
    title={generateButtonTitle}
    size="medium"
    customWidth="160px"
    type="outline-secondary"
    loader={isPromptGenerating}
    disable={isUserPromptEmpty || isSparrowAiLimitReached}
    onClick={handleGenerateResponse}
  />

  <div class="d-flex align-items-center gap-2">
    <Button
      title="Cancel"
      size="medium"
      type="secondary"
      customWidth="100px"
      disable={isAnyActionInProgress}
      onClick={handleCancel}
    />
    <Button
      title="Insert"
      size="medium"
      type="primary"
      customWidth="100px"
      disable={isAnyActionInProgress || isAiResponseEmpty}
      loader={insertBtnLoader}
      onClick={handleInsertPrompt}
    />
  </div>
</div>
