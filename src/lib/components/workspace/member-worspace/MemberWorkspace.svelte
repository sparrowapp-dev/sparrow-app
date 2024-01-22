<script>
  import MemberDropdown from "$lib/components/dropdown/MemberDropdown.svelte";

  export let workspace;
  export let user;
  export let userType;

  const handleDropdown = (id) => {
    if (id === "remove") {
      // perform remove perations
    } else if (workspace.position === "editor" && id === "viewer") {
      // demote editor to viewer
    } else if (workspace.position === "viewer" && id === "editor") {
      // promote viewer to editor
    }
  };
</script>

<section>
  <div class="d-flex justify-content-between align-items-center">
    <span style="font-size:12px;" class="text-whiteColor">{workspace.name}</span
    >
    <div class="dropdown-workspace-access">
      {#if (userType === "owner" && user.role === "member") || (userType === "admin" && user.role === "member")}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          data={[
            {
              name: "Editor",
              id: "editor",
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: "viewer",
              color: "whiteColor",
            },
            {
              name: "Remove",
              id: "remove",
              color: "dangerColor",
            },
          ]}
          method={workspace.position ? workspace.position : ""}
          onclick={handleDropdown}
        />
      {:else}
        <MemberDropdown
          id={workspace._id + "member-workspace"}
          disabled={true}
          data={[
            {
              name: "Editor",
              id: "editor",
              color: "whiteColor",
            },
            {
              name: "Viewer",
              id: "viewer",
              color: "whiteColor",
            },
            {
              name: "Admin",
              id: "admin",
              color: "whiteColor",
            },
            {
              name: "Owner",
              id: "owner",
              color: "whiteColor",
            },
          ]}
          method={user.role === "owner"
            ? "owner"
            : workspace.position
            ? workspace.position
            : ""}
          onclick={handleDropdown}
        />
      {/if}
    </div>
  </div>
</section>

<style>
  .dropdown-workspace-access {
    width: 100px;
  }
</style>
