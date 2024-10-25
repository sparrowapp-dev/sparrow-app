<script lang="ts">
  import { user } from "@app/store/auth.store";
  import {
    CommentIcon,
    CrossIcon,
    SortIcon,
    TickIcon,
  } from "@sparrow/library/icons";
  import { Upvote } from "../../../components";
  import FeedbackPost from "./FeedbackPost.svelte";
  import FeedbackDefault from "./FeedbackDefault.svelte";
  import { onMount } from "svelte";
  import { SearchIcon } from "@sparrow/library/assets";
  import { Select } from "@sparrow/library/forms";
  import { CategoryIcon, StatusIcon } from "@sparrow/library/icons";
  import { FeedbackType, FeedbackStatusType } from "../../../types/feedback";
  import { Loader } from "@sparrow/library/ui";
  import { Debounce } from "@sparrow/common/utils";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
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

  let feedbackType = FeedbackType.ALL_CATEGORY;

  let feedbackStatusType = FeedbackStatusType.ALL_STATUS;

  let searchTerm = "";

  let currentSort = "trending";

  let posts = [];

  let userInfo: any = {};

  let isLoading = false;

  let status = defaultStaus;

  let isPostopen = isPostopenFromActivity || false;

  let limit = 10; // Define your limit for how many posts to load each time
  let skip = 0; // Initialize skip to 0 at the beginning

  const defaultStaus = "open,under review,planned,in progress,complete";

  user.subscribe((value) => {
    userInfo = value;
  });

  let showLoading = true;

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
    limit: number = 10,
    skip: number = 0,
  ) => {
    currentSort = sortType;
    if (showLoading) {
      isLoading = true;
    }
    const newPosts = await fetchPosts(
      sortType,
      searchQuery,
      status,
      "",
      limit,
      skip,
    );
    showLoading = false;
    // if (
    //   feedbackType != FeedbackType.ALL_CATEGORY ||
    //   feedbackStatusType != FeedbackStatusType.ALL_STATUS ||
    //   searchTerm != "" ||
    //   currentSort != "trending"
    // ) {
    //   // posts = newPosts;
    // } else {
    // }
    posts = [...posts, ...newPosts]; // Append new posts to the existing posts
    isLoading = false;
  };

  /**
   * @description - Handles upvoting action by refreshing the posts with the current sorting, search term, and status.
   */
  const handleUpvote = () => {
    getPosts(currentSort, searchTerm, status, limit, skip);
  };

  /**
   * @description - Handles the change of input in the search bar and fetches posts that match the search query.
   *
   * @param {string} searchQuery - The search term entered by the user.
   */
  const handleInputChange = async (searchQuery: string) => {
    searchTerm = searchQuery;
    posts = [];
    skip = 0;
    showLoading = true;
    isPostFetching = true;
    await getPosts(currentSort, searchQuery, status, limit, skip); // Fetch posts with search term
    isPostFetching = false;
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
    posts = [];
    isPostFetching = true;
    skip = 0;
    showLoading = true;
    await getPosts(currentSort, searchTerm, status, limit, skip);
    isPostFetching = false;
  };

  /**
   * @description - Handles the change of category and fetches posts that match the selected category.
   *
   * @param {string} selectedCategory - The selected category for filtering posts (e.g., "Feature Request", "Bug").
   */
  const handleCategoryChange = async (selectedCategory) => {
    feedbackType = selectedCategory;
    if (selectedCategory === FeedbackType.ALL_CATEGORY) {
      // Show all posts if "All Categories" is selected
      isPostFetching = true;
      posts = [];
      skip = 0;
      showLoading = true;
      await getPosts(currentSort, searchTerm, status, limit, skip);
      isPostFetching = false;
    } else {
      // Fetch and filter posts by the selected category
      isLoading = true;
      posts = [];
      isPostFetching = true;
      skip = 0;
      showLoading = true;
      await getPosts(currentSort, searchTerm, status, limit, skip);
      isPostFetching = false;

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

  // Function to load more updates
  const loadMoreUpdates = async () => {
    if (!isPostopen || searchTerm.length > 0) {
      skip = posts.length;
      await getPosts(currentSort, searchTerm, status, limit, skip);
    }
  };

  let scrollableContainer: HTMLDivElement;
  let isPostFetching = false;
  // Event handler for scrolling
  const handleScroll = async () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (!isPostFetching) {
        isPostFetching = true;
        await loadMoreUpdates();
        isPostFetching = false;
      }
    }
  };

  /**
   * @description - Executes when the component is mounted. Fetches the initial set of posts and resets the `isPostopenFromActivity` flag.
   */
  onMount(async () => {
    getPosts(currentSort, searchTerm, status, limit, skip);
    isPostopenFromActivity = false;
  });

  onMount(() => {
    scrollableContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollableContainer.removeEventListener("scroll", handleScroll);
    };
  });

  const handleBackButton = () => {
    isPostFetching = true;
    skip = 0;
    posts = [];
    showLoading = true;
  };
</script>

<div
  style="padding:20px; overflow:auto "
  class="h-100"
  bind:this={scrollableContainer}
>
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
          <SearchIcon
            width={14}
            height={14}
            color={"var(--icon-secondary-200)"}
            classProp={`my-auto me-1`}
          />
          <input
            type="text"
            id="search-input"
            class={`bg-transparent w-100 ms-1 border-0 my-auto`}
            placeholder="Search updates"
            on:input={(e) => {
              handleInputChangeDebounced(e.target.value);
            }}
            bind:value={searchTerm}
          />

          {#if searchTerm.length != 0}
            <div
              style="cursor: pointer;"
              class="clear-icon"
              on:click={() => {
                searchTerm = "";
                handleInputChangeDebounced(searchTerm);
              }}
            >
              <CrossIcon
                height="16px"
                width="12px"
                color="var(--icon-secondary-300)"
              />
            </div>
          {/if}
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
                name: "UI Improvement",
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
            headerFontSize={"12px"}
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
                name: "Under Review",
                id: FeedbackStatusType.UNDER_REVIEW,
              },
              {
                name: "Planned",
                id: FeedbackStatusType.PLANNED,
              },
              {
                name: "In Progress",
                id: FeedbackStatusType.IN_PROGRESS,
              },
              {
                name: "Complete",
                id: FeedbackStatusType.COMPLETED,
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
            headerFontSize={"12px"}
            isDropIconFilled={true}
            position={"absolute"}
            maxBodyHeight={"205px"}
          />
        </div>
      </div>
    </div>

    <div
      class="d-flex gap-5 justify-content-between"
      style="  margin-top:51px; "
    >
      <div style="width:129px;  ">
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
            on:click={async () => {
              isPostFetching = true;
              skip = 0;
              posts = [];
              showLoading = true;
              await getPosts("trending", searchTerm, status, limit, skip);
              isPostFetching = false;
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between w-100"
            class:active={currentSort === "trending"}
          >
            <div><span class="text-fs-13">Trending</span></div>
            <div class="tick-icon">
              <TickIcon
                height={"12px"}
                width={"12px"}
                color={"var(--icon-primary-300)"}
              />
            </div>
          </button>

          <button
            on:click={async () => {
              isPostFetching = true;
              skip = 0;
              posts = [];
              showLoading = true;
              await getPosts("newest", searchTerm, status, limit, skip);
              isPostFetching = false;
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between w-100"
            class:active={currentSort === "newest"}
          >
            <span class="text-fs-13">New</span>
            <div class="tick-icon">
              <TickIcon
                height={"12px"}
                width={"12px"}
                color={"var(--icon-primary-300)"}
              />
            </div>
          </button>

          <button
            on:click={async () => {
              isPostFetching = true;
              skip = 0;
              posts = [];
              showLoading = true;
              await getPosts("score", searchTerm, status, limit, skip);
              isPostFetching = false;
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between w-100"
            class:active={currentSort === "score"}
          >
            <span class="text-fs-13">Top</span>
            <div class="tick-icon">
              <TickIcon
                height={"12px"}
                width={"12px"}
                color={"var(--icon-primary-300)"}
              />
            </div>
          </button>
        </div>
      </div>

      {#if isLoading}
        <div style="" class="w-100">
          <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
        </div>
      {:else if posts?.length > 0}
        <div class="posts d-flex flex-column w-100" style="gap:26px; ">
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
                      handleBackButton();
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
                      {post.status
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </span>
                  </div>
                </div>
                <div
                  style="cursor:pointer"
                  on:click={() => {
                    MixpanelEvent(Events.Upvote_Post);
                  }}
                >
                  <Upvote
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
        <div class="w-100">
          <p
            class=" text-fs-12 mb-0 text-center"
            style="  margin-top:45px; font-weight:500;color: var(--text-secondary-550); letter-spacing: 0.5px;"
          >
            No result found.
          </p>
        </div>
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
      likePost={createVote}
      dislikePost={deleteVote}
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
