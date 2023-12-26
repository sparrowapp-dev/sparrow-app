<script lang="ts">
  import { HelpIcon, SaveIcon } from "$lib/assets/app.asset";
  import EnvValue from "$lib/components/env-value/EnvValue.svelte";
</script>

<div class={`env-panel`}>
  <header class={`env-header justify-content-between d-flex`}>
    <h3 class={`env-heading fw-normal`}>Dev</h3>
    <div class={`d-flex env-btn-container`}>
      <button class={`d-flex env-help-btn border-0 my-auto`}>
        <HelpIcon width={19} height={19} classProp={`me-2`} />
        <span class={``}>How to use variables</span>
      </button>
      <button class={`d-flex env-save-btn border-0`}
        ><SaveIcon
          width={16}
          height={16}
          classProp={`me-2 my-auto rounded`}
        /><span>Save</span></button
      >
    </div>
  </header>
  <section class={`var-value-container`}>
    <EnvValue
      keyValue={[{ variable: "a", value: "ss", locked: true }]}
      callback={() => {}}
    />
  </section>
</div>

<style lang="scss">
  .env-panel {
    background-color: var(--background-color);
    width: 75vw;
    height: 94vh;
    padding: 3vw;
  }
  .env-header {
    margin-bottom: 24px;
  }
  .env-heading {
    font-size: 18px;
  }
  .env-help-btn {
    background: transparent;
    color: var(--send-button);
    font-size: 12px;
  }
  .env-save-btn {
    padding: 6px 16px;
    opacity: 0.3;
    background-color: var(--border-color);
  }
  .env-btn-container {
    gap: 24px;
  }
  .var-value-container {
    width: 40vw;
  }
</style>
