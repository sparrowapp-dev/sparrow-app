<script lang="ts">
  import { NAME_CONFIG } from "../../../../constants";

  export let teamName: string;
  export let onUpdateTeam;

  const inputId = "input-team-name";
  const blurInputField = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(inputId) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="title-width">
  <p class="team-title fs-12 text-textColor">{NAME_CONFIG.TITLE}</p>
</div>
<div class="col-10">
  <input
    required
    type="text"
    id={inputId}
    placeholder={NAME_CONFIG.PLACEHOLDER}
    class="settings-team-name w-100 fs-12 border-0 p-3 rounded"
    autocomplete="off"
    spellcheck="false"
    autocorrect="off"
    autocapitalize="off"
    maxlength={NAME_CONFIG.MAX_TEXT_SIZE}
    bind:value={teamName}
    on:keydown={(e) => {
      blurInputField(e);
    }}
    on:blur={() => {
      onUpdateTeam("name");
    }}
  />
</div>

<style>
  .settings-team-name {
    background-color: transparent !important;
    margin-top: -18px;
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
    width: 90px;
  }
</style>
