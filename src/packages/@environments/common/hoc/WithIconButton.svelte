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
  defaultBackgroundColor={"transparent"}
  hoveredBackgroundColor={"var(--bg-secondary-500)"}
  clickedBackgroundColor={"var(--bg-secondary-500)"}
  defaultIconColor={"var(--bg-secondary-300)"}
  hoveredIconColor={"var(--bg-secondary-200)"}
  clickedIconColor={"var(--bg-secondary-200)"}
/>
