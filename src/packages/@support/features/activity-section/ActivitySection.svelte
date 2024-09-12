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

  export let type = FeedbackType.ALL_CATEGORY;
  import { tickIcon } from "@library/forms/select/svgs";
  import { IconFallback } from "@library/ui";
  import { Like } from "@library/ui/like";

  export let onInputFeedback;
  export let onAddFeedback;
  export let fetchPosts;
  export let onRetrievePost;
  export let fetchComments;
  export let fetchLikedPosts;
  export let setActiveTabFromActivity;
  // export let userInfo;

  let currentSort = "newest";
  let posts = [];
  let filteredPosts = [];
  let searchTerm = "";
  let userInfo: any = {};
  let comments = [];
  let isHovering = null; // Keep track of which comment is being hovered
  let likedPosts = [];
  // let comments = [];

  user.subscribe((value) => {
    userInfo = value;
  });

  let id = "";
  const getPosts = async (
    sortType: string,
    searchTerm?: string,
    status?: string,
  ) => {
    currentSort = sortType;

    const listPosts = await fetchPosts(
      currentSort,
      userInfo._id,
      searchTerm,
      status,
    );
    console.log(listPosts);
    posts = listPosts?.data?.posts;
  };

  const getComments = async (sortBy?: string) => {
    const listComments = await fetchComments(
      userInfo._id,
      currentSort,
      userInfo._id,
      searchTerm,
      status,
    );
    console.log(listComments);

    if (sortBy === "newest") {
      comments = listComments.data.comments.filter((_) => _.value);
      comments = comments.sort(
        (a, b) => new Date(b.created) - new Date(a.created),
      );
    } else if (sortBy === "oldest") {
      comments = listComments.data.comments.filter((_) => _.value);
      comments = comments.sort(
        (a, b) => new Date(a.created) - new Date(b.created),
      );
    } else {
      comments = listComments.data.comments.filter((_) => _.value);
    }
  };

  const getLikedPosts = async () => {
    const listsPosts = await fetchLikedPosts(userInfo._id);
    likedPosts = listsPosts.data.votes;
    console.log(listsPosts);
  };

  onMount(async () => {
    getPosts(currentSort);
    getComments();
    getLikedPosts();
  });

  let isPostopen = false;

  let activityType = FeedbackType.ALL_CATEGORY;
  let activityStatusType: string = FeedbackStatusType.ALL_STATUS;

  const defaultStaus = "open,under review,planned,in progress,complete";
  let status = defaultStaus;

  const firstLetterCapital = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  function timeAgo(createdTime: string) {
    const now = new Date();
    const commentTime = new Date(createdTime);
    const difference = now - commentTime; // difference in milliseconds
    const hours = Math.floor(difference / (1000 * 60 * 60)); // convert to hours

    if (hours < 1) {
      return firstLetterCapital("less than an hour ago");
    } else if (hours === 1) {
      return "1 hour ago";
    } else {
      return `${hours} hours ago`;
    }
  }

  const filterComments = () => {
    if (searchTerm.trim() === "") {
      getComments();
    } else {
      // Filter comments based on the search term
      comments = comments.filter((comment) => {
        const commentContent = comment.value.toLowerCase();
        return commentContent.includes(searchTerm.toLowerCase());
      });
    }
    console.log("Filtered Comments:", comments);
  };

  const handleInputChange = async (searchQuery: string) => {
    searchTerm = searchQuery;
    await getPosts(currentSort, searchTerm);
    filterComments();
  };

  const handleStatusChange = async (_status: string) => {
    console.log(_status);
    activityStatusType = _status;

    if (_status == "all status") {
      status = defaultStaus;
    } else {
      status = _status;
    }
    await getPosts(currentSort, searchTerm, status);
  };

  const handleCategoryChange = async (selectedCategory) => {
    activityStatusType = selectedCategory;

    if (selectedCategory === FeedbackType.ALL_CATEGORY) {
      // Show all posts if "All Categories" is selected
      await getPosts(currentSort, searchTerm, status);
    } else {
      // Fetch and filter posts by the selected category
      const listPosts = await fetchPosts(currentSort, searchTerm, status);
      posts = listPosts?.data?.posts.filter(
        (post) => post?.category?.name === selectedCategory,
      );
    }
  };
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
    style=" margin-top:15px; justify-content: space-between;"
  >
    <div class="">
      <div class={`d-flex search-input-container rounded px-2 mb-2`}>
        <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
        <input
          type="text"
          id="search-input"
          class={`bg-transparent w-100 border-0 my-auto`}
          placeholder="Search updates"
          on:input={(e) => {
            handleInputChange(e.target.value);
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
            activityType = id;
            handleCategoryChange(id);
          }}
          titleId={activityType}
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
            console.log("second drop down" + id);
            handleStatusChange(id);
          }}
          titleId={activityStatusType}
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
              getPosts("newest", searchTerm, status);
              getComments("newest");
            }}
            class="sort-button"
          >
            Newest
            <img src={tickIcon} alt="" class="tick-icon" />
          </button>
          <button
            on:click={() => {
              getPosts("oldest", searchTerm, status);
              getComments("oldest");
            }}
            class="sort-button"
          >
            Oldest
            <img src={tickIcon} alt="" class="tick-icon" />
          </button>
        </div>
      </div>
      <div class="posts-comments">
        <h2 class="post-section-heading text-fs-12 text-primary-300">Posts</h2>

        {#if posts.length > 0}
          <ul style="">
            {#each posts as post}
              <li>
                <!-- Use <li> instead of <div> for valid HTML structure inside <ul> -->
                <div class="post-card" style="">
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
        {:else}
          <p
            class="mx-1 mb-2 mt-1 text-fs-12 mb-0 text-center"
            style="color: var(--text-secondary-550);  font-weight:300; letter-spacing: 0.5px;"
          >
            No Result Found
          </p>
        {/if}

        <hr />

        <div class="comments">
          <h2 class="comment-section-heading">Comments</h2>
          {#if comments.length > 0}
            <ul class="comment-list">
              {#each comments as comment}
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
                        <div class="comment-author">{comment.author.name}</div>
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
              class="mx-1 mb-2 mt-1 text-fs-12 mb-0 text-center"
              style="color: var(--text-secondary-550);  font-weight:300; letter-spacing: 0.5px;"
            >
              No Result Found
            </p>
          {/if}
        </div>

        <hr />
        <div class="">
          <h2 class="post-section-heading" style="margin: 20px 0px 20px 0px;">
            Posts you liked
          </h2>

          {#if posts.length > 0}
            <ul style="">
              {#each posts as post}
                <li>
                  <!-- Use <li> instead of <div> for valid HTML structure inside <ul> -->
                  <div class="post-card" style="">
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
          {:else}
            <p
              class="mx-1 mb-2 mt-1 text-fs-12 mb-0 text-center"
              style="color: var(--text-secondary-550);  font-weight:300; letter-spacing: 0.5px;"
            >
              No Result Found
            </p>
          {/if}
        </div>
      </div>
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
