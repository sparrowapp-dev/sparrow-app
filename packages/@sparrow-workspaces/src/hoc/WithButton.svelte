<script lang="ts">
  import {
    AddRegular,
    ChevronDoubleRegular,
    ChevronDownRegular,
  } from "@sparrow/library/icons";
  import { Button, ButtonV2 } from "@sparrow/library/ui";
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

<Button
  type="teritiary-regular"
  size="small"
  startIcon={ChevronDoubleRegular}
  {onClick}
/>
