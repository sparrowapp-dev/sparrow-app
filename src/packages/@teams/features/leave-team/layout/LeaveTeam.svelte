<script>

  // Props passed to the component
  export let openTeam; // The team that is currently open
  export let handleLeaveTeam; // Function to handle leaving the team
  export let handleModalState; // Function to handle the modal state

  // Importing a Button component from the UI library
  import Button from "@library/ui/button/Button.svelte";
</script>

<!-- Section for the modal content -->
<section>
  <div>
    <!-- Prompt message for the user to confirm leaving the team -->
    <p class="lightGray" style="color: lightGray;">
      Are you sure you want to leave the team 
      <span style="font-weight: 700;">
        "{openTeam?.name || ""}"
      </span>?
      You will lose access to all the resources in this team.
    </p>
  </div>
  
  <!-- Container for the action buttons -->
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <!-- Cancel button to close the modal without leaving the team -->
      <Button
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
    />
  </div>
</section>
