<script lang="ts">
  import { type UpdateRequestStateType } from "@sparrow/workspaces/type";
  import { ResponseSectionEnum } from "@sparrow/common/types/workspace";
  import { Navigator } from "@sparrow/library/ui";
  export let requestStateSection;
  export let onUpdateRequestState;
  export let responseHeadersLength = 0;
  export let statusCodes;
  export let date;

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
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    if (responseHeadersLength) {
      tabs = refreshTabs(responseHeadersLength);
    }
  }

  const onTabClick = (tabId: ResponseSectionEnum) => {
    onUpdateRequestState({ responseNavigation: tabId });
  };
</script>

<div class="d-flex justify-content-between">
  <Navigator {tabs} {onTabClick} currentTabId={requestStateSection} />
  <div class="d-flex text-fs-12">
    <div class="me-3">
      <span class="me-1" style="color: var(--text-ds-neutral-300);"
        >Status:</span
      >
      <span
        style={Number(statusCodes.split(" ")[0]) >= 200 &&
        Number(statusCodes.split(" ")[0]) < 300
          ? "color:var(--text-ds-success-300);"
          : "color:var(--text-ds-danger-300);"}
      >
        {statusCodes}
      </span>
    </div>
    <div>
      <span style="color: var(--text-ds-neutral-300);">{date}</span>
    </div>
  </div>
</div>
