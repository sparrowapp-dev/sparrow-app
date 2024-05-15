<script>
</script>

<div
  class="parent d-flex flex-column align-items-center justify-content-center text-white rounded"
>
  <div
    class="position-relative overflow-hidden m-4 rounded-4 container d-flex flex-column align-items-center justify-content-center w-100"
    style="border: 1px solid var(--bg-container-border); max-width: 404px; padding: 80px 48px;"
  >
    <div
      style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background: var(--bg-container);
          backdrop-filter: blur( 50px );
          -webkit-backdrop-filter: blur( 50px );
          border-radius: 10px; z-index: 0;"
    ></div>
    <div
      style="width: 39px;
          height: 104px;
          opacity: 0.2;background: var(--bg-container-one);
          border-radius: 100%; position: absolute; top: calc(250px - 72px); left: -20px;
          z-index: -1;
      "
    ></div>
    <div
      style="width: 305px;
          height: 77px;background: var(--bg-container-two);
          opacity: 0.2;
          border-radius: 100%; position: absolute; top: 0; left: calc(250px - 152px); z-index: -1;
      "
    ></div>
    <div
      style="width: 131px;
          height: 85px;
          opacity: 0.2;background: var(--bg-container-three);
          border-radius: 100%; position: absolute; top: calc(250px - 60px); right: 0px; z-index: -1;
      "
    ></div>
    <div
      style="width: 305px;
          height: 77px;
          opacity: 0.2;background: var(--bg-container-four);
          border-radius: 100%; position: absolute; bottom: -35px; left: calc(250px - 150px); z-index: -1;
      "
    ></div>
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
