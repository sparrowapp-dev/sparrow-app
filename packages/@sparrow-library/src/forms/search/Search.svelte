<script lang="ts">
  import search from "../../assets/search.svg";
  import crossIcon from "../../assets/crossicon.svg";
  import { createEventDispatcher } from "svelte";

  // export let type: "text" | "password" | "search" = "text";
  /**
   * placeholder - dummy text
   */
  export let placeholderValue = "placeholder";
  export let placeholderColor = "gray";

  export let id = "";
  export let type: "surface700" | "surface900" | "other" = "other";
  export let size: "medium" | "large" | "other" = "other";
  export let searchStyleProp = "";
  export let searchTextProp = "";
  let searchClassProp = "";
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

  let imgStyleProp = "";

  switch (size) {
    case "medium":
      imgStyleProp = "height:20px; width:20px";
      searchTextProp = "font-weight: 400; font-size: 12px; line-height: 18px;";
      searchStyleProp =
        "width: 220px; height: 28px; min-height: 28px; max-height: 28px; min-width: 198px; max-width: 320px; gap: 8px;   border-radius: 4px;";
      break;
    case "large":
      imgStyleProp = "height:20px; width:20px";
      searchTextProp =
        "font-weight: 400; font-size: 14px; line-height: 20.02px;";
      searchStyleProp =
        "width: 340px; height: 36px; min-height: 36px; max-height: 36px; padding: 2px 8px; border: 1px solid; border-radius: 6px;";
      break;
    default:
      imgStyleProp = "height:20px; width:20px";
      searchTextProp = "font-weight: 400; font-size: 12px; line-height: 18px;";
      searchStyleProp =
        "width: 220px; height: 28px; min-height: 28px; max-height: 28px; min-width: 198px; max-width: 320px; gap: 8px;   border-radius: 4px;";
      break;
  }

  export let value = "";

  /**
   * Unique id for input
   */

  /**
   * input states

  const dispatch = createEventDispatcher();

  /**
   * blur input on Enter key press
   * @param event - keyboard event
   */
  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement;
      inputField.blur();
    }
  };

  function clearSearch() {
    value = ""; // Clear function call
  }
</script>

<div class="input-wrapper" style={`${searchClassProp}`}>
  <div class="icon-search">
    <div class="search-icon" style={`${imgStyleProp}`}>
      <img src={search} />
    </div>
    <input
      {id}
      type="text"
      class={`${searchClassProp} ${value ? "has-text" : ""}`}
      style={` ${searchStyleProp} ${searchTextProp} outline:none; ::placeholder { color: var(--text-ds-neutral-300);};`}
      {value}
      placeholder={placeholderValue}
      on:input={(event) => {
        value = event?.target?.value;
        dispatch("input", event?.target?.value);
      }}
      on:keydown={onKeyPress}
    />
  </div>
  {#if value !== ""}
    <div class="crossIcon" on:click={clearSearch}>
      <img src={crossIcon} />
    </div>
  {/if}
</div>

<style lang="scss">
  .input-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .icon-search {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
  }

  .search-icon {
    position: absolute;
    height: 20px;
    width: 20px;
    left: 10px;
    padding-right: 30px;
    pointer-events: none;
    display: flex;
    align-items: center;
  }
  .crossIcon {
    position: absolute;
    height: 20px;
    width: 20px;
    right: 0px;
    // pointer-events: none;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  input {
    padding-left: 30px;
    padding-right: 30px;
  }

  .custom-surface700 {
    background-color: var(--bg-ds-surface-400);
    border: none; /* No border initially */
    caret-color: var(--border-ds-primary-300);
  }

  /* Focus state (initially 2px border) */
  .custom-surface700:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }

  /* While typing (border becomes 1px) */
  .custom-surface700.has-text:focus {
    border: 1px solid var(--border-ds-primary-300);
  }

  /* When not focused and input is entered, remove border */
  .custom-surface700.has-text:not(:focus) {
    border: none;
  }
  /* When  focused and input is entered, border 2px  */
  .custom-surface700.has-text:focus {
    border: 2px solid var(--border-ds-primary-300);
  }

  /* When not focused but hovered, show gray border */
  .custom-surface700:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
  }

  .custom-surface900 {
    background-color: var(--bg-ds-surface-400);
    border: none; /* No border initially */
    caret-color: var(--border-ds-primary-300);
  }

  /* Focus state (initially 2px border) */
  .custom-surface900:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }

  /* While typing (border becomes 1px) */
  .custom-surface900:focus:not(:placeholder-shown) {
    border: 1px solid var(--border-ds-primary-300);
  }

  /* When not focused and input is entered, remove border */
  .custom-surface900:not(:focus):not(:placeholder-shown) {
    border: none;
  }

  /* When not focused but hovered, show gray border */
  .custom-surface900:not(:focus):not(:placeholder-shown):hover {
    border: 1px solid var(--border-ds-neutral-300);
  }
</style>
