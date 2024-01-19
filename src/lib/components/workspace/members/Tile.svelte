<script>
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";
  export let user;
  export let userId;
  export let userType;
  const handleDropdown = () => {};
</script>

<div class="d-flex tile">
  <div class="info d-flex">
    <div class="icon d-flex align-items-center justify-content-center">
      <span>{user.name[0].toUpperCase()}</span>
    </div>
    <div class="name px-2">
      <span>{user.name}</span><br />
      <span>{user.email}</span>
    </div>
  </div>
  <div class="position">
    {#if userType === "owner"}
      <MemberDropdown
        data={[
          {
            name: "Owner",
            id: "owner",
            color: "whiteColor",
          },
          {
            name: "Admin",
            id: "admin",
            color: "whiteColor",
          },
          {
            name: "Member",
            id: "member",
            color: "whiteColor",
          },
          {
            name: "Remove",
            id: "remove",
            color: "dangerColor",
          },
        ]}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {:else if userType === "admin" && (user.role === "admin" || user.role === "member")}
      <MemberDropdown
        data={[
          {
            name: "Admin",
            id: "admin",
            color: "whiteColor",
          },
          {
            name: "Member",
            id: "member",
            color: "whiteColor",
          },
          {
            name: "Remove",
            id: "remove",
            color: "dangerColor",
          },
        ]}
        method={user.role ? user.role : ""}
        onclick={handleDropdown}
      />
    {/if}
  </div>
</div>

<style>
  .tile {
    background-color: var(--background-light) !important;
    padding: 8px;
  }
  .icon {
    width: 40px;
    height: 36px;
    background-color: var(--background-dropdown) !important;
    border-radius: 50%;
  }
  .info {
    width: calc(100% - 100px);
    height: 36px;
  }
  .position {
    width: 100px;
  }
</style>
