<script>
  import {
    AddFeedback,
    DiscordCard,
    FeedbackToast,
    UpdateToast,
  } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  import { onMount } from "svelte";

  const _viewModel = new HelpPageViewModel();

  document.addEventListener("contextmenu", (event) => event.preventDefault());

  let activeTab = "feeback";

  function setActiveTab(tab) {
    if (tab !== "faq") {
      // Disable FAQ tab
      activeTab = tab;
    }
  }

  let releaseNotesData = [];

  onMount(async () => {
    await _viewModel.fetchReleaseNotes();
    releaseNotesData = await _viewModel.getAllReleaseNotes();
    let pathname = window.location.pathname;
    if (pathname.includes("app/help/updates")) {
      activeTab = "updates";
    } else {
      activeTab = "feedback";
    }
  });

 

</script>

<div class="tabs">
  <div
    class="tab {activeTab === 'feedback' ? 'active' : ''}"
    on:click={() => setActiveTab("feedback")}
  >
    Feedback
  </div>
  <div
    class="tab {activeTab === 'updates' ? 'active' : ''}"
    on:click={() => setActiveTab("updates")}
  >
    Updates
  </div>
</div>

<div class="w-100 d-flex jutify-content-center bg-secondary-900">
  <div
    style="height:calc(100vh - 16px); width: calc(100% - 274px ); overflow-y:scroll"
  >
    {#if activeTab === "feedback"}
      <FeedbackToast />
      <DiscordPost />
    {:else if activeTab === "updates"}
      <UpdateToast {releaseNotesData}   onLearnMore={_viewModel.learnMore} />
    {/if}
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

<style>
  .tabs {
    display: flex;
    height: 37px;
    border-bottom: 2px solid var(--text-secondary-900);
  }

  .tab {
    width: 260px;
    display: flex;
    padding: 10px 20px;
    cursor: pointer;
    color: var(--text-primary-250);
    position: relative;
    justify-content: center;
  }

  .tab.active {
    color: var(--text-secondary-100);
  }

  .tab.active::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    border-bottom: 4px solid var(--text-primary-300);
  }
</style>
