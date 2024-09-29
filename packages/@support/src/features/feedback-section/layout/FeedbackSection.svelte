<script lang="ts">
  import { user } from "@app/store/auth.store";
  import { CommentIcon, SortIcon } from "@sparrow/library/icons";
  import { UpvoteIcon } from "../../../common/components";
  import FeedbackPost from "./FeedbackPost.svelte";
  import FeedbackDefault from "./FeedbackDefault.svelte";
  import { onMount } from "svelte";
  import { SearchIcon } from "@deprecate/assets/app.asset";
  import { Select } from "@sparrow/library/forms";
  import { CategoryIcon, StatusIcon } from "@sparrow/library/icons";
  import {
    FeedbackType,
    FeedbackStatusType,
  } from "../../../common/types/feedback";
  import { TickIcon } from "@sparrow/library/icons";
  import { Loader } from "@sparrow/library/ui";
  import { Debounce } from "@sparrow/common/utils";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  /**
   * @description - Callback for inputting feedback.
   */
  export let onInputFeedback;

  /**
   * @description - Callback for adding feedback.
   */
  export let onAddFeedback;

  /**
   * @description - Function to fetch posts from the server.
   */
  export let fetchPosts;

  /**
   * @description - Callback to retrieve a specific post.
   */
  export let onRetrievePost;

  /**
   * @description - Callback for adding a comment.
   */
  export let onAddComment;

  /**
   * @description - Function to fetch comments for a post.
   */
  export let fetchComments;

  /**
   * @description - Function to create a vote.
   */
  export let createVote;

  /**
   * @description - Function to delete a vote.
   */
  export let deleteVote;

  /**
   * @description - Function to list votes.
   */
  export let listVote;

  /**
   * @description - Tracks if the post is opened from an activity.
   */
  export let isPostopenFromActivity;

  /**
   * @description - Stores the ID of the post.
   */
  export let postId: string;

  /**
   * @description - Function to get Color based on tag status or cateogry status.
   */
  export let getColor;

  export let onUpdateFeedback;

  let feedbackType = "";

  let feedbackStatusType = "";

  let searchTerm = "";

  let currentSort = "trending";

  let posts = [];

  let userInfo: any = {};

  let isLoading = false;

  let status = defaultStaus;

  let isPostopen = isPostopenFromActivity || false;

  const defaultStaus = "open,under review,planned,in progress,complete";

  user.subscribe((value) => {
    userInfo = value;
  });

  /**
   * @description - Fetches posts based on sorting type, search query, and status, then updates the `posts` array.
   *
   * @param {string} sortType - The type of sorting to apply (e.g., "trending", "latest").
   * @param {string} [searchQuery=""] - The search term to filter posts (optional).
   * @param {string} status - The status of the posts to filter (e.g., "open", "in progress").
   */
  const getPosts = async (
    sortType: string,
    searchQuery: string = "",
    status: string,
  ) => {
    currentSort = sortType;
    isLoading = true;
    posts = await fetchPosts(sortType, searchQuery, status);
    isLoading = false;
  };

  /**
   * @description - Handles upvoting action by refreshing the posts with the current sorting, search term, and status.
   */
  const handleUpvote = () => {
    getPosts(currentSort, searchTerm, status);
  };

  /**
   * @description - Handles the change of input in the search bar and fetches posts that match the search query.
   *
   * @param {string} searchQuery - The search term entered by the user.
   */
  const handleInputChange = async (searchQuery: string) => {
    searchTerm = searchQuery;
    await getPosts(currentSort, searchQuery, status); // Fetch posts with search term
  };

  /**
   * @description - Handles changes in the status filter and fetches posts that match the selected status.
   *
   * @param {string} _status - The new status to filter posts by (e.g., "open", "planned").
   */
  const handleStatusChange = async (_status: string) => {
    feedbackStatusType = _status;

    if (_status == "all status") {
      status = defaultStaus;
    } else {
      status = _status;
    }
    await getPosts(currentSort, searchTerm, status);
  };

  /**
   * @description - Handles the change of category and fetches posts that match the selected category.
   *
   * @param {string} selectedCategory - The selected category for filtering posts (e.g., "Feature Request", "Bug").
   */
  const handleCategoryChange = async (selectedCategory) => {
    // debugger;
    feedbackType = selectedCategory;

    if (selectedCategory === FeedbackType.ALL_CATEGORY) {
      // Show all posts if "All Categories" is selected
      await getPosts(currentSort, searchTerm, status);
    } else {
      // Fetch and filter posts by the selected category
      isLoading = true;
      const listPosts = await getPosts(currentSort, searchTerm, status);

      posts = listPosts?.filter((post) => {
        return post?.category?.name === selectedCategory;
      });
      isLoading = false;
    }
  };

  /**
   * @description - Debounced function for handling input changes to avoid frequent API calls.
   * Calls `handleInputChange` with a delay of 1000ms.
   */
  const handleInputChangeDebounced = new Debounce().debounce(
    handleInputChange,
    1000,
  );

  /**
   * @description - Executes when the component is mounted. Fetches the initial set of posts and resets the `isPostopenFromActivity` flag.
   */

  onMount(async () => {
    getPosts(currentSort, searchTerm, status);
    isPostopenFromActivity = false;
  });
</script>

<div style="padding:20px;">
  <FeedbackDefault {onAddFeedback} {userInfo} {onInputFeedback} />
  {#if !isPostopen}
    <div
      class="d-flex"
      style=" margin-top:38px; justify-content: space-between;"
    >
      <div>
        <div
          class={`d-flex search-input-container rounded py-1 px-2 mb-2`}
          on:click={() => {
            MixpanelEvent(Events.Feedback_Search);
          }}
        >
          <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
          <input
            type="text"
            id="search-input"
            class={`bg-transparent w-100 border-0 my-auto`}
            placeholder="Search updates"
            on:input={(e) => {
              handleInputChangeDebounced(e.target.value);
            }}
          />
        </div>
      </div>
      <div class="d-flex" style="gap:15px;">
        <div>
          <Select
            iconRequired={true}
            data={[
              {
                name: "Feature Request",
                id: FeedbackType.FEATURE_REQUEST,
              },
              {
                name: "UX Improvement",
                id: FeedbackType.UI_IMPROVEMENT,
              },
              {
                name: "Bugs",
                id: FeedbackType.BUG,
              },
              {
                name: "All Categories",
                id: FeedbackType.ALL_CATEGORY,
              },
            ]}
            icon={CategoryIcon}
            onclick={(id = "") => {
              feedbackType = id;
              handleCategoryChange(id);
              MixpanelEvent(Events.Feedback_Categories_Filter);
            }}
            titleId={feedbackType}
            zIndex={499}
            disabled={false}
            borderType={"none"}
            borderActiveType={"none"}
            borderHighlight={"hover-active"}
            headerHighlight={"hover-active"}
            headerHeight={"26px"}
            minBodyWidth={"150px"}
            minHeaderWidth={"150px"}
            maxHeaderWidth={"200px"}
            borderRounded={"2px"}
            headerTheme={"violet2"}
            bodyTheme={"violet"}
            placeholderText={"Categories"}
            menuItem={"v2"}
            headerFontSize={"10px"}
            isDropIconFilled={true}
            position={"absolute"}
          />
        </div>
        <div>
          <Select
            data={[
              {
                name: "Open",
                id: FeedbackStatusType.OPEN,
              },
              {
                name: "Completed",
                id: FeedbackStatusType.COMPLETED,
              },
              {
                name: "In Progress",
                id: FeedbackStatusType.IN_PROGRESS,
              },
              {
                name: "Planned",
                id: FeedbackStatusType.PLANNED,
              },
              {
                name: "Under review",
                id: FeedbackStatusType.UNDER_REVIEW,
              },
              {
                name: "All Status",
                id: FeedbackStatusType.ALL_STATUS,
              },
            ]}
            onclick={(id = "") => {
              handleStatusChange(id);
              MixpanelEvent(Events.Feedback_Status_Filter);
            }}
            titleId={feedbackStatusType}
            placeholderText={"Status"}
            id={"feeds"}
            zIndex={499}
            disabled={false}
            iconRequired={true}
            icon={StatusIcon}
            borderType={"none"}
            borderActiveType={"none"}
            borderHighlight={"hover-active"}
            headerHighlight={"hover-active"}
            headerHeight={"26px"}
            minBodyWidth={"150px"}
            minHeaderWidth={"150px"}
            maxHeaderWidth={"200px"}
            borderRounded={"2px"}
            headerTheme={"violet2"}
            bodyTheme={"violet"}
            menuItem={"v2"}
            headerFontSize={"10px"}
            isDropIconFilled={true}
            position={"absolute"}
            maxBodyHeight={"205px"}
          />
        </div>
      </div>
    </div>

    <div class="d-flex" style=" height:100%; margin-top:51px; ">
      <div style="width:187px; margin-right:28px; ">
        <div>
          <SortIcon width={"12px"} height={"8px"} />
          <span
            class="text-fs-13"
            style="padding-left: 8px; padding-top:4px ; font-weight:500;"
          >
            Sort By</span
          >
        </div>
        <div
          class="d-flex flex-column"
          style="align-items: baseline; gap:10px; margin-top:13px; "
        >
          <button
            on:click={() => {
              getPosts("trending", searchTerm, status);
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between w-100"
            class:active={currentSort === "trending"}
          >
            <span class="text-fs-13">Trending</span>
            {#if currentSort === "trending"}
              <TickIcon
                height={"14px"}
                width={"14px"}
                color={"var(--icon-primary-300)"}
              />
            {/if}
          </button>

          <button
            on:click={() => {
              getPosts("newest", searchTerm, status);
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between w-100"
            class:active={currentSort === "newest"}
          >
            <span class="text-fs-13">Now</span>
            {#if currentSort === "newest"}
              <TickIcon
                height={"14px"}
                width={"14px"}
                color={"var(--icon-primary-300)"}
              />
            {/if}
          </button>

          <button
            on:click={() => {
              getPosts("score", searchTerm, status);
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between w-100"
            class:active={currentSort === "score"}
          >
            <span class="text-fs-13">Top</span>
            {#if currentSort === "score"}
              <TickIcon
                height={"14px"}
                width={"14px"}
                color={"var(--icon-primary-300)"}
              />
            {/if}
          </button>
        </div>
      </div>

      {#if isLoading}
        <div style="width: 77%;">
          <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
        </div>
      {:else if posts?.length > 0}
        <div
          class="posts d-flex flex-column"
          style="gap:26px; width:calc(100% - 187px );"
        >
          {#each posts as post}
            <div
              style="display: flex; flex-direction: column; background-color: #151515; padding: 20px;border-radius:2px;"
            >
              <div
                style="display: flex; justify-content: space-between; align-items: flex-start;"
              >
                <div style="flex: 1;">
                  <div
                    class="title"
                    on:click={async () => {
                      postId = post?.id;
                      isPostopen = true;
                      MixpanelEvent(Events.Feedback_Post);
                    }}
                  >
                    {post?.title}
                  </div>
                  <div
                    style="height: 16px; display: flex; align-items: center;"
                  >
                    <span
                      class="category mt-2 text-fs-10"
                      style="color:{getColor(post?.status)
                        .fontColor}; border:0.2px solid {getColor(post?.status)
                        .fontColor}; "
                    >
                      {post?.status
                        ? post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)
                        : ""}
                    </span>
                  </div>
                </div>
                <div
                  style="cursor:pointer"
                  on:click={() => {
                    MixpanelEvent(Events.Upvote_Post);
                  }}
                >
                  <UpvoteIcon
                    isPostLiked={post.isPostLiked}
                    {handleUpvote}
                    postID={post.id}
                    likePost={createVote}
                    dislikePost={deleteVote}
                    upvote={post?.score}
                  />
                </div>
              </div>

              <div style="margin-top: 10px; flex: 1;">
                <p
                  class="text-fs-14"
                  style="color: var(--text-secondary-1000); margin: 0; padding-top:10px;"
                >
                  {post?.details}
                </p>
              </div>

              <div
                style="display: flex; align-items: center; margin-top: 10px; gap:5px;"
              >
                <span>
                  <CommentIcon
                    width={"15px"}
                    height={"13.95px"}
                    color={"var(--icon-secondary-950)"}
                  />
                </span>
                <span style=" font-size: 13px;">{post?.commentCount}</span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p
          class=" text-fs-12 mb-0 text-center"
          style=" margin-left:250px; margin-top:45px; font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
        >
          No Result Found
        </p>
      {/if}
    </div>
  {/if}

  {#if isPostopen}
    <FeedbackPost
      bind:postId
      bind:isPostopen
      {onRetrievePost}
      {userInfo}
      {onAddComment}
      {fetchComments}
      {handleUpvote}
      {onUpdateFeedback}
      {getColor}
    />
  {/if}
</div>

<style>
  .search-input-container {
    background: var(--bg-tertiary-400);
    width: 20vw;
    font-size: 12px;
    height: 26px;
    position: relative;
    border: 1px solid transparent;
  }
  .search-input-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  #search-input {
    padding-bottom: 5px !important;
  }
  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
  .title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 5px;
    color: var(--text-secondary-100);
  }
  .title:hover {
    text-decoration: underline;
    cursor: pointer;
    color: var(--text-primary-300);
  }

  .category {
    background-color: #171302;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 16px;
  }
  .sort-buttons {
    color: var(--text-secondary-550) !important;
    background: none !important;
    outline: none !important;
    border: none !important;
    font-weight: 500;
  }

  .sort-buttons:hover {
    color: var(--text-primary-300) !important;
  }

  .sort-buttons:focus-within {
    color: var(--text-primary-300) !important;
  }

  .tick-icon {
    display: none;
  }

  /* When a button has the 'active' class */
  .sort-buttons.active {
    color: var(--text-primary-300) !important;
  }

  .sort-buttons.active .tick-icon {
    display: revert;
  }
</style>
