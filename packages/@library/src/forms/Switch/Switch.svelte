<!-- ToggleSwitch.svelte -->
<script>
  // Define props and events
  export let checked;
  export let onClick;
  export let onChange;

  const handleClick = (event) => {
    if (onClick) onClick(event);
  };

  const handleChange = (event) => {
    if (onChange) onChange(event);
  };

</script>

<label class="switch">
  <input
    type="checkbox"
    bind:checked={checked}
    on:click={handleClick}
    on:change={handleChange}
  />
  <span class="slider round"></span>
</label>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 22px;
    height: 12px;
    margin-left: 2px;
  }

  .switch input {
    opacity: 0;
    width: 22px;
    height: 12px;
    
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-secondary-400);
    transition: 0.4s;
    border-radius: 16px;
    margin-left: 2px;
    
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 8px;
    width: 8px;
    left: 2px;
    bottom: 2px;
    background-color: var( --white-color);
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--bg-primary-200);
 
  }

  input:checked + .slider:before {
    transform: translateX(8px);
  }

  .slider.round:before {
    border-radius: 50%;
    margin-right: 2px;
  }
</style>
