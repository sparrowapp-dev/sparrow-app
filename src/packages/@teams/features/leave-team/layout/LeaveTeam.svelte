<script>
  import { openedTeam } from "$lib/store";

  export let openTeam;
  export let handleLeaveTeam;
   
    export let  handleModalState

  import Button from "@library/ui/button/Button.svelte";
  import { onMount } from "svelte";
</script>

<section>
  <div>
    <p class="lightGray"
    style="color:lightGray ; ">
      Are you sure do you want to leave the team <span
      style="font-weight:700; 
      ">"{openTeam?.name || ""}"</span> You will
      loose acces to all the resources in this team
    </p>
  </div>
  <div class="d-flex justify-content-end">
    <span style="margin-right: 15px;">
      <Button
        title={"Cancel"}
        textClassProp={"fs-6"}
        type={"dark"}
        onClick={() => {
           handleModalState(false);
        }}
      />
    </span>
    <Button
      disable={false}
      title={"Leave"}
      textClassProp={"fs-6"}
      type={"danger"}
      onClick={() => {
        handleLeaveTeam();
      }}
    />
  </div>
</section>
