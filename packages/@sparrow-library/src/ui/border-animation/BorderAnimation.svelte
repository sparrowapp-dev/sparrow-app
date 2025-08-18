<!-- BorderAnimation.svelte -->
<script>
  export let disable = false;
</script>

<div class="border-anim {disable ? 'disable' : ''}">
  <slot></slot>
</div>

<style>
  .border-anim {
    border-radius: 4px;
    border: 2px solid var(--border-ds-primary-400);
    box-shadow: 0 0 0 0 rgba(49, 108, 246, 0.6);
    display: inline-block;
  }
  .border-anim:not(.disable) {
    animation: pulse-border 1703ms infinite; /* total cycle time: 500+250+250+700+3ms delays */
  }
  @keyframes pulse-border {
    0% {
      box-shadow: 0 0 0 0 rgba(49, 108, 246, 0.6);
      animation-timing-function: ease-out;
    }
    29.3% {
      box-shadow: 0 0 0 0 rgba(49, 108, 246, 0.6);
      animation-timing-function: ease-out;
    }
    44% {
      box-shadow: 0 0 0 2px #6894f9;
      animation-timing-function: ease-out;
    }
    58.7% {
      box-shadow: 0 0 0 4px #6894f94d;
      animation-timing-function: ease-out;
    }
    100% {
      box-shadow: 0 0 0 6px #6894f91a;
      animation-timing-function: linear;
    }
  }
</style>
