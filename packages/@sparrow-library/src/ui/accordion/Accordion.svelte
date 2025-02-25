<script>
  import { ChevronDownRegular } from "../../icons";
  import { Button } from "../button";

  export let position = "left";
  let isOpen = false;
</script>

<div
  class="border border-purple-500 rounded-lg p-2 flex items-center justify-between cursor-pointer"
  on:click={() => (isOpen = !isOpen)}
>
  {#if position === "left"}
    <div class="flex items-center">
      <Button
        type="teritiary-regular"
        size="small"
        startIcon={ChevronDownRegular}
        iconSize={16}
      />
    </div>
  {/if}
  <div></div>
  {#if position === "right"}
    <div class="flex items-center">
      <Button
        type="teritiary-regular"
        size="small"
        startIcon={ChevronDownRegular}
        iconSize={16}
      />
    </div>
  {/if}
</div>

{#if isOpen}
  <div
    class=" border border-gray-600 p-4 rounded-lg bg-gray-800 text-white"
    style="padding-top: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
    padding-left: 40px"
  >
    <slot />
  </div>
{/if}
