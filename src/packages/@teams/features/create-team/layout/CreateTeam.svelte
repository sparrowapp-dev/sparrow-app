<script lang="ts">
  /**
   * Components
   */
  import {
    TeamActions,
    TeamDescription,
    TeamIcon,
    TeamName,
  } from "../components";

  /**
   * Types
   */
  import type { TeamForm } from "../types";

  /**
   * Exports
   */
  export let onCreateTeam;
  export let handleModalState;

  /**
   * data
   */
  let teamForm: TeamForm = {
    name: {
      value: "",
      isTouched: false,
      invalid: false,
    },
    description: {
      value: "",
      isTouched: false,
      invalid: false,
    },
    file: {
      value: [],
      invalid: false,
      showFileSizeError: false,
      showFileTypeError: false,
    },
  };
</script>

<section>
  <TeamName bind:teamForm />
  <TeamDescription bind:teamForm />
  <TeamIcon bind:teamForm />
  <TeamActions bind:teamForm {onCreateTeam} {handleModalState} />
</section>
