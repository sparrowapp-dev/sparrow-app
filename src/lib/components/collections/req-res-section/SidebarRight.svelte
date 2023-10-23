<script>
  import commetIcon from "$lib/assets/comment-fill.svg";
  import codeIcon from "$lib/assets/code.svg";
  import bookIcon from "$lib/assets/book.svg";
</script>

<div class="sidebar-right bg-backgroundColor ">
  <div class="d-flex flex-column">
    <button class="bg-backgroundColor border-0 mb-4 mt-3">
      <img src={commetIcon} alt="" />
    </button>
    <button class="bg-backgroundColor border-0 mb-4">
      <img src={bookIcon} alt="" />
    </button>
    <button class="bg-backgroundColor border-0">
      <img src={codeIcon} alt="" />
    </button>
  </div>
</div>

<style>
  .sidebar-right {
    width: 32px;
    position: fixed;
    right: 0;
    top:88px;
    height: auto;
    border-left: 1px solid var(--border-color);
    height: 93vh;
  }
</style>
