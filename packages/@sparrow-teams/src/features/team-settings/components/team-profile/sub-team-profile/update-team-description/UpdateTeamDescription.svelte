<script lang="ts">
  import { TeamPropertyEnum } from "../../../../types";
  import { DESCRIPTION_CONFIG } from "../../../../constants";

  export let teamDescription: string;
  export let onUpdateTeam: (property: TeamPropertyEnum) => void;

  const inputId = "input-team-description";
  const blurInputField = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(inputId) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="d-flex flex-column pb-3">
  <div class="title-width">
    <p class="team-title mt-2 fs-12 text-textColor">
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
</div>

<div tabindex="0">
  <button
    class="desc"
    style="width:72px;border-width:0px;height:28px;border-radius:4px;"
    >click</button
  >
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
    outline: 1px solid var(--border-primary-300);
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
  }
</style>
