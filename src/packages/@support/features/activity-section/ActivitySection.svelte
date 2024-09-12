<script lang="ts">
  import { user } from "$lib/store";
  import { CommentIcon, LikeIcon, SortIcon } from "@library/icons";
  import { UpvoteIcon } from "@support/common/components";
  import FeedbackPost from "@support/features/feedback-section/layout/FeedbackPost.svelte";
  import { onMount } from "svelte";
  import { SearchIcon } from "$lib/assets/app.asset";
  import { Select } from "@library/forms";
  import { CategoryIcon, StatusIcon } from "@library/icons";

  import {
    FeedbackStatusType,
    FeedbackType,
  } from "@support/common/types/feedback";
  import { tickIcon } from "@library/forms/select/svgs";
  import { IconFallback } from "@library/ui";
  import { Like } from "@library/ui/like";
  import {
    ActivityStatusType,
    ActivityType,
  } from "@support/common/types/activity";
  import Spinner from "@library/ui/spinner/Spinner.svelte";
  import Loader from "@library/ui/loader/Loader.svelte";

  export let type = FeedbackType.ALL_CATEGORY;
  export let onInputFeedback;
  export let onAddFeedback;
  export let fetchPosts;
  export let onRetrievePost;
  export let fetchComments;
  export let fetchLikedPosts;
  export let setActiveTabFromActivity;

  let currentSort = "newest";
  let posts = [];
  let filteredPosts = [];
  let filteredComments = [];
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
  let id = "";
  let loading = false;

  user.subscribe((value) => {
    userInfo = value;
  });

  // Fetch all data once on mount
  const getAllData = async () => {
    try {
      loading = true;
      const [postsData, commentsData, likedPostsData] = await Promise.all([
        fetchPosts(currentSort, userInfo._id),
        fetchComments(userInfo._id),
        fetchLikedPosts(currentSort, userInfo._id),
      ]);

      if (!commentsData || !postsData || !likedPostsData) {
        loading = false;
      }
      posts = postsData?.data?.posts || [];
      comments = commentsData?.data?.comments || [];
      likedPosts = likedPostsData?.data?.votes || [];

      filterPosts();
      filterComments();
      // sortComments(currentSort);
      loading = false;
    } catch (error) {
      loading = false;
    }
  };

  onMount(async () => {
    await getAllData();
  });

  const filterPosts = () => {
    filteredPosts = posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filterComments = () => {
    filteredComments = comments.filter((comment) =>
      comment.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const sortPosts = async (sort) => {
    const response = await fetchPosts(sort, userInfo._id);
    filteredPosts = response?.data?.posts;
  };

  const sortComments = (sortType) => {
    if (sortType === "newest") {
      filteredComments = comments
        .filter((comment) => comment.value)
        .sort((a, b) => new Date(b.created) - new Date(a.created));
    } else if (sortType === "oldest") {
      filteredComments = comments
        .filter((comment) => comment.value)
        .sort((a, b) => new Date(a.created) - new Date(b.created));
    }
  };

  const handleInputChange = (searchQuery) => {
    searchTerm = searchQuery;
    filterPosts();
  };

  const handleSortChange = async (sortType) => {
    currentSort = sortType;
    await sortComments(sortType);
    await sortPosts(sortType);
  };

  const handleCategoryChange = (selectedCategory) => {
    activityType = selectedCategory;
    if (selectedCategory === ActivityType.ALL_CATEGORIES) {
      filteredPosts = posts;
    } else {
      filteredPosts = posts.filter(
        (post) => post?.category?.name === selectedCategory,
      );
    }
  };

  const handleActivityChanges = (selectedStatus) => {
    activityStatusType = selectedStatus;

    if (selectedStatus === ActivityStatusType.POST) {
      filteredPosts = posts;
      filteredComments = [];
    } else if (selectedStatus === ActivityStatusType.COMMENT) {
      filteredPosts = [];
      filteredComments = comments;
    } else {
      filteredPosts = posts;
      filteredComments = comments;
    }
  };

  function timeAgo(createdTime: string) {
    const now = new Date();
    const commentTime = new Date(createdTime);
    const difference = now - commentTime; // difference in milliseconds
    const hours = Math.floor(difference / (1000 * 60 * 60)); // convert to hours

    if (hours < 1) {
      return "less than an hour ago";
    } else if (hours === 1) {
      return "1 hour ago";
    } else {
      return `${hours} hours ago`;
    }
  }
</script>

<div class="container">
  <div class="my-activity">
    <div class="title">My Activity</div>
    <p class="description">
      Find all your posts, comments, and likes in one place and easily keep
      track of them.
    </p>
  </div>

  <div
    class="d-flex align-items-center"
    style="margin-top: 15px; justify-content: space-between;"
  >
    <div class="">
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
          onclick={(id = "") => handleCategoryChange(id)}
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
            { name: "All Activity", id: ActivityStatusType.ALL_ACTIVITY },
          ]}
          onclick={(id = "") => {
            handleActivityChanges(id);
          }}
          titleId={activityStatusType}
          placeholderText="Status"
          zIndex={499}
          disabled={false}
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
            on:click={() => handleSortChange("newest")}
            class="sort-button"
          >
            Newest
            <img src={tickIcon} alt="" class="tick-icon" />
          </button>
          <button
            on:click={() => handleSortChange("oldest")}
            class="sort-button"
          >
            Oldest
            <img src={tickIcon} alt="" class="tick-icon" />
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
          {#if filteredPosts.length > 0}
            <h2 class="post-section-heading">Posts</h2>
            <ul>
              {#each filteredPosts as post}
                <li>
                  <div class="post-card">
                    <div class="post-header">
                      <div
                        class="post-title"
                        on:click={() => ((id = post?.id), (isPostopen = true))}
                      >
                        {post?.title}
                      </div>
                      <UpvoteIcon upvote={post?.score} />
                    </div>
                    <div class="secondary">
                      <div class="badge {post?.status}">
                        <span>{post?.status}</span>
                      </div>
                      <div class="post-body">
                        <p>{post?.details}</p>
                      </div>
                      <div class="post-footer">
                        <CommentIcon
                          width="15px"
                          height="13.95px"
                          color="#808080"
                        />
                        <span>{post?.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}

          <div class="comments">
            {#if comments.length > 0}
              <h2 class="comment-section-heading">Comments</h2>
              <ul class="comment-list">
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
                        class=""
                        style="display: flex; justify-content: space-between; align-items: start;"
                      >
                        <div class="">
                          <div class="comment-author">
                            {comment.author.name}
                          </div>
                          <div class="comment-text">{comment.value}</div>
                        </div>

                        {#if isHovering === comment.id}
                          <span
                            on:click={() => (
                              ((id = comment?.post?.id), (isPostopen = true)),
                              setActiveTabFromActivity(
                                "feedback",
                                comment.post?.id,
                              )
                            )}
                            class="go-to-post"
                            style="font-size: 12px; letter-spacing: 0.25px; font-weight: 400;"
                            >Go to post &#8599;</span
                          >
                        {/if}
                      </div>

                      <div class="comment-meta">
                        <div class="comment-moreinfo">
                          <span class="comment-time">
                            {timeAgo(comment.created)}
                          </span>
                          <a href="#" class="comment-reply">Reply</a>
                        </div>
                        <div class="comment-likes">
                          <Like />
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
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if isPostopen}
    <FeedbackPost bind:isPostopen {onRetrievePost} {userInfo} bind:id />
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

  #search-input {
    padding-bottom: 5px !important;
  }
  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  hr {
    color: #cbcbcb;
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

  .comment-list {
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
    border-radius: 5px;
    cursor: pointer;
    transition: all;
    animation-duration: 1s;
  }

  .comment-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .comment-author {
    font-weight: 500;
    margin-bottom: 4px;
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
    /* border: 2px solid red; */
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
    /* gap: 30px; */
    /* border: 2px solid blue; */
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

  .sort-button:focus-within .tick-icon,
  .sort-button:hover .tick-icon {
    display: block;
  }

  .sort-buttons:focus-within {
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
    /* position: relative; */
    /* top: -10%; */
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
</style>
