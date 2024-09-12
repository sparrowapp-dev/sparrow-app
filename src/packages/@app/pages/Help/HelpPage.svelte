<script>
  import {
    AddFeedback,
    DiscordCard,
    FeedbackSection,
    Community,
  } from "@support/features";
  import {
    ActivityIcon,
    DocIcon,
    GroupIcon,
    RoadmapIcon,
    UpdateIcon,
  } from "@library/icons";
  import DiscordPost from "@support/features/discord-post/layout/DiscordPost.svelte";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  import { onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { pagesMotion } from "@app/constants";
  import Roadmap from "@support/features/roadmap/layout/Roadmap.svelte";
  import { ReleaseNotes } from "@support/features/release-notes/layout";
  import ActivitySection from "@support/features/activity-section/ActivitySection.svelte";

  const _viewModel = new HelpPageViewModel();

  let listVotes = [];

  document.addEventListener("contextmenu", (event) => event.preventDefault());

  let parentPostOpen = false;
  let isPostopenFromActivity = false;
  let postIdFromActivity;
  let activeTab = "roadmap";

  function setActiveTab(tab) {
    if (tab !== "faq") {
      activeTab = tab;
    }
  }

  function setActiveTabFromActivity(tab, postID) {
    if (tab !== "faq") {
      // Disable FAQ tab
      isPostopenFromActivity = true;
      activeTab = tab;
      postIdFromActivity = postID;
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
      activeTab = "roadmap";
    }
  });

  let postId = "";

  function setPostId(tab, postID) {
    if (tab !== "faq") {
      isPostopenFromActivity = true;
      activeTab = tab;
      postId = postID;
    }
  }
</script>

<Motion {...pagesMotion} let:motion>
  <div class="h-100" use:motion>
    <div class="h-100 d-flex flex-column">
      <!----Help Navigator-->
      <div class="tabs px-3">
        <div
          class="tab d-flex align-items-center gap-2 {activeTab === 'roadmap'
            ? 'active'
            : ''}"
          on:click={() => {
            setActiveTab("roadmap");
            isPostopenFromActivity = false;
          }}
        >
          <RoadmapIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "roadmap"
              ? "var(--text-primary-300)"
              : "var( --white-color )"}
          />
          Roadmap
        </div>
        <div
          class="tab align-items-center gap-2 {activeTab === 'feedback'
            ? 'active'
            : ''}"
          on:click={() => {
            setActiveTab("feedback");
            isPostopenFromActivity = false;
          }}
        >
          <DocIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "feedback"
              ? "var(--text-primary-300)"
              : "var( --white-color )"}
          />
          Feedback
        </div>
        <div
          class="tab align-items-center gap-2 {activeTab === 'updates'
            ? 'active'
            : ''}"
          on:click={() => {
            setActiveTab("updates");
            isPostopenFromActivity = false;
          }}
        >
          <UpdateIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "updates"
              ? "var(--text-primary-300)"
              : "var( --white-color )"}
          />
          Updates
        </div>
        <div
          class="tab align-items-center gap-2 {activeTab === 'community'
            ? 'active'
            : ''}"
          on:click={() => {
            setActiveTab("community");
            isPostopenFromActivity = false;
          }}
        >
          <GroupIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "community"
              ? "var(--text-primary-300)"
              : "var( --white-color )"}
          />
          Community
        </div>

        <div
          class="tab align-items-center gap-2 {activeTab === 'myActivity'
            ? 'active'
            : ''}"
          on:click={() => {
            setActiveTab("myActivity");
            isPostPostOpen = false;
          }}
        >
          <ActivityIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "myActivity"
              ? "var(--text-primary-300)"
              : "var( --white-color )"}
          />
          My Activity
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
                fetchPosts={_viewModel.getListOfPOsts}
                onRetrievePost={_viewModel.retrievePostData}
                onAddComment={_viewModel.addComment}
                fetchComments={_viewModel.listComments}
                createVote={_viewModel.CreateVote}
                deleteVote={_viewModel.deleteVote}
                listVote={_viewModel.listVote}
                {postIdFromActivity}
                {parentPostOpen}
                bind:postId
                bind:isPostopenFromActivity
              />
            {:else if activeTab === "updates"}
              <ReleaseNotes listChangeLog={_viewModel.listChangeLog} />
            {:else if activeTab === "roadmap"}
              <Roadmap {setPostId} fetchPosts={_viewModel.getListOfPOsts} />
            {:else if activeTab === "community"}
              <Community />
              <DiscordPost />
            {:else if activeTab === "myActivity"}
              <ActivitySection
                onInputFeedback={_viewModel.createPost}
                onAddFeedback={_viewModel.addFeedback}
                fetchPosts={_viewModel.getUserPosts}
                onRetrievePost={_viewModel.retrievePostData}
                fetchComments={_viewModel.retrieveUserComments}
                fetchLikedPosts={_viewModel.retrieveUserVotes}
                {setActiveTabFromActivity}
              />
            {/if}
          </div>
        </div>
        <div style="width: 274px;" class="ps-2 pe-3 pt-3 pb-2 h-100">
          <div class="h-100 pe-2" style="overflow:auto;">
            <div class="mb-3">
              <AddFeedback
                onInputFeedback={_viewModel.createPost}
                onAddFeedback={_viewModel.addFeedback}
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
