<script lang="ts">
  export let pulsePosition = { top: "0px", left: "0px" }; // Combined position for top and left
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
    border: 2px solid #ff663c;
    background-color: rgba(255, 0, 0, 0.1);
    pointer-events: none;
    animation: pulse-animation 1.5s ease-in-out infinite; 
  }

  @keyframes pulse-animation {
    0% {
      transform: scale(0.9);
    }
    50% {
      transform: scale(1.0); 
    }
    100% {
      transform: scale(0.9); 
    }
  }
</style>
