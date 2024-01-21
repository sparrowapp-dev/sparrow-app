<script lang="ts">
    import spin from "$lib/assets/spin.svg";
    export let size;
    export let classProp: string = "";
  </script>
  
  <div class={`${classProp} loading-spinner spinner-item`} style="height: {size}; width : {size};">
    <img class="load-spin" src={spin} style="width: 100%; height:100%;" alt="spinner" />
  </div>
  
  <style>
    .spinner-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .load-spin {
      animation: loader-animation 1s linear infinite;
    }
    @keyframes loader-animation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  </style>
  