<script lang="ts">
  import { collapsibleState } from "$lib/store/request-response-section";
  import { Link } from "svelte-navigator";
  export let route: string;
  export let heading: string;
  export let logo: any;
  export let activeSideBarTabMethods;
  export let isSelected: boolean;
  export let disabled: boolean;
  let collapsExpandToggle = false;
  export let changeSelectedActiveSideBarTab;
  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });
  const setcollapsExpandToggle = () => {
    collapsExpandToggle = !collapsExpandToggle;
    collapsibleState.set(collapsExpandToggle);
    activeSideBarTabMethods.updateActiveTab(route);
    changeSelectedActiveSideBarTab(route);
  };
  collapsibleStateUnsubscribe();
</script>

<Link
  style="text-decoration:none;"
  to={route}
  on:click={setcollapsExpandToggle}
>
  <div
    class="sidebar__container {isSelected && !disabled
      ? 'sidebar__container_background rounded'
      : 'sidebar__container_background2'}"
  >
    <div class="sidebar__container--icon pt-2">
      <img
        src={logo}
        class={isSelected && !disabled ? "active-icon" : ""}
        alt=""
      />
    </div>
    <div
      class={`sidebar__container--text mt-1 ${disabled && "text-textColor"}`}
    >
      <p class={isSelected && !disabled ? "text-plusButton" : ""}>{heading}</p>
    </div>
  </div>
</Link>

<style>
  .sidebar__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }
  .sidebar__container--icon img {
    height: 24px;
    width: 24px;
  }
  .sidebar__container--text {
    font-family: Roboto;
    font-size: 10px;
    font-weight: 400;
    line-height: 10px;
    letter-spacing: 0em;
    color: white;
  }
  .sidebar__container_background {
    background-color: var(--selected-active-sidebar);
  }
  .sidebar__container_background2 {
    background-color: transparent;
  }
  .active-icon {
    filter: brightness(0) saturate(100%) invert(68%) sepia(50%) saturate(1710%)
      hue-rotate(186deg) brightness(108%) contrast(101%);
  }
</style>
