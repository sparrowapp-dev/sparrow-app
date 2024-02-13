<script lang="ts">
  export let title = "Tooltip";
  export let classProp = "";
  export let styleProp = "";
  export let placement: "left" | "right" | "top" | "bottom" = "bottom";
</script>

<div class={"tooltip position-relative opacity-100 z-2"}>
  <span
    class={`tooltip-text invisible m-auto text-center rounded px-2 py-1 bg-black text-lightGray position-absolute justify-content-center align-items-center gap-2 opacity-0 z-1
    ${placement.toString()} ${classProp}  `}
    style={styleProp}
    >{title}
  </span>
  <slot />
</div>

<style>
  .top {
    top: -5px;
    left: 50%;
    transform: translateY(-100%) translateX(-50%);
  }
  .left {
    left: -5px;
    top: 50%;
    transform: translateX(-100%) translateY(-50%);
  }
  .right {
    right: -5px;
    top: 50%;
    transform: translateX(100%) translateY(-50%);
  }
  .bottom {
    bottom: -5px;
    left: 50%;
    transform: translateY(100%) translateX(-50%);
  }
  .tooltip-text {
    font-family: Roboto;
    transition: opacity 0.3s;
    width: max-content;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible !important;
    opacity: 1 !important;
  }
</style>
