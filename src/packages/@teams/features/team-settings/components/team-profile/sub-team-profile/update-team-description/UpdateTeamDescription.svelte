<script lang="ts">
  import { DESCRIPTION_CONFIG } from "../../../../constants";

  export let teamDescription: string;
  export let onUpdateTeam;

  const inputId = "input-team-description";
  const blurInputField = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(inputId) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="title-width">
  <p class="team-title fs-12 text-textColor">{DESCRIPTION_CONFIG.TITLE}</p>
</div>
<div class="col-10">
  <textarea
    required
    id={inputId}
    placeholder={DESCRIPTION_CONFIG.PLACEHOLDER}
    class="settings-team-description w-100 fs-12 border-0 p-3 rounded"
    autocomplete="off"
    spellcheck="false"
    autocorrect="off"
    autocapitalize="off"
    maxlength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
    bind:value={teamDescription}
    on:keydown={(e) => {
      blurInputField(e);
    }}
    on:blur={() => {
      onUpdateTeam("description");
    }}
  />
</div>

<style>
  .settings-team-description {
    height: calc(150px) !important;
  }

  .settings-team-description {
    background-color: transparent !important;
    margin-top: -18px;
  }
  .settings-team-description:hover {
    outline: 1px solid var(--border-primary-300);
  }
  .settings-team-description:focus {
    outline: 1px solid var(--border-primary-300);
  }
  .fs-12 {
    font-size: 12px;
  }
  .title-width {
    width: 90px;
  }
</style>
