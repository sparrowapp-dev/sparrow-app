<script lang="ts">
export let role;
export let width = "36px";
export let height = "36px";
export let borderColor = "var(--border-color)";
export let backgroundColor = "transparent";
</script>

<div
class="d-flex align-items-center justify-content-center"
style="width: {width};
border: 1px solid {borderColor} ;
height: {height};
border-radius: 50%;
background-color:{backgroundColor};"
>
<span>{role.toUpperCase()}</span>
</div>