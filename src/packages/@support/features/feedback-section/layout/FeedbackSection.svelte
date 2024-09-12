<script lang="ts">
  import { user } from "$lib/store";
  import { CommentIcon, SortIcon } from "@library/icons";
  import { UpvoteIcon } from "@support/common/components";
  import FeedbackPost from "./FeedbackPost.svelte";
  import FeedbackDefault from "./FeedbackDefault.svelte";
  import FeedbackFilters from "./FeedbackFilters.svelte";
  import { onMount } from "svelte";
  import { SearchIcon } from "$lib/assets/app.asset";
  import { Select } from "@library/forms";
  import { CategoryIcon, StatusIcon } from "@library/icons";
  import {
    FeedbackType,
    FeedbackStatusType,
  } from "@support/common/types/feedback";
  import { tickIcon } from "@library/forms/select/svgs";
  export let onInputFeedback;
  export let onAddFeedback;
  export let fetchPosts;
  export let onRetrievePost;
  export let postIdFromActivity: any;
  export let isPostopenFromActivity;
  export let parentPostOpen;

  let filteredPosts = [];
  export let onAddComment;
  export let fetchComments;
  export let createVote;
  export let deleteVote;
  export let listVote;

  export let postId;

  let feedbackType = FeedbackType.ALL_CATEGORY;
  let feedbackStatusType = FeedbackStatusType.ALL_STATUS;

  let searchTerm = "";

  let currentSort = "trending";
  let posts = [];
  let userInfo: any = {};
  let votelist = [];
  user.subscribe((value) => {
    userInfo = value;
  });

  let id = "";
  const getPosts = async (
    sortType: string,
    searchQuery: string = "",
    status: string,
  ) => {
    currentSort = sortType;
    const listPosts = await fetchPosts(sortType, searchQuery, status);
    posts = listPosts?.data?.posts;
    // votelist = await listVote(post.id);
    // console.log("THis is votelist", votelist);
  };

  const defaultStaus = "open,under review,planned,in progress,complete";

  let status = defaultStaus;

  onMount(async () => {
    getPosts(currentSort, searchTerm, status);
    isPostopenFromActivity = false;
  });

  const handleUpvote = (e) => {
    getPosts(currentSort, searchTerm, status);
  };

  let isPostopen = isPostopenFromActivity || false;

  // Function to handle input change
  const handleInputChange = async (searchQuery: string) => {
    searchTerm = searchQuery;
    await getPosts(currentSort, searchQuery, status); // Fetch posts with search term
  };

  const handleStatusChange = async (_status: string) => {
    feedbackStatusType = _status;

    if (_status == "all status") {
      status = defaultStaus;
    } else {
      status = _status;
    }
    await getPosts(currentSort, searchTerm, status);
  };

  const handleCategoryChange = async (selectedCategory) => {
    console.log(selectedCategory);
    feedbackType = selectedCategory;

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

<div style="margin: 8px 46px 0 34px;">
  <FeedbackDefault {onAddFeedback} {userInfo} {onInputFeedback} />
  {#if !isPostopen}
    <div
      class="d-flex"
      style=" margin-top:38px; justify-content: space-between;"
    >
      <div class="">
        <div
          style=""
          class={`d-flex search-input-container rounded py-1 px-2 mb-2`}
        >
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
              feedbackType = id;
              handleCategoryChange(id);
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
          />
        </div>
      </div>
    </div>

    <div class="d-flex" style=" height:100%; margin-top:51px; ">
      <div style="width:187px; margin-right:28px; ">
        <div>
          <SortIcon width={"12px"} height={"8px"} />
          <span style="padding-left: 8px; padding-top:4px ; font-size:500;">
            Sort By</span
          >
        </div>
        <div
          class="d-flex flex-column"
          style="align-items: baseline; gap:10px; margin-top:13px; "
        >
          <button
            on:click={() => getPosts("trending", searchTerm, status)}
            class=" sort-buttons d-flex justify-content-between w-100"
          >
            <span>Trending</span>
            <img src={tickIcon} alt="" class="pt-1 tick-icon" style="" />
          </button>

          <button
            on:click={() => getPosts("newest", searchTerm, status)}
            class=" sort-buttons d-flex justify-content-between w-100"
          >
            <span>Now</span>
            <img src={tickIcon} alt="" class="pt-1 tick-icon" style="" />
          </button>

          <button
            on:click={() => getPosts("score", searchTerm, status)}
            class="sort-buttons d-flex justify-content-between w-100"
          >
            <span>Top</span>
            <img src={tickIcon} alt="" class="pt-1 tick-icon" style="" />
          </button>
        </div>
      </div>

      <div
        class="posts d-flex flex-column"
        style="gap:26px; width:calc(100% - 187px );"
      >
        {#each posts as post}
          <div
            style="display: flex; flex-direction: column; background-color: #151515; padding: 10px; min-height: 195px; border-radius:2px;"
          >
            <div
              style="display: flex; justify-content: space-between; align-items: flex-start;"
            >
              <div style="flex: 1;">
                <div
                  class="title"
                  on:click={async () => {
                    postId = post?.id;
                    // id = post?.id;
                    isPostopen = true;
                  }}
                >
                  {post?.title}
                </div>
                <div style="height: 16px; display: flex; align-items: center;">
                  <span class="category">{post?.status} </span>
                </div>
              </div>

              <UpvoteIcon
                {handleUpvote}
                authordId={post.author.id}
                postId={post.id}
                likePost={createVote}
                dislikePost={deleteVote}
                upvote={post?.score}
              />
            </div>

            <div style="margin-top: 10px; flex: 1;">
              <p style="color: #CCCCCC; margin: 0; padding-top:10px;">
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
                  color={"#808080"}
                />
              </span>
              <span style=" font-size: 13px;">{post?.commentCount}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if isPostopen}
    <FeedbackPost
      bind:postId
      bind:isPostopen
      {onRetrievePost}
      {userInfo}
      bind:id
      bind:postIdFromActivity
      {onAddComment}
      {fetchComments}
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
    font-weight: 700;
    margin-bottom: 5px;
  }
  .title:hover {
    text-decoration: underline;
    cursor: pointer;
    color: #3670f7;
  }

  .category {
    background-color: #171302;
    color: #ffe47e;
    opacity: 0.5;
    padding: 1px 4px;
    border: 0.2px solid #ffe47e;
    border-radius: 4px;
    font-size: 12px;
    line-height: 16px;
  }
  .sort-buttons {
    color: #808080 !important;
    background: none !important;
    outline: none !important;
    border: none !important;
    font-weight: 500;
  }
  .sort-buttons:hover {
    color: #3670f7 !important;
  }

  .sort-buttons:focus-within {
    color: #3670f7 !important;
  }
  .tick-icon {
    display: none;
  }

  /* .sort-buttons:hover .tick-icon {
    display: revert;
  } */
  .sort-buttons:focus-within .tick-icon {
    display: revert;
  }
</style>
