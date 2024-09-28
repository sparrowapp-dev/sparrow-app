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
  buttonSize={"36px"}
  iconSize={"20px"}
  borderRadius={"2px"}
  defaultBackgroundColor={"var(--bg-secondary-970)"}
  hoveredBackgroundColor={"var(--bg-tertiary-400)"}
  clickedBackgroundColor={"var(--bg-tertiary-500)"}
  defaultIconColor={"var(--bg-secondary-100)"}
  hoveredIconColor={"var(--bg-secondary-100)"}
  clickedIconColor={"var(--bg-secondary-100)"}
/>
