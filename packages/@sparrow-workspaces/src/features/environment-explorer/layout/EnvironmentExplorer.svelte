<script lang="ts">
  import { HelpIcon, SaveIcon } from "@sparrow/library/assets";
  import { onMount } from "svelte";
  import type { EnvValuePair } from "@sparrow/common/interfaces/request.interface";
  import { QuickHelp } from "../components";
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "@sparrow/common/constants/permissions.constant";
  import { Tooltip } from "@sparrow/library/ui";

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
  export let userRole;
  let isPopoverContainer = false;

  let quickHelp: boolean = false;
  let search = "";
  let environmentName = "";
  $: {
    if ($currentEnvironment) {
      environmentName = $currentEnvironment?.name;
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

  onMount(async () => {
    const event = await onFetchEnvironmentGuide({
      id: "environment-guide",
    });
    if (event?.isActive === true) {
      isPopoverContainer = true;
    } else {
      isPopoverContainer = false;
    }
  });
</script>

{#if $currentEnvironment?.tabId}
  <div class={`h-100 env-panel d-flex`}>
    <div
      class="d-flex flex-column h-100 env-parent w-100 {quickHelp
        ? 'quick-help-active'
        : ''}"
    >
      <header
        class={`env-header justify-content-between d-flex`}
        style="position: relative ;"
      >
        <!--Disabling the Quick Help feature, will be taken up in next release-->
        {#if $currentEnvironment?.property?.environment?.type === environmentType.GLOBAL}
          <button
            class="btn p-0"
            style="position: absolute; left:150px;  top:22.5px; border:none; z-index:5; curser:pointer;"
            on:click={() => {
              isPopoverContainer = !isPopoverContainer;
              if (isPopoverContainer === true) {
                onUpdateEnvironmentGuide(
                  {
                    id: "environment-guide",
                  },
                  true,
                );
              } else {
                onUpdateEnvironmentGuide(
                  {
                    id: "environment-guide",
                  },
                  false,
                );
              }
            }}
          >
            <HelpIcon height={"12.67px"} width={"12.67px"} />
          </button>
        {/if}

        <Input
          id={"environment-name"}
          width={"calc(100% - 500px)"}
          type="text"
          bind:value={environmentName}
          on:input={(e) => {
            handleCurrentEnvironmentNameChange(environmentName, "");
          }}
          on:blur={(e) => {
            handleCurrentEnvironmentNameChange(environmentName, "blur");
          }}
          defaultBorderColor="transparent"
          hoveredBorderColor={"var(--border-primary-300)"}
          focusedBorderColor={"var(--border-primary-300)"}
          class="text-fs-18 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={$currentEnvironment?.property?.environment?.type ==
            "GLOBAL" || userRole === WorkspaceRole.WORKSPACE_VIEWER}
          placeholder=""
        />
        <div class={`d-flex env-btn-container`}>
          <div class="position-relative">
            <Input
              id={"environment-search"}
              type="search"
              bind:value={search}
              on:input={() => {}}
              width={"300px"}
              class="text-fs-12 rounded p-2 bg-secondary-600"
              style="outline:none;"
              placeholder="Search Variables"
              defaultBorderColor="transparent"
              hoveredBorderColor={"var(--border-primary-300)"}
              focusedBorderColor={"var(--border-primary-300)"}
            />
          </div>

          <div class="position-relative">
            <Tooltip title="Save" placement="bottom" distance={10}>
              <WithButtonV3
                icon={SaveIcon}
                onClick={onSaveEnvironment}
                disable={$currentEnvironment?.property?.environment?.state
                  ?.isSaveInProgress ||
                  $currentEnvironment?.isSaved ||
                  userRole === WorkspaceRole.WORKSPACE_VIEWER}
                loader={$currentEnvironment?.property?.environment?.state
                  ?.isSaveInProgress}
              />
            </Tooltip>
          </div>
          <span>
            <Tooltip title="Help" placement="bottom" distance={10}>
              <WithButtonV3
                icon={HelpIcon}
                onClick={() => {
                  quickHelp = true;
                }}
                disable={false}
                loader={false}
              />
            </Tooltip>
          </span>
        </div>
      </header>
      <!--Disabling the Quick Help feature, will be taken up in next release-->
      <div>
        {#if isPopoverContainer && $currentEnvironment?.property?.environment?.type === environmentType.GLOBAL}
          <Popover
            heading={`Welcome to Environments!`}
            text={` `}
            onClose={closeEnvHelpText}
            ><p>
              Environments allow you to manage different sets of configuration
              variables for various stages of your application (e.g.
              Development, Staging, Production). This helps in organizing and
              isolating settings, making testing and deployment easier and more
              efficient.
              <span
                on:click={() => {
                  isGuidePopup = true;
                }}
                class="link btn p-0 border-0"
                style="font-size: 12px;"
                >See how it works.
              </span>
            </p></Popover
          >
        {/if}
      </div>
      <section class={`var-value-container pe-1`} style="flex:1;">
        <TabularInputV2
          disabled={userRole === WorkspaceRole.WORKSPACE_VIEWER}
          keyValue={$currentEnvironment?.property?.environment?.variable}
          callback={handleCurrentEnvironmentKeyValuePairChange}
          {search}
        />
      </section>
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

<!--Disabling the Quick Help feature, will be taken up in next release-->
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
          gif: `${IntroToEnvironment}`,
        },
        {
          id: 2,
          heading: "Step  2: Creating a New Environment",
          subheading:
            "Creating a new environment is simple. Follow these steps to set up an environment tailored to your needs.",
          gif: `${CreateENV}`,
        },
        {
          id: 3,
          heading: "Step 3: Search and apply Environment Variables",
          subheading:
            "Easily search and apply variables from global or selected environment in the REST API tool, to streamline your API testing process.",
          gif: `${SearchVariable}`,
        },
      ]}
      handleClosePopup={(flag = false) => {
        isGuidePopup = flag;
      }}
    />
  </div>
</Modal>

<style lang="scss">
  .env-panel {
    background-color: var(--bg-secondary-850);
  }
  .env-header {
    padding: 20px 0px 10px 6px;
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
    // background-color: var(--border-color);
  }
  .env-save-btn:disabled {
    color: white;
  }
  .env-save-btn-enabled {
    padding: 6px;
    opacity: 1;
    // background-color: var(--border-color);
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
  .var-value-container {
    width: 100%;
    overflow-y: auto;
  }
  .quick-help {
    width: 280px;
  }
  .env-parent {
    padding: 10px;
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
</style>
