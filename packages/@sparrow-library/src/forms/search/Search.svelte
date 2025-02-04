<script lang="ts">
  import searchIcon from "../../assets/searchIcon.svg";
  import crossIcon from "../../assets/crossicon.svg";
  import { createEventDispatcher, onMount } from "svelte";

  export let placeholderValue = "Search";
  export let id = "";
  export let type: "surface700" | "surface900" = "surface700";
  export let size: "small" | "large" = "small";
  export let customWidth = "";
  export let onInputChange = (value) => {};
  export let value = "";

  let searchStyleProp = "";
  let searchTextProp = "";
  let searchClassProp = "";
  let imgStyleProp = "";
  let enterPressed = false;

  const dispatch = createEventDispatcher();

  switch (type) {
    case "surface700":
      searchClassProp = "custom-surface700";
      break;
    case "surface900":
      searchClassProp = "custom-surface900";
      break;
    default:
      searchClassProp = "custom-surface700";
      break;
  }

  switch (size) {
    case "small":
      imgStyleProp = "height:20px; width:20px";
      searchTextProp = "font-weight: 400; font-size: 12px; line-height: 18px;";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "auto"}; height: 28px; min-height: 28px; max-height: 28px; max-width: 320px; gap: 8px; border-radius: 4px;`;
      break;
    case "large":
      imgStyleProp = "height:20px; width:20px";
      searchTextProp =
        "font-weight: 400; font-size: 14px; line-height: 20.02px;";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "auto"}; height: 36px; min-height: 36px; max-height: 36px; min-width: 340px; max-width:440px; border-radius: 6px;`;
      break;
    default:
      imgStyleProp = "height:20px; width:20px";
      searchTextProp = "font-weight: 400; font-size: 12px; line-height: 18px;";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "auto"}; height: 28px; min-height: 28px; max-height: 28px; min-width: 198px; max-width: 320px; gap: 8px; border-radius: 4px;`;
      break;
  }

  $: {
    if (value.length <= 0) {
      enterPressed = false;
    }
  }

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement;
      inputField.blur();
    }
    if (event.key === "Enter" && value.length > 0) {
      enterPressed = true;
    }
    if (event.key !== "Enter" && value.length > 0) {
      enterPressed = false;
    }
  };

  const handleClick = () => {
    if (value.length > 0) {
      enterPressed = true;
    }
  };

  function clearSearch() {
    value = "";
    enterPressed = false;
    onInputChange(value);
  }

  onMount(() => {
    window.addEventListener("click", handleClick);
  });
</script>

<div
  class="d-flex align-items-center justify-content-start w-100 position-relative"
  style={`${searchClassProp}`}
>
  <div
    class="d-flex align-items-center justify-content-start position-relative"
  >
    <div
      class="position-absolute d-flex align-items-center"
      style={`height: 20px; width: 20px; left: 10px; pointer-events: none; ${imgStyleProp}`}
    >
      <img src={searchIcon} />
    </div>
    <input
      {id}
      type="text"
      class={`${searchClassProp} ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}`}
      style={` ${searchStyleProp} ${searchTextProp} color:white; outline:none; ::placeholder { color: var(--text-ds-neutral-300);};`}
      {value}
      placeholder={placeholderValue}
      on:input={(event) => {
        value = event?.target?.value;
        dispatch("input", event?.target?.value);
      }}
      on:keydown={onKeyPress}
    />
    {#if value !== ""}
      <div
        class="position-absolute d-flex align-items-center"
        style={"height: 20px; width: 20px; right: 10px; cursor: pointer;"}
        on:click={clearSearch}
      >
        <img src={crossIcon} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  input {
    width: 100%;
    padding-left: 30px;
    padding-right: 30px;
    min-width: 0;
    flex: 1;
  }

  // intial surface 700
  .custom-surface700 {
    background-color: var(--bg-ds-surface-400);
    border: none;
    caret-color: var(--border-ds-primary-300);
  }
  // when focused without text
  .custom-surface700:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .custom-surface700.has-text {
    border: 1px solid var(--border-ds-primary-300);
  }
  // when it have text but not foucsed
  .custom-surface700.has-text:not(:focus) {
    border: none;
  }
  // when it have text  and focused
  .custom-surface700.entered:focus {
    border: 2px solid var(--border-ds-primary-300);
  }
  // when it have text and not focused
  .custom-surface700:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
  }

  .custom-surface900 {
    background-color: var(--bg-ds-surface-600);
    border: none;
    caret-color: var(--border-ds-primary-300);
  }

  .custom-surface900:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }

  .custom-surface900.has-text {
    background-color: var(--bg-ds-surface-600);
    border: 1px solid var(--border-ds-primary-300);
  }

  .custom-surface900.has-text:not(:focus) {
    border: none;
  }

  .custom-surface900.entered {
    background-color: var(--bg-ds-surface-600);
    border: none;
  }

  .custom-surface900.entered:focus {
    background-color: var(--bg-ds-surface-600);
    border: 2px solid var(--border-ds-primary-300);
  }

  .custom-surface900.entered:hover {
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--border-ds-neutral-300);
  }

  .custom-surface900:not(:focus):hover {
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--border-ds-neutral-300);
  }
</style>
