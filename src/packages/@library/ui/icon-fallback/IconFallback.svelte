<script lang="ts">
  /**
   * The character to be displayed.
   */
  export let character = "";

  /**
   * The width of the element.
   */
  export let width = "36px";

  /**
   * The height of the element.
   */
  export let height = "36px";

  /**
   * The border color of the element.
   */
  export let borderColor = "var(--border-secondary-400)";

  /**
   * The background color of the element.
   */
  export let backgroundColor = "transparent";

  /**
   * The text color of the element.
   */
  export let textColor = "var(--text-secondary-100)";

  /**
   * The font size of the text in the element.
   */
  export let fontSize = "14px";
</script>

<div
  class="d-flex align-items-center justify-content-center"
  style="width: {width};
border: 1px solid {borderColor} ;
height: {height};
border-radius: 50%;
background-color:{backgroundColor};"
>
  <span style="font-size: {fontSize} !important; color: {textColor};"
    >{character.toUpperCase()}</span
  >
</div>
