<script lang="ts">
  import { onMount } from "svelte";
  import {
    SparkleFirst,
    SparkleSecond,
    Sparklethird,
    SparkleFour,
    SparkleFive,
    SparkleSix,
  } from "../icons";
  import type { ComponentType } from "svelte";

  type AnimationType = "smart" | "instant";

  interface Step {
    component: ComponentType;
    delay: number;
    duration: number;
    animate: AnimationType;
  }

  const steps: Step[] = [
    { component: SparkleFirst, delay: 500, duration: 300, animate: "smart" },
    { component: SparkleSecond, delay: 1, duration: 100, animate: "smart" },
    { component: Sparklethird, delay: 1, duration: 100, animate: "smart" },
    { component: SparkleFour, delay: 1, duration: 0, animate: "instant" },
    { component: SparkleFive, delay: 1, duration: 0, animate: "instant" },
    { component: SparkleSix, delay: 1, duration: 300, animate: "smart" },
  ];

  let currentComponent: ComponentType | null = null;
  let currentAnimation: AnimationType = "smart";
  let currentDuration: number = 300;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onMount(async () => {
    while (true) {
      for (const step of steps) {
        await delay(step.delay);
        currentComponent = step.component;
        currentAnimation = step.animate;
        currentDuration = step.duration;
        await delay(step.duration);
      }
    }
  });
</script>

<!-- Display current component only -->
<div class="animated-container">
  {#if currentComponent}
    <div
      class:animate-smart={currentAnimation === "smart"}
      class:animate-instant={currentAnimation === "instant"}
      style={`--duration: ${currentDuration}ms`}
    >
      <svelte:component this={currentComponent} />
    </div>
  {/if}
</div>

<style>
  .animated-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .animate-smart {
    transition:
      transform var(--duration) ease-out,
      opacity var(--duration) ease-out;
    transform: scale(1);
    opacity: 1;
  }

  .animate-instant {
    transition: none;
    transform: scale(1);
    opacity: 1;
  }
</style>
