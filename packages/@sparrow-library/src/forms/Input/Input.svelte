<script lang="ts">
  import { SearchIcon } from "@sparrow/library/assets";
  import { PencilIcon } from "@sparrow/library/icons";
  import { createEventDispatcher, onMount } from "svelte";

  /**
   * input type
   */
  export let variant: "normal" | "strokeTextField" = "strokeTextField";
  export let type: "text" | "password" | "search" = "text";
  /**
   * placeholder - dummy text
   */
  export let placeholder = "placeholder";
  export let placeholderColor = "gray";
  /**
   * height
   */
  export let height = variant === "normal" ? "30px" : "28px";
  /**
   * width
   */
  export let width = "auto";

  /**
   * identifies input is disabled or not
   */
  export let disabled = false;
  /**
   * input class
   */
  let componentClass = "";
  export { componentClass as class };

  /**
   * input style
   */
  let componentStyle = "";
  export { componentStyle as style };
  /**
   * input value
   */
  export let value = "";

  /**
   * border color
   */
  export let defaultBorderColor = "transparent";
  export let hoveredBorderColor = "red";
  export let focusedBorderColor = "green";

  export let isEditIconRequired = true;

  export let maxlength = 500;

  export let searchIconColor = "var(--defaultcolor)";
  export let iconSize = "14px";

  /**
   * Unique id for input
   */
  export let id = "";

  /**
   * input states
   */
  let isHovered = false;
  let isFocused = false;
  let enterPressed = false;

  const dispatch = createEventDispatcher();

  const extractBorderHighlight = (
    _isHovered: boolean,
    _isFocused: boolean,
    _defaultBorderColor: string,
    _hoveredBorderColor: string,
    _focusedBorderColor: string,
  ) => {
    if (_isFocused) {
      return _focusedBorderColor;
    } else if (_isHovered) {
      if (disabled) return _defaultBorderColor;
      return _hoveredBorderColor;
    } else {
      if (disabled) return _defaultBorderColor;
      return _defaultBorderColor;
    }
  };

  /**
   * blur input on Enter key press
   * @param event - keyboard event
   */
  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && value.length > 0) {
      enterPressed = true;
    }
    if (event.key !== "Enter" && value.length > 0) {
      enterPressed = false;
    }
  };

  $: {
    console.log(enterPressed, value);
    if (value === "") {
      enterPressed = false;
    }
  }
  const handleClick = () => {
    if (value.length > 0) {
      enterPressed = true;
    }
  };
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch("input", target.value);
  };
  onMount(() => {
    window.addEventListener("click", handleClick);
  });
</script>

{#if variant === "normal"}
  <div
    class="position-relative"
    style="height:{height}; width: {width}; !important"
    on:mouseenter={() => {
      isHovered = true;
    }}
    on:mouseleave={() => {
      isHovered = false;
    }}
  >
    <input
      {id}
      on:focus={() => {
        isFocused = true;
      }}
      on:blur={() => {
        isFocused = false;
        dispatch("blur", event?.target?.value);
      }}
      {value}
      on:input={(event) => {
        value = event?.target?.value;
        dispatch("input", event?.target?.value);
      }}
      on:keydown={onKeyPress}
      {type}
      {maxlength}
      class=" w-100 {componentClass}"
      {placeholder}
      style=" {componentStyle} height: 100%; {type === 'search'
        ? `padding-left:${height} !important;`
        : ''} {type === 'text' && isEditIconRequired && isHovered
        ? 'padding-right:35px !important;'
        : ''} border-color:{extractBorderHighlight(
        isHovered,
        isFocused,
        defaultBorderColor,
        hoveredBorderColor,
        focusedBorderColor,
      )}; --placeholder-color: {placeholderColor};"
      {disabled}
    />
    {#if type === "search"}
      <span
        class="position-absolute d-flex align-items-center justify-content-center m-0 p-0"
        style="top: 0; left: 0; bottom: 0; width: {height}; "
      >
        <span class="SearchIconClass" style="margin-top:1px;">
          <SearchIcon
            height={iconSize}
            width={iconSize}
            color={searchIconColor}
          />
        </span>
      </span>
    {/if}
    {#if type === "text" && isHovered && isEditIconRequired && !disabled}
      <span class="position-absolute" style="top:2px; right: 10px">
        <PencilIcon height={iconSize} width={iconSize} color={"white"} />
      </span>
    {/if}
  </div>
{:else}
  <div
    class="d-flex align-items-center justify-content-start w-100 position-relative"
    style={` gap:10px`}
  >
    <div
      class={`d-flex align-items-center justify-content-start position-relative w-100 `}
    >
      <input
        {id}
        type="text"
        class={`strokeTextField ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}`}
        style={`  color:white; outline:none; `}
        {value}
        {placeholder}
        on:input={handleInput}
        on:keydown={onKeyPress}
      />
    </div>
  </div>
{/if}

<style lang="scss">
  .SearchIconClass {
    display: flex;
  }
  input {
    caret-color: var(--border-primary-300);
    border: 1px solid transparent;
  }
  input::placeholder {
    color: var(--placeholder-color);
  }
  .strokeTextField {
    color: var(--text-ds-neutral-50);
    background-color: transparent;
    border: 1px solid var(--border-ds-neutral-600);
    border-radius: 4px;
    padding: 2px 8px;
    gap: 8px;
    caret-color: var(--border-ds-primary-300);
    font-size: 12px !important;
    font-weight: 500;
    line-height: 150%;
  }
  .strokeTextField::placeholder {
    color: var(--text-ds-neutral-400) !important;
  }
  // when focused without text
  .strokeTextField:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }

  // during typing
  .strokeTextField.has-text {
    border: 1px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }

  .strokeTextField.has-text:not(:focus) {
    border: 1px solid var(--border-ds-neutral-600);
  }
  .strokeTextField.entered {
    border: 1px solid var(--border-ds-neutral-600) !important;
    border-radius: 4px;
  }
  .strokeTextField.entered:hover {
    border: 1px solid var(--border-ds-neutral-300) !important;
    border-radius: 4px;
  }
  .strokeTextField.entered:focus {
    border: 2px solid var(--border-ds-primary-300);
  }
  // when it have text  and focused
  .strokeTextField.entered:focus {
    border: 2px solid var(--border-ds-primary-300);
  }
  // when it have text and not focused
  .strokeTextField:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
    border-radius: 4px;
  }
</style>
