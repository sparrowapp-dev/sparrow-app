<script lang="ts">
  export let isActive: boolean = false;
  export let onToggle: () => void = () => {};
  export let disabled: boolean = false;
  export let label = "";
  export let textColor="";
  export let textSize = "";
  export let fontWeight = "";
  export let fontFamily = "";
  let toggleRef: any;

  function handleToggle() {
    if (disabled) return;
    isActive = !isActive;
    toggleRef.focus();
    onToggle();
  }
  const convertCasing = (sentence: string) => {
    let sen =
      sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    let total_words = sen.split(" ");
    if (total_words.length > 5) sen = total_words.slice(0, 5).join(" ") + "...";
    return sen;
  };
</script>

<div
  class="main-container"
  tabindex={label.length > 0 ? 0 : -1}
  class:hasLabel={label.length > 0}
  class:disabled
>
  {#if label.length > 0}
    <label for="toggle" class="label-text" on:click={handleToggle}>
      {convertCasing(label)}
    </label>
  {/if}

  <div
    class="toggle-container"
    role="switch"
    aria-checked={isActive}
    on:click={handleToggle}
    aria-disabled={disabled}
    class:disabled
    class:hasLabel={label.length > 0}
    id="toggle"
    aria-labelledby="toggle-label"
    bind:this={toggleRef}
  >
    <div
      class="toggle-track"
      class:active={isActive}
      tabindex={label.length > 0 ? -1 : 0}
    >
      <div class="toggle-knob" class:active={isActive}></div>
    </div>
  </div>
</div>

<style>
  .main-container {
    display: flex;
    gap: 8px;
    width: fit-content;
    padding: 4px 0px;
    border-radius: 4px;
    margin: 2px;
  }
  .main-container.disabled .label-text {
    color: var(--bg-ds-neutral-500);
  }

  .main-container[tabindex="0"]:focus-visible {
    box-shadow: 0 0 0 2px var(--bg-ds-primary-300) !important;
    outline: none;
  }
  .toggle-track[tabindex="0"]:focus-visible {
    box-shadow: 0 0 0 2px var(--bg-ds-primary-300);
    outline: none;
  }

  .toggle-container {
    display: inline-block;
    width: 30px;
    cursor: pointer;
    user-select: none;
  }

  .toggle-track {
    position: relative;
    border-radius: 16px;
    background-color: var(--bg-ds-surface-300);
    height: 16px;
    min-height: fit-content;
    transition: background-color 0.3s ease;
  }
  .toggle-container.disabled .toggle-track {
    border: 1px solid var(--bg-ds-surface-100);
  }

  .label-text {
    font-size: 12px;
    color: var(--white-color);
    line-height: 18px;
    font-weight: 500;
    font: Inter, sans-serif;
    max-width: auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
  }
  .toggle-track.active {
    background-color: var(--bg-ds-primary-400);
  }
  .toggle-container:hover .toggle-track.active {
    background-color: var(--bg-ds-primary-300);
  }
  .toggle-container:hover .toggle-track {
    background-color: var(--bg-ds-surface-100);
  }
  .toggle-container.disabled .toggle-track.active {
    background-color: var(--bg-ds-blue-700);
  }
  .toggle-container.disabled .toggle-track {
    background-color: var(--bg-ds-surface-500);
  }
  .toggle-container.disabled .toggle-knob {
    background-color: var(--bg-ds-neutral-300);
  }
  .toggle-container.disabled .toggle-track.active {
    background-color: var(--bg-ds-primary-700);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--bg-ds-neutral-50);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease-out;
  }

  .toggle-knob.active,
  .toggle-container.disabled .toggle-knob.active {
    transform: translateX(14px);
  }
</style>
