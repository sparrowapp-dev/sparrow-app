<script>
  import {
    AddFeedback,
    DiscordCard,
    FeedbackSection,
    FeedbackToast,
    ReleaseNotes,
    Community
  } from "@support/features";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  import { onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { pagesMotion } from "@app/constants";

  const _viewModel = new HelpPageViewModel();

  document.addEventListener("contextmenu", (event) => event.preventDefault());

  let activeTab = "feedback";

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

<Motion {...pagesMotion} let:motion>
  <div class="h-100" use:motion>
    <div class="h-100 d-flex flex-column">
      <!--
        --  Help Navigator
      -->
      <div class="tabs px-3">
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
        <div
        class="tab {activeTab === 'community' ? 'active' : ''}"
        on:click={() => setActiveTab("community")}
      >
        Community
      </div>
      </div>
      <!--
        -- Help Body 
      -->
      <div
        class="w-100 d-flex jutify-content-center bg-secondary-900"
        style="flex:1; overflow: auto;"
      >
        <div
          style="width: calc(100% - 274px );"
          class="ps-3 pe-2 pt-3 pb-2 h-100"
        >
          <div class=" h-100 pe-2" style="margin-left:34px; overflow:auto;">
            {#if activeTab === "feedback"}
             
              <FeedbackSection
                onInputFeedback={_viewModel.createPost}
                onAddFeedback={_viewModel.addFeedback}
              />
            {:else if activeTab === "updates"}
              <ReleaseNotes
                {releaseNotesData}
                onLearnMore={_viewModel.learnMore}
              />

              {:else if activeTab === "community"}
              <Community/>
              <DiscordPost />
            {/if}
          </div>
        </div>
        <div style="width: 274px;" class="ps-2 pe-3 pt-3 pb-2 h-100">
          <div class="h-100 pe-2" style="overflow:auto;">
            <div class="mb-3">
              <AddFeedback
                onInputFeedback={_viewModel.createPost}
                onAddFeedback={_viewModel.addFeedback}
                onSendFeedback={_viewModel.sendFeedback}
              />
            </div>
            <div>
              <DiscordCard onJoin={_viewModel.joinDiscord} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Motion>

<style>
  .tabs {
    display: flex;
    height: 37px;
    border-bottom: 2px solid var(--text-secondary-900);
    background-color: var(--bg-secondary-900);
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
