<script>
  import { DiscordIDs } from "@sparrow/support/constants/discord.constants";
  import { onMount } from "svelte";

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed";
    script.async = true;
    script.onload = () => {
      // Widgetbot script is loaded
    };
    document.head.appendChild(script);
  });
</script>

<widgetbot
  server={DiscordIDs.ServerID}
  channel={DiscordIDs.ChannelID}
  width="100%"
  height="500px"
></widgetbot>
