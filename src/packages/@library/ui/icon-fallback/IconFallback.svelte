<script lang="ts">
  export let character = "";
  export let width = "36px";
  export let height = "36px";
  export let borderColor = "var(--border-secondary-400)";
  export let backgroundColor = "transparent";
  export let textColor = "var(--text-secondary-100)";
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
