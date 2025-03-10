<script lang="ts">
  import { Button } from "@sparrow/library/ui";
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

  export let size="medium";

  export let type="primary";
  $: ({ onClick, icon, disable, loader } = $$props);
</script>

<Button
  startIcon={icon}
  {onClick}
  {disable}
  {loader}
  type={type}
  size={size}
/>
