<script lang="ts">
  export let isActive: boolean = false;
  export let disabled: boolean = false;
  export let label = "";
  export let textColor = "var(--text-ds-neutral-200)";
  export let fontSize = "12px";
  export let fontWeight = "500";
  export let onChange: (event: Event) => void = () => {};
  export let onClick: (event: MouseEvent) => void = () => {};

  let inputRef: HTMLInputElement;

  const handleChange=(event: Event)=> {
    if (disabled) {
      event.preventDefault();
      return;
    }
    isActive = !isActive;
    onChange(event);
  };
  const handleClick=(event: MouseEvent)=> {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick(event);
  };

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
  <label class="switch-label" class:disabled>
    {#if label.length > 0}
      <span
        class="label-text text-ds-line-height-130"
        style="font-size: {fontSize}; font-weight: {fontWeight}; color: {textColor}"
      >
        {convertCasing(label)}
      </span>
    {/if}

    <span class="toggle-container" class:hasLabel={label.length > 0}>
      <input
        type="checkbox"
        bind:this={inputRef}
        checked={isActive}
        on:change={handleChange}
        on:click={handleClick}
        {disabled}
        aria-label={label}
        id="toggle"
      />
      <span
        class="toggle-track"
        class:active={isActive}
        tabindex={label.length > 0 ? -1 : 0}
      >
        <span class="toggle-knob" class:active={isActive}></span>
      </span>
      <label for="toggle" class="sr-only">Toggle</label>
    </span>
  </label>
</div>

<style>
  .main-container {
    display: flex;
    gap: 8px;
    width: fit-content;
    padding: 2px 0px;
    border-radius: 4px;
    margin: 2px;
  }

  .switch-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .switch-label.disabled {
    cursor: not-allowed !important;
  }

  .main-container.disabled .label-text {
    color: var(--bg-ds-neutral-500) !important;
  }

  .main-container.hasLabel[tabindex="0"]:focus-visible {
    box-shadow: 0 0 0 2px var(--bg-ds-primary-300);
    outline: none;
  }

  .toggle-container {
    display: inline-block;
    width: 30px;
    position: relative;
    user-select: none;
  }
  input[type="checkbox"] {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle-track {
    position: relative;
    border-radius: 16px;
    background-color: var(--bg-ds-surface-300);
    height: 16px;
    min-height: fit-content;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    outline: 1px solid var(--bg-ds-surface-100);
  }

.hasLabel input:focus-visible ~ .toggle-track {
  box-shadow: none;
  outline: none;
}

 .toggle-track[tabindex="0"]:focus-visible {
    box-shadow: 0 0 0 2px var(--bg-ds-primary-300);
    outline: none;
  }

  .switch-label.disabled .toggle-track {
    border: 1px solid var(--bg-ds-surface-100);
  }

  .label-text {
    line-height: 18px;
    max-width: auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  input:checked ~ .toggle-track {
    background-color: var(--bg-ds-primary-400);
  }

  .switch-label:hover .toggle-track {
    background-color: var(--bg-ds-surface-100);
  }

  .switch-label:hover input:checked ~ .toggle-track {
    background-color: var(--bg-ds-primary-300);
  }

  .switch-label.disabled .toggle-track {
    background-color: var(--bg-ds-surface-500);
  }

  .switch-label.disabled input:checked ~ .toggle-track {
    background-color: var(--bg-ds-primary-700);
  }

  .switch-label.disabled .toggle-knob {
    background-color: var(--bg-ds-neutral-300);
  }

  .toggle-knob {
    position: absolute;
    top: 50%;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--bg-ds-neutral-50);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%);
    transition:
      transform 0.25s ease-out,
      width 0.25s ease-out;
    display: block;
  }

.toggle-track:active .toggle-knob {
  width: 18px;
}

input:checked ~ .toggle-track .toggle-knob {
  transform: translateX(14px) translateY(-50%);
}

input:checked ~ .toggle-track:active .toggle-knob {
    transform: translateX(10px) translateY(-50%);
    width: 16px;
}
</style>
