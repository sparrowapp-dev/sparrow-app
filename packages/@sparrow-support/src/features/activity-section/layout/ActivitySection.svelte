<script lang="ts">
  import { user } from "@app/store/auth.store";
  import {
    ActivityIcon,
    ArrowUpRightRegular,
    BoxBarIcon,
    BroadActivityFeedRegular,
    ChatMultipleRegular,
    CommentIcon,
    CommentRegular,
    CrossIcon,
    DiversityRegular,
    LikeIcon,
    LinkRegular,
    MessageIcon,
    PostIcon,
    SortIcon,
    TableChart,
    TickIcon,
  } from "@sparrow/library/icons";
  import FeedbackPost from "../../../features/feedback-section/layout/FeedbackPost.svelte";
  import { onMount } from "svelte";
  import { SearchIcon } from "@sparrow/library/assets";
  import { Select } from "@sparrow/library/forms";
  import { CategoryIcon, StatusIcon } from "@sparrow/library/icons";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { FeedbackStatusType, FeedbackType } from "../../../types/feedback";
  import { Button, ImageModal, Tag } from "@sparrow/library/ui";

  import { ActivityStatusType, ActivityType } from "../../../types/activity";
  import { Spinner } from "@sparrow/library/ui";
  import { Loader } from "@sparrow/library/ui";
  import { FormatTime } from "@sparrow/common/utils";
  const formatTimeAgo = new FormatTime().formatTimeAgo;
  import { ArrowOutwardIcon } from "@sparrow/library/icons";
  import { SparrowLogo } from "@sparrow/common/images";
  import { Upvote } from "../../../components";
  import { Search } from "@sparrow/library/forms";
  import { Avatar } from "@sparrow/library/ui";
  import * as Sentry from "@sentry/svelte";

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

  let userPosts;
  let userComments;
  let userLikedPosts;

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

      userPosts = posts.filter((post) => {
        if (post.author.email.toLowerCase() === userInfo.email.toLowerCase())
          return true;
        return false;
      });

      userComments = comments.filter((post) => {
        if (post.author.email.toLowerCase() === userInfo.email.toLowerCase())
          return true;
        return false;
      });

      userLikedPosts = likedPosts.filter((post) => {
        if (post.voter.email.toLowerCase() === userInfo.email.toLowerCase())
          return true;
        return false;
      });

      hasActivity =
        userPosts.length == 0 &&
        userLikedPosts.length == 0 &&
        userComments.length == 0;

      if (hasActivity) {
        currentSort = "";
      }

      applyAllFilters();
      loading = false;
    } catch (error) {
      loading = false;
    }
  };

  onMount(async () => {
    await getAllData();
  });

  let hasActivity = false;
  let currentImage = "";
  let isImageOpen = false;

  const applyAllFilters = () => {
    let tempPosts = userPosts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    let tempComments = userComments.filter((comment) =>
      comment.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    let tempLikedPosts = userLikedPosts.filter((vote) =>
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
</script>

<div class="container" style="padding: 20px; height: 100%">
  <div class="mt-0">
    <p class="text-ds-font-size-20 fw-semibold mb-2">My Activity</p>
    <p class="text-ds-font-size-14" style="color: var(--text-secondary-50); ">
      Find all your posts, comments, and likes in one place and easily keep
      track of them.
    </p>
  </div>

  <div
    class="d-flex align-items-center"
    style="justify-content: space-between;"
  >
    <div>
      <div class={`d-flex  rounded py-1 mb-2`}>
        <Search
          variant="primary"
          id="search-input"
          placeholder="Search updates"
          bind:value={searchTerm}
          on:input={() => handleInputChange(searchTerm)}
        />
      </div>
    </div>
    <div class="d-flex" style="gap: 15px;">
      <div>
        <Select
          iconRequired={true}
          data={[
            { name: "Feature Request", id: ActivityType.FEATURE_REQUEST },
            { name: "UI Improvement", id: ActivityType.UI_IMPROVEMENT },
            { name: "Bugs", id: ActivityType.BUG },
            { name: "All Categories", id: ActivityType.ALL_CATEGORIES },
          ]}
          icon={DiversityRegular}
          iconColor={"var(--icon-primary-300)"}
          onclick={(id = "") => {
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
          variant={"secondary"}
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
          icon={BroadActivityFeedRegular}
          iconColor={"var(--icon-primary-300)"}
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
          headerFontSize={"12px"}
          isDropIconFilled={true}
          position={"absolute"}
          variant={"secondary"}
        />
      </div>
    </div>
  </div>

  {#if !isPostopen}
    <div class="post-list d-flex gap-4" style="margin-top: 16px">
      <div style="width:129px;  padding-left: 8px; margin-top: -2px;">
        <div style="color: var(--text-ds-neutral-200)">
          <SortIcon
            width={"12px"}
            height={"8px"}
            color={"var(--text-ds-neutral-200)"}
          />
          <span
            class="text-ds-font-size-12 text-ds-font-weight-medium"
            style="padding-left: 4px; padding-top:4px ; "
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
              handleSortChange("newest");
              MixpanelEvent(Events.Activity_SortBy_Filter);
            }}
            class="sort-buttons d-flex justify-content-between w-100"
            class:active={currentSort === "newest"}
          >
            <div>
              <span class="text-fs-12">Newest</span>
            </div>
            <div class="tick-icon">
              <TickIcon
                height={"12px"}
                width={"12px"}
                color={"var(--text-ds-primary-300)"}
              />
            </div>
          </button>

          <button
            on:click={() => {
              handleSortChange("oldest");
              MixpanelEvent(Events.Activity_SortBy_Filter);
            }}
            class="sort-buttons d-flex justify-content-between w-100"
            class:active={currentSort === "oldest"}
          >
            <div><span class="text-ds-font-size-12">Oldest</span></div>
            <div class="tick-icon">
              <TickIcon
                height={"12px"}
                width={"12px"}
                color={"var(--text-ds-primary-300)"}
              />
            </div>
          </button>
        </div>
      </div>

      {#if hasActivity}
        <div
          class="h-100 w-100 d-flex justify-content-center align-items-center"
          style="flex: 1; min-height: calc(100vh - 350px);"
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
              No activity yet. Start engaging to see it here
            </p>
          </div>
        </div>
      {:else if loading}
        <div
          style="display: flex; justify-content: center; align-items: center; width: 100%; height: 50vh;"
        >
          <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
        </div>
      {:else if searchTerm && filteredPosts.length === 0 && filteredComments.length === 0 && filteredLikedPosts.length === 0}
        <div
          class="h-100 w-100 d-flex justify-content-center align-items-center"
          style="flex: 1;"
        >
          <p
            class="mx-1 text-ds-font-size-14 text-ds-font-weight-medium mb-0 text-center mt-4"
            style="color: var(--text-ds-neutral-400);"
          >
            No result found.
          </p>
        </div>
      {:else}
        <div class="posts-comments">
          <!-- Feedback Posts -->
          {#if activityStatusType === ActivityStatusType.POST || activityStatusType === ActivityStatusType.ALL_ACTIVITY}
            <div>
              <h2
                class="text-ds-font-size-16 text-secondary-100"
                style="margin-bottom: 12px;"
              >
                Feedbacks
              </h2>
              {#if filteredPosts.length > 0}
                <ul>
                  {#each filteredPosts as post}
                    <div
                      class="mb-4"
                      style=" display: flex; flex-direction: column; background-color: var(--bg-ds-surface-700); padding: 20px; border-radius:6px;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: flex-start;"
                      >
                        <div style="flex: 1;">
                          <div class="d-flex gap-3 align-items-center">
                            <div
                              class="title"
                              on:click={() => {
                                (postId = post?.id),
                                  (isPostopen = true),
                                  setPostId("feedback", postId);
                                MixpanelEvent(Events.Activity_Post);
                              }}
                            >
                              {post?.title}
                            </div>
                            <div class="mb-2">
                              <LinkRegular />
                            </div>
                          </div>

                          <div
                            style="height: 16px; display: flex; align-items: center;"
                          >
                            <Tag
                              type={getColor(post?.status)}
                              text={post?.status
                                ? post.status.charAt(0) + post.status.slice(1)
                                : ""}
                            />
                          </div>
                        </div>
                        <div style="">
                          <Upvote
                            isHoverRequired={false}
                            upvote={post?.score}
                          />
                        </div>
                      </div>

                      <div style="margin-top: 10px; flex: 1;">
                        <p
                          class="text-ds-font-size-14"
                          style="color: var(--text-secondary-1000); margin: 0;"
                        >
                          {post?.details}
                        </p>
                      </div>

                      <div
                        class="ms-1"
                        style="display: flex; align-items: center; margin-top: 10px; gap:5px; color: var(--text-secondary-100);"
                      >
                        <span>
                          <CommentRegular />
                        </span>
                        <span class="text-ds-font-size-14"
                          >{post?.commentCount}</span
                        >
                      </div>
                    </div>
                  {/each}
                </ul>
              {:else}
                <div
                  class="empty-activity"
                  style="display: flex; flex-direction:column; justify-content:center; align-items:center;"
                >
                  <ChatMultipleRegular
                    size={"32px"}
                    color={"var(--text-secondary-550)"}
                  />

                  <p
                    class="mx-1 text-ds-font-size-14 text-ds-font-weight-medium mb-0 text-center mt-3"
                    style="color: var(--text-secondary-550); letter-spacing: 0.5px;"
                  >
                    No feedback yet
                  </p>
                </div>
              {/if}
              <hr class="mt-4" style="" />
            </div>
          {/if}

          <!-- Comments Section  -->
          {#if activityStatusType === ActivityStatusType.COMMENT || activityStatusType === ActivityStatusType.ALL_ACTIVITY}
            <div class="comments mb-2">
              <h2
                class="text-ds-font-size-16 text-secondary-100"
                style="margin-bottom: 12px;"
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
                      <Avatar
                        type="letter"
                        size="small"
                        letter={comment?.author?.name?.charAt(0)}
                        bgColor="var(--bg-ds-surface-500)"
                      />
                      <div class="comment-content">
                        <div
                          style="display: flex; justify-content: space-between; align-items: start; margin-top: 2px;"
                        >
                          <div class="w-100">
                            <div
                              class="d-flex gap-3"
                              style=" font-weight: 500; "
                            >
                              <p class="mb-1 pb-0 text-secondary-100">
                                {comment.author.name}
                              </p>
                              <div style="">
                                {#if isHovering === comment.id}
                                  <Button
                                    size="small"
                                    type={"link-primary"}
                                    title="Go to post"
                                    onClick={() => {
                                      postId = comment?.post?.id;
                                      isPostopen = true;
                                      setPostId("feedback", comment?.post?.id);
                                      MixpanelEvent(Events.Activity_GoToPost);
                                    }}
                                    endIcon={ArrowUpRightRegular}
                                    buttonClassProp={"ps-0"}
                                  />
                                {/if}
                              </div>
                            </div>

                            <div class="comment-text">
                              <p class="mb-0" style="word-break: break-all; ">
                                {comment.value}
                              </p>
                            </div>

                            <div>
                              <div>
                                {#each comment?.imageURLs as commentImage}
                                  <img
                                    on:click={() => {
                                      isImageOpen = true;
                                      currentImage = commentImage;
                                    }}
                                    src={commentImage}
                                    alt="post image"
                                    style="display:inline; height: 100px; margin-top: 20px; border-radius: 2px; margin:10px;   object-fit: contain;   max-width: 100%; "
                                  />
                                  <ImageModal
                                    isOpen={isImageOpen}
                                    type={"dark"}
                                    width={"40%"}
                                    zIndex={10000}
                                    handleModalState={(flag = false) => {
                                      isImageOpen = flag;
                                    }}
                                  >
                                    <img
                                      src={currentImage}
                                      alt="post image"
                                      style="width:100%; height:100%;"
                                    />
                                  </ImageModal>
                                {/each}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="comment-meta">
                          <div class="comment-moreinfo">
                            <span class="comment-time">
                              {formatTimeAgo(comment.created)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div
                  class="empty-activity"
                  style="display: flex; flex-direction:column; justify-content:center; align-items:center;"
                >
                  <ChatMultipleRegular
                    size={"32px"}
                    color={"var(--text-secondary-550)"}
                  />

                  <p
                    class="mx-1 text-ds-font-size-14 text-ds-font-weight-medium mb-0 text-center mt-3"
                    style="color: var(--text-secondary-550); letter-spacing: 0.5px;"
                  >
                    No comments yet
                  </p>
                </div>
              {/if}

              <hr class="mt-4" style="" />
            </div>
          {/if}

          <!-- Upvoted Section  -->
          {#if activityStatusType === ActivityStatusType.UPVOTED_POSTS || activityStatusType === ActivityStatusType.ALL_ACTIVITY}
            <div class="">
              <h2
                class="text-ds-font-size-16 text-secondary-100"
                style="margin-bottom: 12px;"
              >
                Upvoted Posts
              </h2>
              {#if filteredLikedPosts.length > 0}
                <ul>
                  {#each filteredLikedPosts as { post }}
                    <div
                      class="mb-4"
                      style="display: flex; flex-direction: column; background-color: var(--bg-ds-surface-700); padding: 15px; border-radius:6px; "
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: flex-start;"
                      >
                        <div style="flex: 1;">
                          <div class="d-flex gap-3 align-items-center">
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
                            <div class="mb-2">
                              <LinkRegular />
                            </div>
                          </div>
                          <div
                            style="height: 16px; display: flex; align-items: center;"
                          >
                            <Tag
                              type={getColor(post?.status)}
                              text={post?.status
                                ? post.status.charAt(0) + post.status.slice(1)
                                : ""}
                            />
                          </div>
                        </div>
                        <div>
                          <Upvote
                            isHoverRequired={false}
                            isPostLiked={true}
                            upvote={post?.score}
                          />
                        </div>
                      </div>

                      <div style="margin-top: 10px; flex: 1;">
                        <p
                          class="text-ds-font-size-14"
                          style="color: var(--text-secondary-1000); margin: 0;"
                        >
                          {post?.details}
                        </p>
                      </div>

                      <div
                        class="ms-1"
                        style="display: flex; align-items: center; margin-top: 10px; gap:5px; color: var(--text-secondary-100);"
                      >
                        <span>
                          <CommentRegular />
                        </span>
                        <span class="text-ds-font-size-14px"
                          >{post?.commentCount}</span
                        >
                      </div>
                    </div>
                  {/each}
                </ul>
              {:else}
                <div
                  class="empty-activity"
                  style="display: flex; flex-direction:column; justify-content:center; align-items:center;"
                >
                  <ChatMultipleRegular
                    size={"32px"}
                    color={"var(--text-secondary-550)"}
                  />

                  <p
                    class="mx-1 text-ds-font-size-14 text-ds-font-weight-medium mb-0 text-center mt-3"
                    style="color: var(--text-secondary-550); letter-spacing: 0.5px;"
                  >
                    No upvoted posts yet
                  </p>
                </div>
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
    background: var(--bg-tertiary-400);
    width: 20vw;
    font-size: 12px;
    height: 26px;
    position: relative;
    border: 1px solid transparent;
    align-items: center;
    display: flex;
    justify-content: center;
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
    margin-bottom: 8px;
    color: var(--text-secondary-100);
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
    padding: 15px;
    width: 100%;
  }

  .comment:hover {
    background-color: var(--bg-ds-surface-700);
    border-radius: 6px;
    cursor: pointer;
    transition: all;
    animation-duration: 1s;
  }

  .comment-content {
    width: calc(100% - 5px);
    /* width: 100%; */
    display: flex;
    flex-direction: column;
    /* gap: 5px; */
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

  .sort-buttons {
    color: var(--text-secondory-100) !important;
    background: none !important;
    outline: none !important;
    border: none !important;
    font-weight: 500;
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

  .empty-activity {
    margin-top: 36px;
    margin-bottom: 36px;
  }
</style>
