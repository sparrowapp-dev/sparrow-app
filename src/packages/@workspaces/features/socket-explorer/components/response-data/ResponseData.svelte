<script lang="ts">
  export let webSocket;
</script>

<div>
  {#each webSocket?.messages as message}
    <div class="d-flex">
      <span>
        {#if message?.transmitter === "sender"}
          <!-- senderIcon -->
        {:else if message?.transmitter === "disconnector"}
          <!-- DisconnectIcon -->
        {:else if message?.transmitter === "connecter"}
          <!-- ConnectIcon -->
        {:else if message?.transmitter === "receiver"}
          <!-- RecieveIcon -->
        {/if}
      </span>
      <span>
        {message?.timestamp}
      </span>
      <p class="ellipsis">{message?.data}</p>
    </div>
  {/each}
</div>
