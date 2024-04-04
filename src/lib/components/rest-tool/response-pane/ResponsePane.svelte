<script lang="ts">
  // TODO: Change location for default page component
  import DefaultPage from "$lib/components/collections/req-res-section/sub-components/response-body-section/DefaultPage.svelte";

  export let response: string | undefined = undefined;
</script>

{#if response == undefined}
  <DefaultPage />
{/if}
