<script lang="ts">
  import { user } from "@app/store/auth.store";
  import {
    ActivityIcon,
    CommentIcon,
    LikeIcon,
    SortIcon,
    TableChart,
  } from "@sparrow/library/icons";
  import { UpvoteIcon } from "@sparrow/support/common/components";
  import FeedbackPost from "../../../features/feedback-section/layout/FeedbackPost.svelte";
  import { onMount } from "svelte";
  import { SearchIcon } from "@deprecate/assets/app.asset";
  import { Select } from "@sparrow/library/forms";
  import { CategoryIcon, StatusIcon } from "@sparrow/library/icons";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import {
    FeedbackStatusType,
    FeedbackType,
  } from "../../../common/types/feedback";
  import { TickIcon } from "@sparrow/library/icons";
  import { IconFallback } from "@sparrow/library/ui";

  import {
    ActivityStatusType,
    ActivityType,
  } from "../../../common/types/activity";
  import { Spinner } from "@sparrow/library/ui";
  import { Loader } from "@sparrow/library/ui";
  import { FormatTime } from "@sparrow/common/utils";
  const formatTimeAgo = new FormatTime().formatTimeAgo;
  import { ArrowOutwardIcon } from "@sparrow/library/icons";

  export let type = FeedbackType.ALL_CATEGORY;
  export let onInputFeedback;
  export let onAddFeedback;
  export let fetchPosts;
  export let onRetrievePost;
  export let fetchComments;
  export let fetchLikedPosts;
  export let listPostsComments;
  export let setPostId;
  export let getColor;

  let currentSort = "newest";
  let posts = [];
  let filteredPosts = [];
  let filteredComments = [];
  let filteredLikedPosts = [];
  let searchTerm = "";
  let userInfo: any = {};
  let comments = [];
  let likedPosts = [];
  let isHovering = null; // Keep track of which comment is being hovered
  let isPostopen = false;
  let activityType = ActivityType.ALL_CATEGORIES;
  let activityStatusType: string = ActivityStatusType.ALL_ACTIVITY;
  const defaultStaus = "all activity";
  let status = defaultStaus;
  let postId = "";
  let loading = false;

  user.subscribe((value) => {
    userInfo = value;
  });

  const getAllData = async () => {
    try {
      loading = true;
      const [postsData, commentsData, likedPostsData] = await Promise.all([
        fetchPosts(currentSort, userInfo._id),
        fetchComments(userInfo._id),
        fetchLikedPosts(userInfo._id),
      ]);

      if (!commentsData || !postsData || !likedPostsData) {
        loading = false;
      }
      posts = postsData?.data?.posts || [];
      comments = commentsData?.data?.comments || [];
      likedPosts = likedPostsData?.data?.votes || [];

      applyAllFilters();
      loading = false;
    } catch (error) {
      loading = false;
    }
  };

  onMount(async () => {
    await getAllData();
  });

  const applyAllFilters = () => {
    let tempPosts = posts
      .filter((post) => {
        if (post.author.email.toLowerCase() === userInfo.email.toLowerCase())
          return true;
        return false;
      })
      .filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    let tempComments = comments
      .filter((post) => {
        if (post.author.email.toLowerCase() === userInfo.email.toLowerCase())
          return true;
        return false;
      })
      .filter((comment) =>
        comment.value.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    let tempLikedPosts = likedPosts
      .filter((post) => {
        if (post.voter.email.toLowerCase() === userInfo.email.toLowerCase())
          return true;
        return false;
      })
      .filter((vote) =>
        vote.post.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    if (activityType !== ActivityType.ALL_CATEGORIES) {
      tempPosts = tempPosts.filter(
        (post) => post?.category?.name === activityType,
      );
      tempLikedPosts = tempLikedPosts.filter(
        (vote) => vote.post.category?.name === activityType,
      );
    }

    if (activityStatusType === ActivityStatusType.POST) {
      tempComments = [];
      tempLikedPosts = [];
    } else if (activityStatusType === ActivityStatusType.COMMENT) {
      tempPosts = [];
      tempLikedPosts = [];
    } else if (activityStatusType === ActivityStatusType.UPVOTED_POSTS) {
      tempPosts = [];
      tempComments = [];
    }

    const sortFunction = (a, b) => {
      if (currentSort === "newest") {
        return new Date(b.created) - new Date(a.created);
      } else if (currentSort === "oldest") {
        return new Date(a.created) - new Date(b.created);
      }
      return 0;
    };

    filteredPosts = tempPosts.sort(sortFunction);
    filteredComments = tempComments.sort(sortFunction);
    filteredLikedPosts = tempLikedPosts.sort(sortFunction);
  };

  const handleInputChange = (searchQuery) => {
    searchTerm = searchQuery;
    applyAllFilters();
  };

  const handleSortChange = async (sortType) => {
    currentSort = sortType;
    applyAllFilters();
  };

  const handleCategoryChange = (selectedCategory) => {
    activityType = selectedCategory;
    applyAllFilters();
  };

  const handleActivityChanges = (selectedStatus) => {
    activityStatusType = selectedStatus;
    applyAllFilters();
  };

  // You can remove these individual filter functions as they're now incorporated into applyAllFilters
  // filterPosts();
  // filterComments();
  // filterLikedPosts();
  // sortPosts();
  // sortComments();
  // sortLikedPosts();
</script>

<div class="container" style="padding: 20px;">
  <div class="mt-0">
    <p style="font-size: 20px; font-weight:700; ">My Activity</p>
    <p class="text-fs-14" style="color: var(--text-secondary-50); ">
      Find all your posts, comments, and likes in one place and easily keep
      track of them.
    </p>
  </div>

  <div
    class="d-flex align-items-center"
    style="justify-content: space-between;"
  >
    <div>
      <div class="d-flex search-input-container rounded px-2 mb-2">
        <SearchIcon width={14} height={14} classProp="my-auto me-3" />
        <input
          type="text"
          id="search-input"
          class="bg-transparent w-100 border-0 my-auto"
          placeholder="Search updates"
          on:input={(e) => handleInputChange(e.target.value)}
        />
      </div>
    </div>
    <div class="d-flex" style="gap: 15px;">
      <div>
        <Select
          iconRequired={true}
          data={[
            { name: "Feature Request", id: ActivityType.FEATURE_REQUEST },
            { name: "UX Improvement", id: ActivityType.UI_IMPROVEMENT },
            { name: "Bugs", id: ActivityType.BUG },
            { name: "All Categories", id: ActivityType.ALL_CATEGORIES },
          ]}
          icon={CategoryIcon}
          on:click={(id = "") => {
            handleCategoryChange(id);
            MixpanelEvent(Events.Activity_Categories_Filter);
          }}
          titleId={activityType}
          placeholderText="Categories"
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
          menuItem={"v2"}
          headerFontSize={"10px"}
          isDropIconFilled={true}
          position={"absolute"}
        />
      </div>
      <div>
        <Select
          id="as"
          data={[
            { name: "Comment", id: ActivityStatusType.COMMENT },
            { name: "Post", id: ActivityStatusType.POST },
            { name: "Upvoted Posts", id: ActivityStatusType.UPVOTED_POSTS },
            { name: "All Activity", id: ActivityStatusType.ALL_ACTIVITY },
          ]}
          onclick={(id = "") => {
            handleActivityChanges(id);
            MixpanelEvent(Events.Activity_Filter);
          }}
          titleId={activityStatusType}
          placeholderText="Status"
          zIndex={499}
          disabled={false}
          icon={TableChart}
          iconRequired={true}
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
        />
      </div>
    </div>
  </div>

  {#if !isPostopen}
    <div class="post-list" style="margin-top: 50px">
      <div class="sidebar">
        <div class="sort">
          <SortIcon width="12px" height="8px" />
          <span>Sort By</span>
        </div>
        <div class="sort-options">
          <button
            on:click={() => {
              handleSortChange("newest");
              MixpanelEvent(Events.Activity_SortBy_Filter);
            }}
            class={`d-flex align-items-center sort-button ${currentSort === "newest" && "selected-sort"}`}
          >
            <span> Newest </span>
            {#if currentSort === "newest" && "selected-sort"}
              <TickIcon
                height={"14px"}
                width={"14px"}
                color={"var(--icon-primary-300)"}
              />
            {/if}
          </button>
          <button
            on:click={() => {
              handleSortChange("oldest");
              MixpanelEvent(Events.Activity_SortBy_Filter);
            }}
            class={`d-flex align-items-center sort-button ${currentSort === "oldest" && "selected-sort"}`}
          >
            <span> Oldest </span>
            {#if currentSort === "oldest" && "selected-sort"}
              <TickIcon
                height={"14px"}
                width={"14px"}
                color={"var(--icon-primary-300)"}
              />
            {/if}
          </button>
        </div>
      </div>

      {#if loading}
        <div
          style="display: flex; justify-content: center; align-items: center; width: 100%; height: 50vh;"
        >
          <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
        </div>
      {:else}
        <div class="posts-comments">
          <!-- Feedback Posts -->
          {#if activityStatusType === ActivityStatusType.POST || activityStatusType === ActivityStatusType.ALL_ACTIVITY}
            <div>
              <h2
                style=" font-size: 15px; color: #999999; margin-bottom: 12px;"
              >
                Feedbacks
              </h2>
              {#if filteredPosts.length > 0}
                <ul>
                  {#each filteredPosts as post}
                    <div
                      class="mb-4"
                      style=" display: flex; flex-direction: column; background-color: #151515; padding: 20px;  border-radius:2px;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: flex-start;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="title"
                            on:click={() => (
                              (postId = post?.id),
                              (isPostopen = true),
                              setPostId("feedback", postId)
                            )}
                          >
                            {post?.title}
                          </div>
                          <div
                            style="height: 16px; display: flex; align-items: center;"
                          >
                            <span
                              class="category mt-2"
                              style="color:{getColor(post?.status)
                                ?.fontColor}; border:0.2px solid {getColor(
                                post?.status,
                              )?.fontColor}; "
                            >
                              {post?.status
                                ? post.status.charAt(0).toUpperCase() +
                                  post.status.slice(1)
                                : ""}
                            </span>
                          </div>
                        </div>
                        <div style="">
                          <UpvoteIcon upvote={post?.score} />
                        </div>
                      </div>

                      <div style="margin-top: 10px; flex: 1;">
                        <p
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
                        <span style=" font-size: 13px;"
                          >{post?.commentCount}</span
                        >
                      </div>
                    </div>
                  {/each}
                </ul>
              {:else}
                <p
                  class="mx-1 text-fs-12 mb-0 text-center"
                  style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
                >
                  No Result Found
                </p>

                <hr class="mt-4" style="" />
              {/if}
            </div>
          {/if}

          <!-- Comments Section  -->
          {#if activityStatusType === ActivityStatusType.COMMENT || activityStatusType === ActivityStatusType.ALL_ACTIVITY}
            <div class="comments mb-2">
              <h2
                style=" font-size: 15px; color: #999999; margin-bottom: 12px;"
              >
                Comments
              </h2>
              {#if filteredComments.length > 0}
                <ul>
                  {#each filteredComments as comment}
                    <li
                      class="comment"
                      style=""
                      on:mouseenter={() => (isHovering = comment.id)}
                      on:mouseleave={() => (isHovering = null)}
                    >
                      <IconFallback
                        character="M"
                        width="34px"
                        height="32px"
                        backgroundColor="#1C1D2B"
                        borderColor="#45494D"
                      />
                      <div class="comment-content">
                        <div
                          class="mt-1"
                          style="display: flex; justify-content: space-between; align-items: start;"
                        >
                          <div class="w-100">
                            <div
                              class="d-flex justify-content-between"
                              style=" font-weight: 500; "
                            >
                              <p>{comment.author.name}</p>
                              <div style="">
                                {#if isHovering === comment.id}
                                  <span
                                    on:click={() => {
                                      postId = comment?.post?.id;
                                      isPostopen = true;
                                      setPostId("feedback", comment?.post?.id);
                                      MixpanelEvent(Events.Activity_GoToPost);
                                    }}
                                    class="go-to-post"
                                    style="font-size: 12px; letter-spacing: 0.25px; font-weight: 400;"
                                    >Go to post</span
                                  >
                                  <ArrowOutwardIcon
                                    height={"10px"}
                                    width={"10px"}
                                    color={"white"}
                                  />
                                {/if}
                              </div>
                            </div>

                            <div class="comment-text">
                              <p style="word-break: break-all;">
                                {comment.value}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div class="comment-meta">
                          <div class="comment-moreinfo">
                            <span class="comment-time">
                              {formatTimeAgo(comment.created)}
                            </span>
                            <a href="#" class="comment-reply">Reply</a>
                          </div>
                          <div class="comment-likes">
                            <LikeIcon />
                            <span class="like-count">{comment.likeCount}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p
                  class="mx-1 text-fs-12 mb-0 text-center"
                  style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
                >
                  No Result Found
                </p>
              {/if}

              <hr class="mt-4" style="" />
            </div>
          {/if}

          <!-- Upvoted Section  -->
          {#if activityStatusType === ActivityStatusType.UPVOTED_POSTS || activityStatusType === ActivityStatusType.ALL_ACTIVITY}
            <div class="mt-3">
              <h2
                style=" font-size: 15px; color: #999999; margin-bottom: 12px;"
              >
                Upvoted Posts
              </h2>
              {#if filteredLikedPosts.length > 0}
                <ul>
                  {#each filteredLikedPosts as { post }}
                    <div
                      class="mb-4"
                      style="display: flex; flex-direction: column; background-color: #151515; padding: 15px; min-height: 195px; border-radius:2px; "
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: flex-start;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="title"
                            on:click={() => (
                              (postId = post?.id),
                              (isPostopen = true),
                              setPostId("feedback", postId)
                            )}
                          >
                            {post?.title}
                          </div>
                          <div
                            style="height: 16px; display: flex; align-items: center;"
                          >
                            <span
                              class="category mt-2"
                              style="color:{getColor(post?.status)
                                .fontColor}; border:0.2px solid {getColor(
                                post?.status,
                              ).fontColor}; "
                            >
                              {post?.status
                                ? post.status.charAt(0).toUpperCase() +
                                  post.status.slice(1)
                                : ""}
                            </span>
                          </div>
                        </div>
                        <div>
                          <UpvoteIcon isPostLiked={true} upvote={post?.score} />
                        </div>
                      </div>

                      <div style="margin-top: 10px; flex: 1;">
                        <p
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
                        <span style=" font-size: 13px;"
                          >{post?.commentCount}</span
                        >
                      </div>
                    </div>
                  {/each}
                </ul>
              {:else}
                <p
                  class="mx-1 text-fs-12 mb-0 text-center mt-4 mb-4"
                  style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
                >
                  No Result Found
                </p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if isPostopen}
    <FeedbackPost
      bind:isPostopen
      {onRetrievePost}
      {userInfo}
      bind:postId
      fetchComments={listPostsComments}
      {getColor}
    />
  {/if}
</div>

<style>
  .search-input-container {
    /* border: 1px solid var(--border-color); */
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

  .category {
    background-color: #171302;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 16px;
  }

  .title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 5px;
    color: var(--white-color);
  }
  .title:hover {
    text-decoration: underline;
    cursor: pointer;
    color: var(--text-primary-300);
  }

  #search-input {
    padding-bottom: 5px !important;
  }
  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  div.my-activity {
    height: 89px !important;
    padding-bottom: 21px;
    display: flex;
    flex-direction: column;
    margin-top: 32px;
  }

  div.my-activity > div.title {
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 12px;
  }

  div.my-activity > p.description {
    font-size: 14px;
    color: #999999;
  }

  .posts-comments ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .comments h2 {
    font-size: 16px;
    font-weight: normal;
    margin-top: 0;
    margin-bottom: 15px;
  }

  .comment {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 20px;
    width: 100%;
  }

  .comment:hover {
    background-color: #1a1a1a;
    border-radius: 2px;
    cursor: pointer;
    transition: all;
    animation-duration: 1s;
  }

  .comment-content {
    width: calc(100% - 5px);
    /* width: 100%; */
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .comment-text {
    margin-bottom: 8px;
    line-height: 1.4;
    color: #cccccc;
    font-size: 14px;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #8e8e8e;
  }

  .comment-moreinfo {
    display: flex;
    gap: 15px;
  }

  .comment-reply {
    color: #8e8e8e;
    text-decoration: none;
  }

  .comment-likes {
    display: flex;
    align-items: start;
    margin-left: auto;
    gap: 5px;
  }

  .post-section-heading {
    font-size: 15px;
    color: #999999;
    margin-bottom: 12px;
  }

  .posts-comments {
    width: 100%;
    width: 100%;
  }

  .comments h2 {
    font-size: 15px;
    color: #999999;
    margin: 20px 0px 10px 0px;
    font-weight: 500;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    /* margin-top: 38px; */
  }

  .search-bar {
    width: 20vw;
  }

  .search-input-container {
    display: flex;
    align-items: center;
    padding: 5px 15px;
    background-color: var(--bg-tertiary-400);
    border: 1px solid transparent;
    border-radius: 4px;
    margin-top: 10px;
  }

  .search-input-container:hover,
  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  .search-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 12px;
    outline: none;
    padding-bottom: 5px;
    padding: 0px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .search-input::placeholder {
    /* ; */
    position: absolute;
    top: 50%;
    left: 20%;
    transform: translate(-50%, -50%);
  }

  .filters {
    display: flex;
    gap: 15px;
  }

  .post-list {
    display: flex;
    margin-top: 40px;
    justify-content: space-between;
  }

  .sidebar {
    width: 187px;
    margin-right: 28px;
  }

  .sort {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 13px;
    /* ; */
  }

  .sort-button {
    display: flex;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    font-size: 14px;
    color: #808080;
    cursor: pointer;
  }

  .sort-button:hover {
    color: #3670f7;
  }

  .sort-button:focus-within {
    color: #3670f7;
  }

  .posts-lists {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .post-card {
    background-color: #151515;
    padding: 20px;
    border-radius: 2px;
    margin-bottom: 20px;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    /* ; */
  }

  .post-title {
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
  }

  .post-title:hover {
    text-decoration: underline;
  }

  .post-body {
    margin-top: 10px;
  }

  .post-footer {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
  }

  .tick-icon {
    display: none;
  }

  .sort-button:focus-within .tick-icon {
    display: block;
  }

  .sort-buttons:focus-within {
    color: #3670f7 !important;
  }
  .selected-sort {
    color: #3670f7 !important;
  }
  .tick-icon {
    display: none;
  }

  .badge {
    padding: 0.3rem 0.5rem;
    border-radius: 5px;
    display: inline-block;
    width: fit-content;
  }

  /* Status Colors */
  .complete {
    color: #69d696;
    border: 1px solid #69d696;
    background-color: #031b0d;
  }

  .open {
    color: #1193f0;
    border: 1px solid #1193f0;
    background-color: #050938;
  }

  .planned {
    color: #ffe47e;
    border: 1px solid #ffe47e;
    background-color: #171302;
  }

  .progress {
    color: #df77f9;
    border: 1px solid #df77f9;
    background-color: #1c0837;
    padding-bottom: 17px;
  }

  .review {
    color: #fba574;
    border: 1px solid #fba574;
    background-color: #1c1405;
  }

  .error {
    color: #991b1b;
  }

  .secondary {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
</style>
