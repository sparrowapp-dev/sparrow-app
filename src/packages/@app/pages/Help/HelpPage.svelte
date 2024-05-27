<script>
  import { AddFeedback, DiscordCard, FeedbackToast } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  const _viewModel = new HelpPageViewModel();
</script>

<div class="w-100 d-flex pt-4 jutify-content-center bg-secondary-900">
  <div style="height:calc(100vh - 16px); width: calc(100% - 274px ); overflow-y:scroll">
    <FeedbackToast />
    <DiscordPost />
  </div>
  <div style="width: 274px;" class="px-3 pt-5">
    <div>
      <AddFeedback onSendFeedback={_viewModel.sendFeedback} />
    </div>
    <div>
      <DiscordCard />
    </div>
  </div>
</div>
