<script lang="ts">
  import { HelpIcon, SaveIcon } from "@sparrow/library/assets";
  import { onMount } from "svelte";
  import type { EnvValuePair } from "@sparrow/common/interfaces/request.interface";
  import { QuickHelp } from "../components";
  import { Search } from "@sparrow/library/forms";
  import { hasWorkpaceLevelPermission } from "@sparrow/common/utils";
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
        class={`env-header align-items-end justify-content-between d-flex gap-4 `}
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

        <!-- <Input
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
          hoveredBorderColor={"var(--border-ds-primary-300)"}
          focusedBorderColor={"var(--border-ds-primary-300)"}
          class="text-fs-18 bg-transparent ellipsis fw-normal px-2 rounded-1 "
          style="outline:none;"
          disabled={$currentEnvironment?.property?.environment?.type ==
            "GLOBAL" || userRole === WorkspaceRole.WORKSPACE_VIEWER}
          placeholder=""
          height="36px"
          isPencilIconRequired={false}
        /> -->

        <Input
          type={"text"}
          size={"medium"}
          maxlength={500}
          id={"environment-name"}
          bind:value={environmentName}
          variant={"inline"}
          placeholder={"Untitled"}
          style={"width: 40%; !important"}
          disabled={$currentEnvironment?.property?.environment?.type ==
            "GLOBAL" || userRole === WorkspaceRole.WORKSPACE_VIEWER}
          on:input={(e) => {
            handleCurrentEnvironmentNameChange(environmentName, "");
          }}
          on:blur={(e) => {
            handleCurrentEnvironmentNameChange(environmentName, "blur");
          }}
        />

        <div class={`d-flex env-btn-container`} style="gap: 6px;">
          <div class="position-relative">
            <Search
              id={"environment-search"}
              variant={"primary"}
              bind:value={search}
              on:input={() => {}}
              customWidth={"220px"}
              placeholder="Search"
            />
          </div>

          <div class="position-relative">
            <Tooltip title="Save" placement="bottom-center" distance={10}>
              <Button
                type="primary"
                startIcon={SaveRegular}
                title="Save"
                onClick={onSaveEnvironment}
                customWidth="72px"
                size="small"
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
            <Tooltip title="Help" placement="bottom-center" distance={10}>
              <Button
                type="secondary"
                startIcon={QuestionCirlceReqular}
                size="small"
                customWidth="28px"
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
            ><p style="font-size: 12px;">
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
      <section class={`var-value-container pe-1 mt-2`} style="flex:1;">
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
  .env-panel {
    background-color: var(--bg-secondary-850);
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
    width: 360px;
  }
  .env-parent {
    padding: 0px 12px;
    margin-top: 24px;
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
