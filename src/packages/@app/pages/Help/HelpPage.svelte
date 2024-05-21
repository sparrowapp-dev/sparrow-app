<script>
  import { AddFeedback, DiscordCard, FeedbackToast } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
</script>

<div class="w-100 d-flex align-items-center jutify-content-center">
  <div style="width: 70%;">
    <div>
      <FeedbackToast />
    </div>
    <div>
      <DiscordPost />
    </div>
  </div>
  <div style="width: 30%;">
    <div>
      <AddFeedback />
    </div>
    <div>
      <DiscordCard />
    </div>
  </div>
</div>
