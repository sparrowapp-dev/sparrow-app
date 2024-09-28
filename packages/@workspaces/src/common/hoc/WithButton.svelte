<script lang="ts">
  import { ButtonV2 } from "@sparrow/library/ui";
  /**
   * icon to be embedded in button
   */
  export let icon;
  /**
   * function to invoke in button click
   */
  export let onClick;
  /**
   * identifies the button is desabled or enabled
   */
  export let disable;
  /**
   * identifies the button is in loading state or not
   */
  export let loader;
  $: ({ onClick, icon, disable, loader } = $$props);
</script>

<ButtonV2
  {icon}
  {onClick}
  {disable}
  {loader}
  buttonSize={"24px"}
  iconSize={"10px"}
  defaultBackgroundColor={"transparent"}
  hoveredBackgroundColor={"var(--bg-secondary-500)"}
  clickedBackgroundColor={"var(--bg-secondary-500)"}
  defaultIconColor={"var(--bg-secondary-200)"}
  hoveredIconColor={"var(--bg-secondary-100)"}
  clickedIconColor={"var(--bg-secondary-100)"}
/>
