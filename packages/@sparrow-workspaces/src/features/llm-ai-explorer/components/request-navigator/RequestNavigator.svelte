<script lang="ts">
  import { type UpdateRequestStateType } from "@sparrow/workspaces/type";
  import { LLM_AI_RequestSectionEnum } from "@sparrow/common/types/workspace/llm-ai-request-tab";

  import { Navigator } from "@sparrow/library/ui";
  export let requestStateSection: string | undefined;
  export let authParameterLength = 0;
  export let authHeaderLength = 0;
  export let configurationLength = 0;
  export let onUpdateRequestState: UpdateRequestStateType;

  let tabs: {
    name: string;
    id: LLM_AI_RequestSectionEnum;
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
        id: LLM_AI_RequestSectionEnum.SYSTEM_PROMPT,
        count: 0,
      },
      {
        name: "Authorization",
        id: LLM_AI_RequestSectionEnum.AUTHORIZATION,
        count: 0,
      },
      {
        name: "Configurations",
        id: LLM_AI_RequestSectionEnum.AI_MODAL_CONFIGURATIONS,
        count: 0,
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    if (authParameterLength || authHeaderLength || configurationLength) {
      tabs = refreshTabs();
    }
  }

  const onTabClick = (tabId: LLM_AI_RequestSectionEnum) => {
    onUpdateRequestState({ LLM_AI_Navigation: tabId });
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
