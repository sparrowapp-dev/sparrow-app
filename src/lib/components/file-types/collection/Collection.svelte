<script lang="ts">
    import collection from "$lib/assets/collection.svg";
    export let name : string = "";
</script>

<div style="height:36px;" class="d-flex align-items-center">
    <img src={collection} alt="" style="height:16px; width:16px;">
    <span class="ellipsis" style="padding-left: 8px; cursor:pointer; font-size:14px; font-weight:400;">{name}</span>
</div>

<style>
     .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>