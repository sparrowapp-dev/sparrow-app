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

    pointer-events: none; /* Prevents blocking clicks */
  }

  
</style>
