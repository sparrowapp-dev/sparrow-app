<script lang="ts">
  import { TeamPropertyEnum } from "../../../../types";
  import { NAME_CONFIG } from "../../../../constants";
  import { Input } from "@sparrow/library/forms";
  export let teamName: string;
  export let onUpdateTeam: (property: TeamPropertyEnum) => void;
  export let isTeamNameInvalid = false;
  const inputId = "input-team-name";

  const isOnlySpecialCharacters = (teamName: string) => {
    // Returns true if the name is invalid (contains forbidden characters or only special chars)
    return !/^(?!.*[^A-Za-z0-9]{3,})(?=.*[A-Za-z0-9])[\x20-\x7E]+$/.test(
      teamName,
    );
  };

  const blurInputField = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(inputId) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="d-flex flex-column pb-3">
  <div class="title-width">
    <p class="team-title mt-2 mb-1 fs-12 text-textColor">
      {NAME_CONFIG.TITLE}
    </p>
  </div>
  <div class="container-width">
    <Input
      size={"small"}
      width={"398px"}
      type="text"
      variant={"primary"}
      id={inputId}
      placeholder={NAME_CONFIG.PLACEHOLDER}
      maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
      bind:value={teamName}
      on:keydown={(e) => {
        blurInputField(e);
      }}
      on:blur={() => {
        // Use the same validation logic
        if (isOnlySpecialCharacters(teamName.trim())) {
          isTeamNameInvalid = true;
        } else {
          isTeamNameInvalid = false;
        }
        onUpdateTeam(TeamPropertyEnum.NAME);
      }}
    />
    {#if isTeamNameInvalid}
      <p class="help-label-error text-ds-font-size-12">
        Invalid team name. Please remove unsupported characters (like emojis or
        consecutive symbols, e.g., @@).
      </p>
    {/if}
  </div>
</div>

<style>
  :global(#input-team-name::placeholder) {
    font-size: 12px;
  }
  .settings-team-name {
    background-color: transparent !important;
  }
  .settings-team-name:hover {
    outline: 1px solid var(--border-primary-300);
  }
  .settings-team-name:focus {
    outline: 1px solid var(--border-primary-300);
  }
  .fs-12 {
    font-size: 12px;
  }
  .title-width {
    width: 98px;
  }
  .container-width {
    width: calc(100%-98px);
  }
  .help-label-error {
    margin-top: 0px;
    color: var(--text-ds-danger-300);
    font-family: "Inter", sans-serif;
  }
</style>
