<script>
  import { ButtonV2 } from "@library/ui";
  export let icon;
  export let onClick;
  export let disable;
  export let loader;
  $: ({ onClick, icon, disable, loader } = $$props);
</script>

<ButtonV2
  {icon}
  {onClick}
  {disable}
  {loader}
  buttonSize={"32px"}
  iconSize={"20px"}
  defaultBackgroundColor={"var(--bg-primary-300)"}
  hoveredBackgroundColor={"var(--bg-primary-250)"}
  clickedBackgroundColor={"var(--bg-primary-250)"}
  defaultIconColor={"var(--bg-secondary-100 )"}
  hoveredIconColor={"var(--bg-secondary-100 )"}
  clickedIconColor={"var(--bg-secondary-100 )"}
/>
