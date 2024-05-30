<script>
  import BlurEffect from './Card Mid.png'
</script>

<div
  class="parent d-flex flex-column align-items-center justify-content-center text-white rounded"
>
  <div
    class="position-relative overflow-hidden m-4 rounded-4 container d-flex flex-column align-items-center justify-content-center w-100"
    style="border: 1px solid var(--bg-container-border); max-width: 404px; padding: 80px 48px;"
  >
   <img class="position-absolute" src={BlurEffect} alt=""
   style="top: 0; right:0; left:0; bottom:0; ">
    <div
      class=" d-flex flex-column align-items-center justify-content-center w-100"
      style="z-index: 100;"
    >
      <slot></slot>
    </div>
  </div>
  <slot name="outside"></slot>
</div>

<style>
  .parent {
    min-height: 100vh;
    overflow: auto;
  }
</style>
