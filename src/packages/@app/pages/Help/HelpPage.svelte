<script>
  import { AddFeedback, DiscordCard, FeedbackToast } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  const _viewModel = new HelpPageViewModel();
</script>

<div class="w-100 d-flex  jutify-content-center" style="background-color: black ;" >
  <div style="height:94vh ; width: 77%; background-color: black ; overflow-y:scroll">
      <FeedbackToast />
      <DiscordPost />
  </div>
  <div style="width: 30%;">
    <div>
      <AddFeedback onSendFeedback={_viewModel.sendFeedback} />
    </div>
    <div style="padding-left:10px;">
      <DiscordCard />
    </div>
  </div>
</div>
