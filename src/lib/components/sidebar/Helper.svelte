<script lang="ts">
  import { collapsibleState } from "$lib/store/request-response-section";
  import { Link } from "svelte-navigator";
  export let route: string;
  export let heading: string;
  export let logo: any;

  let collapsExpandToggle = false;

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  const setcollapsExpandToggle = () => {
    collapsExpandToggle = !collapsExpandToggle;
    collapsibleState.set(collapsExpandToggle);
  };

  collapsibleStateUnsubscribe();
</script>

<Link
  style="text-decoration:none;"
  to={route}
  on:click={setcollapsExpandToggle}
>
  <div class="sidebar__container">
    <div class="sidebar__container--icon"><img src={logo} alt="" /></div>
    <div class="sidebar__container--text"><p>{heading}</p></div>
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
</style>
