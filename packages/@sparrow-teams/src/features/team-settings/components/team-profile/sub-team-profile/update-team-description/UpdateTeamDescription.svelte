<script lang="ts">
  import { TeamPropertyEnum } from "../../../../types";
  import { DESCRIPTION_CONFIG } from "../../../../constants";

  export let teamDescription: string;
  export let onUpdateTeam: (property: TeamPropertyEnum) => void;

  const inputId = "input-team-description";
  let maxChars = 100;
  const blurInputField = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(inputId) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="d-flex flex-column pb-3">
  <div class="title-width">
    <p class="team-title mt-p fs-12 text-textColor mb-1">
      {DESCRIPTION_CONFIG.TITLE}
    </p>
  </div>
  <div class="container-width">
    <textarea
      required
      id={inputId}
      placeholder={DESCRIPTION_CONFIG.PLACEHOLDER}
      class="settings-team-description w-100 fs-12 border-0 p-2 rounded"
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
        onUpdateTeam(TeamPropertyEnum.DESCRIPTION);
      }}
    />
  </div>
  <div
    class="d-flex justify-content-between"
    style="margin-top: 2px; width:398px"
  >
    <span class="description">Max {maxChars} characters</span>
    <span class="description">{teamDescription.length}/{maxChars}</span>
  </div>
</div>

<style>
  .desc {
    width: 72px;
    height: 28px;
    border: none;
    border-radius: 4px;
    background-color: var(--bg-ds-primary-400);
    transition: background-color 0.3s ease;
  }
  .settings-team-description {
    height: calc(150px) !important;
  }

  .desc:focus-visible {
    border: 1px solid red;
  }
  .desc:hover {
    border-radius: 4px;
    background-color: var(--bg-ds-primary-300);
  }
  .settings-team-description {
    background-color: transparent !important;
  }
  .settings-team-description:hover {
    outline: 1px solid var(--border-ds-neutral-300);
  }
  .settings-team-description:focus {
    outline: 1px solid var(--border-primary-300);
  }
  .fs-12 {
    font-size: 12px;
  }
  .title-width {
    width: 98px;
  }
  .container-width {
    background-color: var(--bg-ds-surface-600);
    width: 398px;
    border-radius: 4px;
    margin-left: 1px;
  }
  .description {
    font-size: 12px;
    color: var(--text-ds-neutral-400);
    font-weight: 400;
  }
</style>
