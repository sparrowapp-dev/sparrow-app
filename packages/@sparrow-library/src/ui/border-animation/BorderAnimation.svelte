<!-- BorderAnimation.svelte -->
<div class="border-anim">
  <slot></slot>
</div>

<style>
  .border-anim {
    border-radius: 4px;
    border: 2px solid var(--border-ds-primary-400);
    box-shadow: 0 0 0 0 rgba(49, 108, 246, 0.6);
    animation: pulse-border 1703ms infinite; /* total cycle time: 500+250+250+700+3ms delays */
    display: inline-block;
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
      box-shadow: 0 0 0 4px #6894f9;
      animation-timing-function: ease-out;
    }
    58.7% {
      box-shadow: 0 0 0 8px #6894f94d;
      animation-timing-function: ease-out;
    }
    100% {
      box-shadow: 0 0 0 12px #6894f91a;
      animation-timing-function: linear;
    }
  }
</style>
