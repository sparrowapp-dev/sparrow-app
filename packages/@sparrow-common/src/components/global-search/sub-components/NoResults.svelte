<script>
  import {searchIcon} from "@sparrow/common/images";

  export let searchQuery = "";
</script>

<div class="container">
  <div style="display:flex; align-items:center; justify-content:center;">
    <img src={searchIcon} alt="" class="width:24px, height:24px" />
  </div>
  <div class="text-container">
    <p>Nothing found for "{searchQuery}"</p>
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 8px;
    padding: 16px;
    flex-direction: column;
  }

  .text-container {
    display: flex;
    margin-top: 10px;
    align-items: center;
    justify-content: center;
    color: var(--text-ds-neutral-300);
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
  }
</style>
