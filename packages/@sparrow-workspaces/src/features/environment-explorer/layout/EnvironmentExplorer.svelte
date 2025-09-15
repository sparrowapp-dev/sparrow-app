<script lang="ts">
  import { HelpIcon, SaveIcon } from "@sparrow/library/assets";
  import { onMount, onDestroy } from "svelte";
  import type { EnvValuePair } from "@sparrow/common/interfaces/request.interface";
  import { QuickHelp } from "../components";
  import { Search } from "@sparrow/library/forms";
  import {
    hasWorkpaceLevelPermission,
    SetDataStructure,
  } from "@sparrow/common/utils";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@sparrow/common/constants/permissions.constant";
  import { Button, Tooltip } from "@sparrow/library/ui";

  import { TabularInputV2 } from "@sparrow/workspaces/components";
  import { Input } from "@sparrow/library/forms";
  import { Carousel, Modal, Popover } from "@sparrow/library/ui";
  import { environmentType, WorkspaceRole } from "@sparrow/common/enums";
  import {
    CreateENV,
    IntroToEnvironment,
    SearchVariable,
  } from "@sparrow/workspaces/constants";
  import { WithButtonV3 } from "@sparrow/workspaces/hoc";
  import { SaveRegular } from "@sparrow/library/icons";
  import { QuestionCirlceReqular } from "@sparrow/library/icons";
  import { GenerateVariables } from "../../generate-variables";
  import type { KeyValuePair } from "@sparrow/common/interfaces/request.interface";
  import { Loader } from "@sparrow/library/ui";
  import ApplyGeneratedVariables from "../components/apply-generated-variables/ApplyGeneratedVariables.svelte";
  import { generatedVariableDemo, generateVariableStep } from "../../../stores";
  import GenerateVariableTourGuide from "../../generate-variables-tour-guide/layout/GenerateVariableTourGuide.svelte";
  import GenerateVariableGuideCard from "../../generate-variables-tour-guide/components/GenerateVariableGuideCard.svelte";
  import { GenerateVariableTourContent } from "../../generate-variables-tour-guide/utils";
  export let azureBlobCDN;
  /**
   * selected environmet to be shown on API
   */
  export let currentEnvironment;
  /**
   * updates the environment name
   */
  export let onUpdateName;
  /**
   * updates the environment variables
   */
  export let onUpdateVariable;
  /**
   * saves the environment
   */
  export let onSaveEnvironment;

  export let onFetchEnvironmentGuide: (query) => void;
  export let onUpdateEnvironmentGuide: (query, isActive) => void;
  export let updateGeneratedVariables: (
    globalPairs: { key: string; value: string }[],
    updatedPairs: { key: string; value: string }[],
  ) => void;
  export let onUpdateVariableSelection;
  export let userRole;
  export let handleRedirectToDocs: () => {};
  export let generateVariableDemoCompleted: () => void;
  export let isWebApp;

  let isPopoverContainer = false;

  let quickHelp: boolean = false;
  let search = "";
  let environmentName = "";

  $: {
    if ($currentEnvironment) {
      environmentName = $currentEnvironment?.name || "";
    }
  }

  const handleCurrentEnvironmentNameChange = (_name, event) => {
    onUpdateName(_name, event);
  };

  const closeEnvHelpText = () => {
    onUpdateEnvironmentGuide({ id: "environment-guide" }, false);
    isPopoverContainer = !isPopoverContainer;
  };

  const handleCurrentEnvironmentKeyValuePairChange = (
    pairs: EnvValuePair[],
  ) => {
    onUpdateVariable(pairs);
  };

  let isGuidePopup = false;
  let isApplyAiVariablesModalOpen = false;
  const dummyVariables = [
    {
      key: "API_BASE_URL",
      value: "https://api.demoapp.com",
      checked: true,
    },
    {
      key: "AUTH_TOKEN",
      value: "Bearer 12345abcdef",
      checked: true,
    },
    {
      key: "ENV",
      value: "development",
      checked: true,
    },
    {
      key: "MAX_RETRIES",
      value: "3",
      checked: true,
    },
    {
      key: "LOG_LEVEL",
      value: "debug",
      checked: true,
    },
    {
      key: "",
      value: "",
      checked: false,
    },
  ];

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      const canSave = !(
        $currentEnvironment?.property?.environment?.state?.isSaveInProgress ||
        $currentEnvironment?.isSaved ||
        userRole === WorkspaceRole.WORKSPACE_VIEWER
      );

      if (canSave && $currentEnvironment?.tabId) {
        onSaveEnvironment();
      }
    }
  };

  const handleCloseTourGuide = () => {
    generatedVariableDemo.set(false);
    generateVariableStep.set(0);
  };

  onMount(async () => {
    const event = await onFetchEnvironmentGuide({
      id: "environment-guide",
    });
    if (event?.isActive === true) {
      isPopoverContainer = true;
    } else {
      isPopoverContainer = false;
    }
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

{#if $currentEnvironment?.tabId}
  <div class="h-100 env-panel d-flex">
    <div
      class="d-flex flex-column h-100 env-parent p-3 w-100 {quickHelp
        ? 'quick-help-active'
        : ''}"
    >
      <div class="env-body d-flex flex-column" style="flex: 1; min-height: 0;">
        <!-- Top Section: Header + TabularInput -->
        <div
          class="var-value-container d-flex flex-column"
          style="flex: 1; min-height: 0; position:relative;"
          id="environment-explorer-variable-section"
        >
          <header
            class="env-header align-items-start justify-content-between d-flex gap-4"
            style="position: relative;"
          >
            {#if $currentEnvironment?.property?.environment?.type === environmentType.GLOBAL}
              <button
                class="btn p-0"
                style="position: absolute; left:133px;  top:5px; border:none; z-index:5; cursor:pointer;"
                on:click={() => {
                  isPopoverContainer = !isPopoverContainer;
                  onUpdateEnvironmentGuide(
                    { id: "environment-guide" },
                    isPopoverContainer,
                  );
                }}
              >
                <HelpIcon height={"12.67px"} width={"12.67px"} />
              </button>
            {/if}

            <Input
              type={"text"}
              size={"medium"}
              maxlength={500}
              id={"environment-name"}
              bind:value={environmentName}
              variant={"inline"}
              placeholder={""}
              style="min-width: 200px; max-width: 400px;"
              disabled={$currentEnvironment?.property?.environment?.type ==
                "GLOBAL" || userRole === WorkspaceRole.WORKSPACE_VIEWER}
              on:input={() =>
                handleCurrentEnvironmentNameChange(environmentName, "")}
              on:blur={() =>
                handleCurrentEnvironmentNameChange(environmentName, "blur")}
            />

            <div class="d-flex env-btn-container" style="gap: 6px;">
              <div class="position-relative">
                <Search
                  id={"environment-search"}
                  variant={"primary"}
                  size={"medium"}
                  bind:value={search}
                  on:input={() => {}}
                  customWidth={"220px"}
                  placeholder="Search"
                />
              </div>

              {#if !(userRole === WorkspaceRole.WORKSPACE_VIEWER)}
                <div class="position-relative">
                  <Tooltip
                    title="Save (Ctrl+S)"
                    placement="bottom-center"
                    distance={10}
                  >
                    {#if $generateVariableStep === 5}
                      <Button
                        type="primary"
                        startIcon={SaveRegular}
                        onClick={() => {}}
                        title="Save"
                        size="medium"
                        disable={false}
                      />
                    {:else}
                      <Button
                        type="primary"
                        startIcon={SaveRegular}
                        onClick={() => {
                          const aiGeneratedVariables =
                            $currentEnvironment.property.environment.variable.filter(
                              (variable) => variable.lifespan === "short",
                            );

                          const uniqueAiGeneratedVariables =
                            new SetDataStructure().pushArrayOfObjects(
                              aiGeneratedVariables,
                              "value",
                            );

                          if (uniqueAiGeneratedVariables.length > 0) {
                            isApplyAiVariablesModalOpen = true;
                          } else {
                            onSaveEnvironment();
                          }
                        }}
                        title="Save"
                        size="medium"
                        disable={$currentEnvironment?.property?.environment
                          ?.state?.isSaveInProgress ||
                          $currentEnvironment?.isSaved ||
                          userRole === WorkspaceRole.WORKSPACE_VIEWER}
                        loader={$currentEnvironment?.property?.environment
                          ?.state?.isSaveInProgress}
                      />
                    {/if}
                  </Tooltip>
                </div>
              {/if}

              <Tooltip title="Help" placement="bottom-center" distance={10}>
                <Button
                  type="secondary"
                  startIcon={QuestionCirlceReqular}
                  size="medium"
                  customWidth="28px"
                  onClick={() => {
                    quickHelp = true;
                  }}
                  disable={false}
                  loader={false}
                />
              </Tooltip>
            </div>
          </header>

          <div class="env-heading-popup" style="margin-bottom: 4px;">
            {#if isPopoverContainer && $currentEnvironment?.property?.environment?.type === environmentType.GLOBAL}
              <Popover
                heading="Welcome to Environments!"
                text=""
                onClose={closeEnvHelpText}
              >
                <p style="font-size: 12px;">
                  Environments allow you to manage different sets of
                  configuration variables for various stages of your application
                  (e.g. Development, Staging, Production). This helps in
                  organizing and isolating settings, making testing and
                  deployment easier and more efficient.
                  <span
                    on:click={() => {
                      isGuidePopup = true;
                    }}
                    class="link btn p-0 border-0"
                    style="font-size: 12px;">See how it works.</span
                  >
                </p>
              </Popover>
            {/if}
          </div>

          {#if $generatedVariableDemo}
            <div
              class="tabular-section"
              style="flex: 1; min-height: 0; overflow: auto;"
            >
              <TabularInputV2
                disabled={false}
                keyValue={dummyVariables}
                callback={() => {}}
                {search}
              />
            </div>
          {:else}
            <div
              class="tabular-section"
              style="flex: 1; min-height: 0; overflow: auto;"
            >
              <TabularInputV2
                disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
                keyValue={$currentEnvironment?.property?.environment?.variable}
                callback={handleCurrentEnvironmentKeyValuePairChange}
                {search}
                {onUpdateVariableSelection}
              />
            </div>
          {/if}
          {#if $generatedVariableDemo && $generateVariableStep === 1}
            <GenerateVariableGuideCard
              titleName={GenerateVariableTourContent[0].Title}
              descriptionContent={GenerateVariableTourContent[0].description}
              cardNumber={$generateVariableStep}
              totalsCards={5}
              top={15}
              left={200}
              onNext={() => {
                generateVariableStep.set(2);
              }}
              placement="left"
              onClose={handleCloseTourGuide}
            />
          {/if}
          {#if $generatedVariableDemo && $generateVariableStep === 5}
            <GenerateVariableGuideCard
              titleName={GenerateVariableTourContent[4].Title}
              descriptionContent={GenerateVariableTourContent[4].description}
              cardNumber={$generateVariableStep}
              totalsCards={5}
              top={40}
              right={40}
              rightButtonName={"Finish"}
              onNext={async () => {
                await generateVariableDemoCompleted();
                handleCloseTourGuide();
              }}
              placement={"right"}
              onClose={handleCloseTourGuide}
            />
          {/if}
        </div>

        <!-- Optional Bottom Section -->
        {#if $currentEnvironment?.property.environment.generateVariable}
          <!-- Divider -->
          <div
            class="env-divider"
            style="height: 1px; background: var(--border-ds-surface-100); margin: 8px 0;"
          ></div>

          <!-- Generate Variable Section -->
          <div
            class="generate-variable-container"
            style="flex: 1; min-height: 0; overflow: auto; position:relative;"
            id="generate-variable-bottom-panel"
          >
            <GenerateVariables
              currentEnvironment={$currentEnvironment}
              generatedVariables={$currentEnvironment?.property?.environment
                ?.aiVariable}
              aiGenerationStatus={$currentEnvironment?.property?.environment
                ?.aiGenerationStatus}
              {updateGeneratedVariables}
              {onUpdateVariableSelection}
              {handleRedirectToDocs}
              {handleCloseTourGuide}
              {isWebApp}
            />
            <div>
              {#if $generatedVariableDemo && $generateVariableStep === 3}
                <GenerateVariableGuideCard
                  titleName={GenerateVariableTourContent[2].Title}
                  descriptionContent={GenerateVariableTourContent[2]
                    .description}
                  cardNumber={$generateVariableStep}
                  totalsCards={5}
                  top={110}
                  right={0}
                  onNext={() => {
                    generateVariableStep.set(4);
                  }}
                  placement={"right"}
                  onClose={handleCloseTourGuide}
                />
              {/if}
              {#if $generatedVariableDemo && $generateVariableStep === 4}
                <GenerateVariableGuideCard
                  titleName={GenerateVariableTourContent[3].Title}
                  cardNumber={$generateVariableStep}
                  totalsCards={5}
                  top={150}
                  right={0}
                  onNext={() => {
                    generateVariableStep.set(5);
                  }}
                  placement={"right"}
                  onClose={handleCloseTourGuide}
                >
                  <div slot="description-content">
                    You can also manage suggestions one-by-one. Use the <span
                      class=""
                      style="color: var(--icon-ds-success-300);">✓</span
                    >
                    icon to accept a single variable, or the
                    <span class="" style="color: var(--icon-ds-danger-300);"
                      >✗</span
                    > icon to remove suggestion.
                  </div>
                </GenerateVariableGuideCard>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>

    {#if quickHelp}
      <div class="quick-help h-100">
        <QuickHelp
          closeQuickHelp={() => {
            quickHelp = false;
          }}
        />
      </div>
    {/if}
  </div>
{/if}

<GenerateVariableTourGuide />

<!--Disabling the Quick Help feature, will be taken up in next release-->
<Modal
  title={""}
  type={"dark"}
  width={"474px"}
  zIndex={10000}
  isOpen={isApplyAiVariablesModalOpen}
  handleModalState={(flag = false) => {
    isApplyAiVariablesModalOpen = flag;
  }}
  canClose={false}
>
  <div style="position: relative;">
    <ApplyGeneratedVariables
      collectionName={$currentEnvironment?.property?.environment
        ?.generateProperty.collectionName || ""}
      onSaveApplyVariableFlow={async () => {
        await onSaveEnvironment();
        isApplyAiVariablesModalOpen = false;
      }}
      onCancelApplyVariableFlow={() => {
        isApplyAiVariablesModalOpen = false;
      }}
      totalAiGeneratedVariablesCount={$currentEnvironment?.property?.environment
        ?.variable?.length || 0}
      applyingAiGeneratedVariablesCount={$currentEnvironment?.property?.environment?.variable?.filter(
        (variable) => variable.lifespan === "short",
      )?.length || 0}
    />
  </div>
</Modal>

<Modal
  title={""}
  type={"dark"}
  width={"474px"}
  zIndex={10000}
  isOpen={isGuidePopup}
  handleModalState={(flag = false) => {
    isGuidePopup = flag;
  }}
>
  <div style="position: relative;">
    <Carousel
      data={[
        {
          id: 1,
          heading: "Step  1: Introduction to Environment",
          subheading:
            "Environments allow you to manage configuration variables for different stages of your application, such as development, staging, and production.",
          gif: `${azureBlobCDN}${IntroToEnvironment}`,
        },
        {
          id: 2,
          heading: "Step  2: Creating a New Environment",
          subheading:
            "Creating a new environment is simple. Follow these steps to set up an environment tailored to your needs.",
          gif: `${azureBlobCDN}${CreateENV}`,
        },
        {
          id: 3,
          heading: "Step 3: Search and apply Environment Variables",
          subheading:
            "Easily search and apply variables from global or selected environment in the REST API tool, to streamline your API testing process.",
          gif: `${azureBlobCDN}${SearchVariable}`,
        },
      ]}
      handleClosePopup={(flag = false) => {
        isGuidePopup = flag;
      }}
    />
  </div>
</Modal>

<style lang="scss">
  .tabular-section {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .env-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .var-value-container,
  .generate-variable-container {
    flex: 1;
    min-height: 0;
  }

  .env-divider {
    height: 1px;
    background: var(--border-ds-surface-100);
  }
  .env-panel {
    background-color: var(--bg-ds-surface-900);
  }
  .env-heading {
    font-size: 18px;
    background-color: transparent;
    width: calc(100% - 500px);
  }
  .env-heading:disabled {
    color: white;
  }
  .env-heading:focus {
    outline: none;
    border: 1px solid #85c2ff !important;
  }
  .env-heading-popup {
    margin-top: 8px;
  }

  .env-help-btn {
    background: transparent;
    border: 0;
    color: var(--primary-btn-color);
    font-size: 12px;
  }
  .env-help-btn:hover {
    color: var(--send-button) !important;
  }
  .env-save-btn {
    padding: 6px 16px;
    opacity: 0.3;
  }
  .env-save-btn:disabled {
    color: white;
  }
  .env-save-btn-enabled {
    padding: 6px;
    opacity: 1;
    background-color: transparent;
    position: relative;
    color: white;
  }
  .badge-data {
    position: absolute;
    top: 3px;
    right: 3px;
    height: 3px;
    width: 3px;
    border-radius: 50%;
    background-color: #ff7878;
    color: white;
  }
  .env-btn-container {
    gap: 16px;
  }
  .quick-help {
    width: 100%;
    max-width: 360px;
    min-width: 240px;
  }
  .quick-help-active {
    width: calc(100% - 280px) !important;
  }
  .env-help-btn:active {
    background-color: var(--selected-active-sidebar);
  }
  .link {
    color: var(--bg-primary-300);
    text-decoration: underline;
  }
  .env-header {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
  }
</style>
