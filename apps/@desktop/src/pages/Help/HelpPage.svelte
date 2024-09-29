<script>
  import {
    AddFeedback,
    DiscordCard,
    FeedbackSection,
    Community,
  } from "@sparrow/support/features";
  import {
    ActivityIcon,
    DocIcon,
    GroupIcon,
    RoadmapIcon,
    UpdateIcon,
  } from "@sparrow/library/icons";
  import { DiscordPost } from "@sparrow/support/features";
  import HelpPageViewModel from "./HelpPage.ViewModel";
  import { onMount } from "svelte";
  import { Motion } from "svelte-motion";
  import { pagesMotion } from "@app/constants";
  import { Roadmap } from "@sparrow/support/features";
  import { ReleaseNotes } from "@sparrow/support/features";
  import { ActivitySection } from "@sparrow/support/features";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  /**
   * @description - Prevents the default context menu from appearing on right-click.
   * @param event - The event triggered by a right-click.
   */
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  /**
   * @description - Initializes the HelpPageViewModel instance.
   */
  const _viewModel = new HelpPageViewModel();

  /**
   * @description - Holds the currently active tab. Default is "roadmap".
   */
  let activeTab = "roadmap";

  /**
   * @description - Stores the release notes data as an array.
   */
  let releaseNotesData = [];

  /**
   * @description - Tracks if a post was opened from the activity tab.
   */
  let isPostopenFromActivity = false;

  /**
   * @description - Stores the ID of the currently selected post.
   */
  let postId = "";

  /**
   * @description - Sets the active tab, preventing "faq" from being selected.
   * @param tab - The name of the tab to set as active.
   */
  const setActiveTab = (tab) => {
    if (tab !== "faq") {
      activeTab = tab;
    }
  };

  /**
   * @description - Sets the post ID and marks the activity as opened from a post. Prevents "faq" from being selected.
   * @param tab - The name of the tab to set as active.
   * @param postID - The ID of the post to set.
   */
  const setPostId = (tab, postID) => {
    if (tab !== "faq") {
      isPostopenFromActivity = true;
      activeTab = tab;
      postId = postID;
    }
  };

  /**
   * Get the font and background color based on the status.
   *
   * @param {string} status - The status value to determine the colors for.
   * @returns {{ fontColor: string, backgroundColor: string }} An object containing the font and background colors.
   */
  const getColor = (status) => {
    if (status === "new" || status === "open") {
      return { fontColor: "#1193F0", backgroundColor: "#050938" };
    }
    if (status === "fixed" || status === "in progress") {
      return { fontColor: "#DF77F9", backgroundColor: "#DF77F9" };
    }
    if (status === "improved" || status === "complete") {
      return { fontColor: "#69D696", backgroundColor: "#031B0D" };
    }
    if (status === "planned") {
      return { fontColor: "#FFE47E", backgroundColor: "#171302" };
    }
    if (status === "under review") {
      return { fontColor: "#FBA574", backgroundColor: "#1C1405" };
    }
    return { fontColor: "white", backgroundColor: "black" };
  };

  /**
   * @description - Fetches release notes when the component is mounted and sets the appropriate active tab based on the current URL path.
   * - Fetches and sets `releaseNotesData`.
   * - Checks the current URL path and sets `activeTab` to either "updates" or "roadmap".
   */
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
            MixpanelEvent(Events.Roadmap_Tab);
          }}
        >
          <RoadmapIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "roadmap"
              ? "var(--text-primary-300)"
              : "var(--text-secondary-100)"}
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
            MixpanelEvent(Events.Feedback_Tab);
          }}
        >
          <DocIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "feedback"
              ? "var(--text-primary-300)"
              : "var(--text-secondary-100)"}
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
            MixpanelEvent(Events.Updates_Tab);
          }}
        >
          <UpdateIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "updates"
              ? "var(--text-primary-300)"
              : "var(--text-secondary-100)"}
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
            MixpanelEvent(Events.Community_Tab);
          }}
        >
          <GroupIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "community"
              ? "var(--text-primary-300)"
              : "var(--text-secondary-100)"}
          />
          Community
        </div>

        <div
          class="tab align-items-center gap-2 {activeTab === 'myActivity'
            ? 'active'
            : ''}"
          on:click={() => {
            setActiveTab("myActivity");
            isPostopenFromActivity = false;
            MixpanelEvent(Events.Activity_Tab);
          }}
        >
          <ActivityIcon
            height={"17px"}
            width={"17px"}
            color={activeTab === "myActivity"
              ? "var(--text-primary-300)"
              : "var(--text-secondary-100)"}
          />
          My Activity
        </div>

        <div style="width: 400px;"></div>
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
                onUpdateFeedback={_viewModel.updatePost}
                fetchPosts={_viewModel.getListOfPOsts}
                onRetrievePost={_viewModel.retrievePostData}
                onAddComment={_viewModel.addComment}
                fetchComments={_viewModel.listComments}
                createVote={_viewModel.CreateVote}
                deleteVote={_viewModel.deleteVote}
                listVote={_viewModel.listVote}
                {getColor}
                bind:postId
                bind:isPostopenFromActivity
              />
            {:else if activeTab === "updates"}
              <ReleaseNotes listChangeLog={_viewModel.listChangeLog} />
            {:else if activeTab === "roadmap"}
              <Roadmap
                {setPostId}
                fetchPosts={_viewModel.getListOfPOsts}
                {getColor}
              />
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
                listPostsComments={_viewModel.listComments}
                {getColor}
                {setPostId}
              />{/if}
          </div>
        </div>
        <div style="width: 274px;" class="ps-2 pe-3 pt-3 pb-2 h-100">
          <div class="h-100 pe-2" style="overflow:auto;">
            <div class="mb-3">
              <AddFeedback
                onInputFeedback={_viewModel.createPost}
                onAddFeedback={_viewModel.addFeedback}
                selectId={"help"}
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
    border-bottom: 2px solid var(--border-secondary-900);
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
    border-bottom: 4px solid var(--border-primary-300);
  }
</style>
