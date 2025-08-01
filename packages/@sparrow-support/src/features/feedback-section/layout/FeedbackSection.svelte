<script lang="ts">
  import { user } from "@app/store/auth.store";
  import {
    CommentIcon,
    CommentRegular,
    CrossIcon,
    DiversityRegular,
    FilterRegular,
    HourGlassRegular,
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
  import { Loader, Tag } from "@sparrow/library/ui";
  import { Debounce } from "@sparrow/common/utils";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Search } from "@sparrow/library/forms";
  import { SparrowLogo } from "@sparrow/common/images";

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

  let currentCategory = "";
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
    currentCategory: string,
    limit: number = 10,
    skip: number = 0,
  ) => {
    console.log("This is skop ", skip);
    currentSort = sortType;
    if (showLoading) {
      isLoading = true;
    }
    const newPosts = await fetchPosts(
      sortType,
      searchQuery,
      status,
      "",
      currentCategory,
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
    getPosts(currentSort, searchTerm, status, currentCategory, limit, skip);
    skip = skip + 10;
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
    await getPosts(
      currentSort,
      searchQuery,
      status,
      currentCategory,
      limit,
      skip,
    ); // Fetch posts with search term
    isPostFetching = false;
    skip = skip + 10;
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
    await getPosts(
      currentSort,
      searchTerm,
      status,
      currentCategory,
      limit,
      skip,
    );
    skip = skip + 10;
    isPostFetching = false;
  };

  /**
   * @description - Handles the change of category and fetches posts that match the selected category.
   *
   * @param {string} selectedCategory - The selected category for filtering posts (e.g., "Feature Request", "Bug").
   */
  const handleCategoryChange = async (selectedCategory) => {
    feedbackType = selectedCategory;
    currentCategory =
      selectedCategory === FeedbackType.ALL_CATEGORY ? "" : selectedCategory;
    if (selectedCategory === FeedbackType.ALL_CATEGORY) {
      // Show all posts if "All Categories" is selected
      isPostFetching = true;
      posts = [];
      skip = 0;
      showLoading = true;
      await getPosts(currentSort, searchTerm, status, "", limit, skip);
      skip = skip + 10;
      isPostFetching = false;
    } else {
      // Fetch and filter posts by the selected category
      isLoading = true;
      posts = [];
      isPostFetching = true;
      skip = 0;
      showLoading = true;
      await getPosts(
        currentSort,
        searchTerm,
        status,
        currentCategory,
        limit,
        skip,
      );
      skip = skip + 10;
      isPostFetching = false;
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
      // skip = posts.length;
      await getPosts(
        currentSort,
        searchTerm,
        status,
        currentCategory,
        limit,
        skip,
      );

      skip = skip + 10;
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
    getPosts(currentSort, searchTerm, status, currentCategory, limit, skip);
    skip = skip + 10;
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
      style=" margin-top:20px; justify-content: space-between;"
    >
      <div>
        <div
          class={`d-flex align-items-center rounded mb-2`}
          on:click={() => {
            MixpanelEvent(Events.Feedback_Search);
          }}
        >
          <Search
            variant="primary"
            size="small"
            id="search-input"
            placeholder="Search updates"
            bind:value={searchTerm}
            on:input={() => {
              handleInputChangeDebounced(searchTerm);
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
            icon={DiversityRegular}
            iconColor={"var(--icon-primary-300)"}
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
            headerHeight={"28px"}
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
            variant={"secondary"}
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
            icon={HourGlassRegular}
            iconColor={"var(--icon-primary-300)"}
            borderType={"none"}
            borderActiveType={"none"}
            borderHighlight={"hover-active"}
            headerHighlight={"hover-active"}
            headerHeight={"28px"}
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
            variant={"secondary"}
          />
        </div>
      </div>
    </div>

    <div
      class="d-flex gap-5 justify-content-between"
      style="  margin-top:24px; "
    >
      <div style="width:129px;  ">
        <div class="d-flex align-items-center ps-1">
          <FilterRegular />
          <span
            class="text-ds-font-size-12"
            style="padding-left: 8px; font-weight:500;"
          >
            Sort By</span
          >
        </div>
        <div
          class="d-flex flex-column ps-1"
          style="align-items: baseline; gap:10px; margin-top:13px; "
        >
          <button
            on:click={async () => {
              isPostFetching = true;
              skip = 0;
              posts = [];
              showLoading = true;
              await getPosts(
                "trending",
                searchTerm,
                status,
                currentCategory,
                limit,
                skip,
              );
              skip = skip + 10;
              isPostFetching = false;
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between"
            class:active={currentSort === "trending"}
          >
            <div>
              <span
                class="text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-130"
                >Trending</span
              >
            </div>
            {#if currentSort === "trending"}
              <div class="d-flex align-items-center">
                <TickIcon
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-ds-primary-300)"}
                />
              </div>
            {/if}
          </button>

          <button
            on:click={async () => {
              isPostFetching = true;
              skip = 0;
              posts = [];
              showLoading = true;
              await getPosts(
                "newest",
                searchTerm,
                status,
                currentCategory,
                limit,
                skip,
              );
              skip = skip + 10;
              isPostFetching = false;
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between mt-1"
            class:active={currentSort === "newest"}
          >
            <span
              class="text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-130"
              >New</span
            >
            {#if currentSort === "newest"}
              <div class="d-flex align-items-center">
                <TickIcon
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-primary-300)"}
                />
              </div>
            {/if}
          </button>

          <button
            on:click={async () => {
              isPostFetching = true;
              skip = 0;
              posts = [];
              showLoading = true;
              await getPosts(
                "score",
                searchTerm,
                status,
                currentCategory,
                limit,
                skip,
              );
              skip = skip + 10;
              isPostFetching = false;
              MixpanelEvent(Events.Feedback_SortBy_Filter);
            }}
            class="sort-buttons d-flex align-items-center justify-content-between mt-2"
            class:active={currentSort === "score"}
          >
            <span
              class="text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-130"
              >Top</span
            >
            {#if currentSort === "score"}
              <div class="d-flex align-items-center">
                <TickIcon
                  height={"12px"}
                  width={"12px"}
                  color={"var(--icon-primary-300)"}
                />
              </div>
            {/if}
          </button>
        </div>
      </div>

      {#if isLoading}
        <div style="" class="w-100">
          <Loader loaderSize={"20px"} loaderMessage="Loading..." />
        </div>
      {:else if posts?.length > 0}
        <div class="posts d-flex flex-column w-100" style="gap:26px; ">
          {#each posts as post}
            <div
              class="py-3"
              style="display: flex; flex-direction: column; background-color: var(--bg-ds-surface-700); padding: 15px; border-radius:6px;"
            >
              <div
                style="display: flex; justify-content: space-between; align-items: flex-start;"
              >
                <div style="flex: 1;">
                  <div
                    class="title text-ds-font-size-16 text-ds-font-weight-semi-bold"
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
                    <Tag
                      type={getColor(post?.status)}
                      text={post?.status || ""}
                    />
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
                  class="text-ds-font-size-14"
                  style="color: var(--text-ds-neutral-200); margin: 0;"
                >
                  {post?.details}
                </p>
              </div>

              <div
                class="ps-1"
                style="display: flex; align-items: center; margin-top: 10px; gap:5px;"
              >
                <span>
                  <CommentRegular size={"15px"} />
                </span>
                <span style="font-size: 13px;">{post?.commentCount}</span>
              </div>
            </div>
          {/each}
        </div>
      {:else if searchTerm && posts?.length < 0}
        <div class="w-100">
          <p
            class="text-ds-font-size-14 mb-0 text-center"
            style="  margin-top: 24px; color: var(--text-ds-neutral-400); letter-spacing: 0.5px;"
          >
            No result found.
          </p>
        </div>
      {:else}
        <div
          class="h-100 w-100 d-flex justify-content-center align-items-center"
          style="flex: 1; min-height: calc(100vh - 400px);"
        >
          <div
            class="d-flex"
            style="flex-direction:column; align-items: center;"
          >
            <SparrowLogo />
            <p
              class="mx-1 text-ds-font-size-14 text-ds-font-weight-medium mb-0 text-center mt-4"
              style="color: var(--text-ds-neutral-400);"
            >
              Currently, there are no posts.
            </p>
          </div>
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
    margin-bottom: 8px;
    color: var(--text-secondary-100);
  }
  .title:hover {
    color: var(--text-ds-primary-300);
    cursor: pointer;
  }

  .title:active {
    color: var(--text-primary-300);
    text-decoration: underline;
  }

  .category {
    background-color: #171302;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 16px;
  }
  .sort-buttons {
    color: var(--text-ds-neutral-50) !important;
    background: none !important;
    outline: none !important;
    border: none !important;
    font-weight: 500;
    width: 108px !important;
  }

  .sort-buttons:hover {
    color: var(--text-ds-primary-300) !important;
  }

  .sort-buttons:focus-within {
    color: var(--text-ds-primary-300) !important;
  }

  .tick-icon {
    display: none;
  }

  /* When a button has the 'active' class */
  .sort-buttons.active {
    color: var(--text-ds-primary-300) !important;
  }

  .sort-buttons.active .tick-icon {
    display: revert;
  }
</style>
