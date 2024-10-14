<script lang="ts">
  // import { ButtonV2 } from "@sparrow/library/ui";
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

<!-- <ButtonV2
  {icon}
  {onClick}
  {disable}
  {loader}
  buttonSize={"32px"}
  iconSize={"24px"}
  defaultBackgroundColor={"var(--bg-primary-300)"}
  hoveredBackgroundColor={"var(--bg-primary-250)"}
  clickedBackgroundColor={"var(--bg-primary-250)"}
  defaultIconColor={"var(--bg-secondary-100 )"}
  hoveredIconColor={"var(--bg-secondary-100 )"}
  clickedIconColor={"var(--bg-secondary-100 )"}
  borderRadius={"2px"}
/> -->
