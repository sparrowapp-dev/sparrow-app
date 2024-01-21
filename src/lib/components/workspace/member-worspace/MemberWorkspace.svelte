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
  <div class="d-flex justify-content-between">
    <span>{workspace.name}</span>
    <MemberDropdown
      id={workspace._id + "member-workspace"}
      data={[
        {
          name: "Editor",
          id: "admin",
          color: "whiteColor",
        },
        {
          name: "Viewer",
          id: "viewerr",
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
  </div>
</section>
