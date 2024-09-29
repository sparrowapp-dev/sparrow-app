<script>
  import { Button } from "@sparrow/library/ui";
  import { notifications } from "@sparrow/library/ui";
  import { onMount } from "svelte";

  // Props passed to the component
  export let openTeam; // The team that is currently open
  export let handleModalState; // Function to handle the modal state
  export let isLeaveTeamModelOpen;
  export let OnleaveTeam;
  export let userId;

  let isLeavingTeam = false;
  let teamName = "";

  const handleLeaveTeam = async () => {
    if (!openTeam) return;
    isLeavingTeam = true;
    const teamId = openTeam?.teamId;

    const response = await OnleaveTeam(userId, teamId);
    if (response.isSuccessful) {
      isLeaveTeamModelOpen = false;
    }
    isLeavingTeam = false;
  };

  onMount(() => {
    if (openTeam) {
      teamName = openTeam?.name;
    }
  });
</script>

<!-- Section for the modal content -->
<section>
  <div>
    <!-- Prompt message for the user to confirm leaving the team -->
    <p class="lightGray" style="color: lightGray;">
      Are you sure you want to leave the team
      <span style="font-weight: 700;">
        "{teamName || ""}"
      </span>? You will lose access to all the resources in this team.
    </p>
  </div>

  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
        disable={isLeavingTeam}
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
          handleModalState(false); // Close the modal
        }}
      />
    </span>
    <!-- Leave button to confirm leaving the team -->
    <Button
      disable={false}
      title={"Leave"}
      textClassProp={"fs-6"}
      type={"danger"}
      onClick={() => {
        handleLeaveTeam(); // Execute the leave team function
      }}
      loader={isLeavingTeam}
    />
  </div>
</section>
