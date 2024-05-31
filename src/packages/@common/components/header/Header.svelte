<script lang="ts">
  import { Select } from "@library/forms";
  import { StackIcon } from "@library/icons";
  import { environmentType } from "$lib/utils/enums";
  import { ArrowIcon } from "@library/icons";
  import { DownArrowIcon } from "$lib/assets/icons";
  import ArrowUnfilled from "@library/icons/ArrowUnfilled.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
 import {SparrowIcon} from "@library/icons";
  /**
   * environment list
   */
  export let environments;
  /**
   * selected environment
   */
  export let currentEnvironment;
  /**
   * updates the selected environment
   */
  export let onInitActiveEnvironmentToWorkspace;
  /**
   * current workspace id
   */
  export let currentWorkspaceId;
  /**
   * callback for Select component
   * @param tabId - selected option id
   */
  let handleDropdown = (tabId: string) => {
    onInitActiveEnvironmentToWorkspace(currentWorkspaceId, tabId);
  };


  export let currentWorkspaceName;

</script>

<header class="ps-1 pe-3 d-flex align-items-center justify-content-between">
  <div class="d-flex ms-3 justify-content-center align-items-center">
   
    <div>
      <SparrowIcon height="17px" width="17px" color="#1193F0" />
    </div>
    <Tooltip title={"Coming Soon"} placement={"right"}>
    <div class="ms-4 d-flex gap-2 mt-1">
      {currentWorkspaceName || ""}
      <div>
        <DownArrowIcon
          width={12}
          height={14}
          color={"var(--sparrow-text-color)"}
        />
      </div>
    </div>
    </Tooltip>
  </div>

  <div>
    <Select
      id={"environment-selector"}
      data={[
        {
          name: "Select Environment",
          id: "none",
          type: environmentType.LOCAL,
          hide: true,
        },
        {
          name: "None",
          id: "none",
          display: "none",
          type: environmentType.LOCAL,
        },
        ...environments,
      ].filter((elem) => {
        return elem.type === environmentType.LOCAL;
      })}
      titleId={currentEnvironment?.id}
      onclick={handleDropdown}
      minHeaderWidth={"185px"}
      iconRequired={true}
      icon={StackIcon}
      isDropIconFilled={true}
      borderType={"none"}
      borderActiveType={"none"}
      headerHighlight={""}
      headerTheme={"transparent"}
      menuItem={"v2"}
      headerFontSize={"12px"}
      maxHeaderWidth={"185px"}
      zIndex={200}
      bodyTheme={"violet"}
      borderRounded={"2px"}
      position={"absolute"}
    />
  </div>
</header>

<style>
  header {
    height: 44px;
  }
</style>
