<script lang="ts" context="module">
  export type SidebarItemObj = {
    route: string;
    heading: string;
    logo: any;
    disabled: boolean;
    position: "primary" | "secondary";
  };
</script>

<script lang="ts">
  import { Link } from "svelte-navigator";

  export let item: SidebarItemObj;
</script>

<div class="sidebar-item">
  <Link
    to={item.route}
    getProps={({ isCurrent, isPartiallyCurrent }) => {
      return {
        class: `d-flex flex-column py-2 text-decoration-none align-items-center ${
          isCurrent || isPartiallyCurrent ? "active-link" : ""
        } ${item.disabled ? "disabled" : ""}`,
      };
    }}
  >
    <img src={item.logo} alt={item.heading} />
    <span class="pt-2">{item.heading}</span>
  </Link>
</div>

<style>
  .sidebar-item img {
    height: 24px;
    width: 24px;
  }

  .sidebar-item span {
    font-family: Roboto;
    font-size: 10px;
    font-weight: 400;
    line-height: 10px;
    letter-spacing: 0em;
    color: white;
    text-decoration: none;
  }

  .sidebar-item :global(.active-link) {
    filter: brightness(0) saturate(100%) invert(68%) sepia(50%) saturate(1710%)
      hue-rotate(186deg) brightness(108%) contrast(101%);
  }
</style>
