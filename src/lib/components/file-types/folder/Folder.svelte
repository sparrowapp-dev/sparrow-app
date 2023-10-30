<script lang="ts">
    import folder from "$lib/assets/folder.svg";
    export let name : string = "";
</script>

<div style="height:36px;" class="d-flex align-items-center">
    <img src={folder} alt="" style="height:16px; width:16px;">
    <span style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;">{name}</span>
</div>