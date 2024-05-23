<script>
  import { AddFeedback, DiscordCard, FeedbackToast } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
</script>

<div class="w-100 d-flex  jutify-content-center" style="background-color: black ;" >
  <div style="height:94vh ; width: 77%; background-color: black ; overflow-y:scroll">
      <FeedbackToast />
      <DiscordPost />
  </div>
  <div style="background-color: black ;   padding-top:48px; width: 240px;
  height: 236px;" >
    <div style="padding-left:9px; "   >
      <AddFeedback />
    </div>
    <div style="padding-left:10px;">
      <DiscordCard />
    </div>
  </div>
</div>
