<script>
  export let width = "100%";
  export let height = "100%";
</script>

<div class="lazy-element wave" style="width: {width}; height: {height};" />

<style>
  .lazy-element {
    background-color: #2a2a2a;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .wave {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
    animation: wave 1.5s infinite;
  }

  @keyframes wave {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
