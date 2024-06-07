<script>
  import { AddFeedback, DiscordCard, FeedbackToast } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  const _viewModel = new HelpPageViewModel();

  document.addEventListener("contextmenu", (event) => event.preventDefault());
</script>

<div class="w-100 d-flex jutify-content-center bg-secondary-900">
  <div
    style="height:calc(100vh - 16px); width: calc(100% - 274px ); overflow-y:scroll"
  >
    <FeedbackToast />
    <DiscordPost />
  </div>
  <div style="width: 274px;" class="px-3 pt-5">
    <div>
      <AddFeedback
        onAddFeedback={_viewModel.addFeedback}
        onSendFeedback={_viewModel.sendFeedback}
      />
    </div>
    <div>
      <DiscordCard onJoin={_viewModel.joinDiscord} />
    </div>
  </div>
</div>
