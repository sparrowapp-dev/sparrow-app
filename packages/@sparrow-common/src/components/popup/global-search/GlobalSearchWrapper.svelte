<script lang="ts">
  import { fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { GlobalSearch } from '.';
  
  export let isOpen: boolean = false;
  export let searchQuery: string = '';
</script>

{#if isOpen}
  <div 
    class="global-search-overlay"
    transition:fade={{ duration: 300, easing: quintOut }}
  >
    <div 
      class="global-search-wrapper"
      transition:fade={{ duration: 300, easing: quintOut }}
    >
      <GlobalSearch />
    </div>
  </div>
{/if}

<style>
  .global-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    padding-top: 80px;
  }

  .global-search-wrapper {
    width: 100%;
    max-width: 630px;
    margin: 0 12px;
  }

  @media (max-width: 991px) {
    .global-search-wrapper {
      margin: 0 16px;
    }
  }
</style>