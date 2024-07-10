<script lang="ts">
export let role;
export let width = "36px";
export let height = "36px";
export let borderColor = "var(--border-color)";
</script>

<div
class="d-flex align-items-center justify-content-center"
style="width: {width};
border: 1px solid {borderColor} ;
height: {height};
border-radius: 50%;"
>
<span>{role.toUpperCase()}</span>
</div>