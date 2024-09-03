<script lang="ts">
  import { user } from "$lib/store";
  import {
    CategoryIcon,
    CommentIcon,
    SortIcon,
    TriangleIcon,
  } from "@library/icons";
  import { UpvoteIcon } from "@support/common/components";
  import FeedbackPost from "./FeedbackPost.svelte";
  import FeedbackDefault from "./FeedbackDefault.svelte";
  import FeedbackFilters from "./FeedbackFilters.svelte";
  import { onMount } from "svelte";
  export let onInputFeedback;
  export let onAddFeedback;
  export let fetchPosts;
  export let onRetrievePost;
  let posts = [];

  let userInfo: any = {};
  user.subscribe((value) => {
    userInfo = value;
  });
  let id;
  onMount(async () => {
    const start = performance.now();
    const listPosts = await fetchPosts();
    const end = performance.now();
    console.log("Time taken to fetch posts", end - start);
    posts = listPosts?.data?.posts;
  });
  let isPostopen = false;
</script>

<div style="margin: 8px 46px 0 34px;">
  <FeedbackDefault {onAddFeedback} {userInfo} {onInputFeedback} />
  <FeedbackFilters />

  {#if !isPostopen}
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
          <button class=" sort-buttons">Trending</button>
          <button class=" sort-buttons">New</button>
          <button class="sort-buttons">Top</button>
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
                  on:click={() => {
                    id = post?.id;
                    isPostopen = true;
                  }}
                >
                  {post?.title}
                </div>
                <div style="height: 16px; display: flex; align-items: center;">
                  <span class="category">{post?.tags[0]?.name}</span>
                </div>
              </div>

              <UpvoteIcon />
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
    <FeedbackPost bind:isPostopen {onRetrievePost} {userInfo} {id} />
  {/if}
</div>

<style>
  .title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 5px;
    color: #3670f7;
  }
  .title:hover {
    text-decoration: underline;
    cursor: pointer;
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
</style>
