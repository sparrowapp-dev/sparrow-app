<script lang="ts">
  import { type UpdateRequestStateType } from "@sparrow/workspaces/type";
  import { AiRequestSectionEnum } from "@sparrow/common/types/workspace/ai-request-tab";

  import { Navigator } from "@sparrow/library/ui";
  import { afterUpdate } from "svelte";
  export let requestStateSection: string | undefined;
  export let authParameterLength = 0;
  export let authHeaderLength = 0;
  export let configurationLength = 0;
  export let onUpdateRequestState: UpdateRequestStateType;

  let tabs: {
    name: string;
    id: AiRequestSectionEnum;
    count: number;
  }[] = [];

  // /**
  //  * @description - refresh tabs label count
  //  * @param _authParameterLength - auth parameter length
  //  * @param _authHeaderLength - auth headers length
  //  * @param _configurationLength - ai configuration length
  //  */
  const refreshTabs = () => {
    return [
      {
        name: "System Prompt",
        id: AiRequestSectionEnum.SYSTEM_PROMPT,
        count: 0,
      },
      {
        name: "Auth",
        id: AiRequestSectionEnum.AUTHORIZATION,
        count: 0,
      },
      {
        name: "Configurations",
        id: AiRequestSectionEnum.AI_MODAL_CONFIGURATIONS,
        count: 0,
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  // $: {
  //   if (authParameterLength || authHeaderLength || configurationLength) {
  //     tabs = refreshTabs();
  //   }
  // }

  afterUpdate(() => {
    tabs = refreshTabs();
  });

  const onTabClick = (tabId: AiRequestSectionEnum) => {
    onUpdateRequestState({ aiNavigation: tabId });
  };
</script>

<div style="padding-bottom: 12px;">
  <Navigator {tabs} {onTabClick} currentTabId={requestStateSection} />
</div>

<style>
  .navigation__link {
    color: var(--text-secondary-100);
    background-color: transparent;
    border-bottom: 2px transparent;
  }

  .navigation__link:hover {
    background-color: var(--text-secondary-500);
    border-radius: 2px;
  }
  .tab-active {
    color: var(--text-secondary-100);
    border-bottom: 2px solid var(--border-primary-300) !important;
  }
</style>
