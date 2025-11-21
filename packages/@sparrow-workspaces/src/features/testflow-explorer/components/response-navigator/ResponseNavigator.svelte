<script lang="ts">
  import { type UpdateRequestStateType } from "@sparrow/workspaces/type";
  import { ResponseSectionEnum } from "@sparrow/common/types/workspace";
  import { onMount } from "svelte";
  import { Navigator } from "@sparrow/library/ui";
  export let requestStateSection: string;
  export let updateResponseNavigation;
  export let responseHeadersLength = 0;
  export let responsePassedTestResultsLength = 0;
  export let responseTestResultsLength = 0;

  let tabs: {
    name: string;
    id: ResponseSectionEnum;
    count: number;
  }[] = [];

  /**
   * @description - refresh tabs label count
   * @param _responseHeadersLength - response headers length
   */
  const refreshTabs = (_responseHeadersLength: number) => {
    return [
      { name: "Body", id: ResponseSectionEnum.RESPONSE, count: 0 },
      {
        name: "Headers",
        id: ResponseSectionEnum.HEADERS,
        count: _responseHeadersLength,
        type: "count",
      },
      {
        name: "Test Results",
        id: ResponseSectionEnum.TESTRESULT,
        count: responsePassedTestResultsLength,
        type: "fraction",
        secondaryCount: responseTestResultsLength,
        variant:
          responsePassedTestResultsLength === responseTestResultsLength
            ? "success"
            : "danger",
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    if (
      responseHeadersLength ||
      responseTestResultsLength ||
      responsePassedTestResultsLength
    ) {
      tabs = refreshTabs(responseHeadersLength);
    }
  }
  onMount(() => {
    tabs = refreshTabs(responseHeadersLength);
  });

  const onTabClick = (tabId: ResponseSectionEnum) => {
    updateResponseNavigation(tabId);
  };
</script>

<div style="position: relative;">
  <Navigator {tabs} {onTabClick} currentTabId={requestStateSection} />
</div>
