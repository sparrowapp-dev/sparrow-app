<script lang="ts">
  export let searchQuery = "";
  export let placeholder = "Search Sparrow...";
  export let onClick = () => {};
  import { SearchIcon } from "@sparrow/library/assets";
</script>

<div class="container" on:click={onClick}>
  <div class="image-container">
    <SearchIcon color="#82858A" class="image-container-img" />
  </div>

  <input
    type="text"
    class="input"
    placeholder={placeholder}
    bind:value={searchQuery}
  />
</div>


<style>
    .container{
        width: 198px;
        height: 30px;
        border: 1px solid #31353F;
        min-height: 30px;
        padding: 8px 8px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap:4px;
    }
    .input{
        border: none;
        outline: none;
        color: #82858A;
        font-size: 12px;
        font-family: '';
        line-height: 18px;
        background: transparent;
        width: 119px;
        height: 16px;
    }
 .image-container-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  padding: 2px;
  overflow: hidden;
}
</style>