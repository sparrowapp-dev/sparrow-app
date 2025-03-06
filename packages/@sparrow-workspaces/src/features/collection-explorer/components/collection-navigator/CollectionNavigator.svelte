<script lang="ts">
  import { Navigator } from "@sparrow/library/ui";
  export let collectionNavigation;
  export let onUpdateCollectionState;
  import { CollectionNavigationTabEnum } from "@sparrow/common/types/workspace/collection";

  let tabs: {
    name: string;
    id: CollectionNavigationTabEnum;
    count: number;
  }[] = [];

  /**
   * Refresh tabs label count
   */
  const refreshTabs = () => {
    return [
      {
        name: "Overview",
        id: CollectionNavigationTabEnum.OVERVIEW,
        count: 0,
      },
      {
        name: "Auth",
        id: CollectionNavigationTabEnum.AUTH,
        count: 0,
      },
    ];
  };

  /**
   * @description - re-calculates value when dependency changes
   */
  $: {
    tabs = refreshTabs();
  }

  const onTabClick = (tabId: any) => {
    onUpdateCollectionState({ collectionNavigation: tabId });
  };
</script>

<Navigator {tabs} {onTabClick} currentTabId={collectionNavigation} />
