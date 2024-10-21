<script lang="ts">
  export let pulsePosition = { top: "-5px", left: "30px" }; // Combined position for top and left
</script>

<!-- Pulse circle element -->
<div
  class="pulse-circle"
  style="top: {pulsePosition.top}; left: {pulsePosition.left};"
></div>

<style lang="scss">
  .pulse-circle {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid red;
    background-color: rgba(255, 0, 0, 0.1);
    animation:pulse 1.5 infinite;
    pointer-events: none; /* Prevents blocking clicks */
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
    }
  }
</style>
