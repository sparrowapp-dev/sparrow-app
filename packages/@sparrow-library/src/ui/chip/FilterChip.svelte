<script lang="ts">
  import { BoxIcon, CrossIcon2 } from "../../icons";

  export let startIcon = null;
  export let endIcon = null;
  export let label = "";
  export let onClose = (id: string) => {};
  export let type: "input" | "filter" | "avatar-input" = "input";
  export let id = "";
  export let disabled = false;
  export let isError = false;
  let selected = false;
</script>

<button
  {disabled}
  class="{type} {selected
    ? 'selected'
    : ''} d-inline-flex gap-1 align-items-center justify-content-center chip"
>
  {#if type === "input"}
    {#if startIcon}
      <span class="">
        <svelte:component this={startIcon} color={"var(--bg-ds-neutral-50)"} />
      </span>
    {/if}

    <span class="text-fs-12">
      {label}
    </span>

    <span
      class="cross-icon d-flex align-items-center justify-content-center"
      on:click={() => {
        onClose(id);
      }}
    >
      <CrossIcon2
        height={"16px"}
        width={"16px"}
        color={"var(--icon-ds-neutral-50)"}
      />
    </span>
  {:else if type === "filter"}
    {#if startIcon}
      <span
        class=""
        style="width: 24px; height:24px; display:flex; align-items:center; justify-content:center;"
      >
        <svelte:component
          this={startIcon}
          size={"16px"}
          color={"var(--bg-ds-neutral-50)"}
        />
      </span>
    {/if}
    <span
      class="text-fs-12"
      style="font-size: 12px; font-weight:500; line-height:18px;"
    >
      {label}
    </span>

    {#if endIcon}
      <span class="">
        <svelte:component this={endIcon} color={"var(--bg-ds-neutral-50)"} />
      </span>
    {/if}
  {:else if type === "avatar-input"}
    <span class="avatar-icon d-flex align-items-center justify-content-center">
      <BoxIcon height={"24px"} width={"24px"} />
    </span>

    <span class="text-fs-12">
      {label}
    </span>
    <span
      class="cross-icon d-flex align-items-center justify-content-center"
      on:click={() => {
        onClose(id);
      }}
    >
      <CrossIcon2
        height={"16px"}
        width={"16px"}
        color={"var(--icon-ds-neutral-50)"}
      />
    </span>
  {/if}
</button>

<style>
  .chip {
    background-color: var(--bg-ds-surface-200);
    overflow: hidden;
    padding: 2px 2px 2px 8px;
    height: 28px;
    border: none;
  }
  .error-chip {
    color: var(--text-ds-danger-300) !important;
  }
  .chip:hover {
    background-color: var(--bg-ds-surface-100);
  }
  .error-chip:focus {
    outline: 2px solid var(--border-ds-danger-300) !important;
  }
  .chip:focus {
    outline: 1px solid var(--border-ds-primary-300);
  }
  .chip:active {
    background-color: var(--bg-ds-surface-500);
  }
  .chip:disabled {
    background-color: var(--bg-ds-surface-500);
    opacity: 0.5;
  }
  .avatar-input {
    border-radius: 30px;
  }
  .input,
  .filter {
    border-radius: 4px;
  }

  .filter {
    padding: 2px 8px;
    gap: 4px;
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-100);
    border-radius: 4px;
  }

  .filter:hover {
    background-color: var(--bg-ds-surface-100);
    color: var(--text-ds-neutral-50);
  }

  .filter:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
  }

  .filter:focus-visible {
    background-color: var(--bg-ds-surface-100);
    color: var(--text-ds-neutral-50);
    border: 2px solid var(--bg-ds-primary-300);
    outline: none;
  }

  .avatar-icon {
    border-radius: 50%;
    height: 24px;
    width: 24px;
    border: 2px solid var(--border-ds-surface-50);
  }
  .cross-icon {
    height: 20px;
    width: 20px;
  }
</style>
