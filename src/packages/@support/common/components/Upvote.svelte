<script lang="ts">
  import { TriangleIcon } from "@library/icons";


  export let upvote: number; 
  export let postID: string;
  export let likePost: (postId: string) => void; 
  export let dislikePost: (postId: string) => void; 
  export let isPostLiked: boolean;


  const handleClick = () => {
    if (isPostLiked) {
      dislikePost(postID);
      upvote--;
    } else {
      likePost(postID);
      upvote++; 
    }
    isPostLiked = !isPostLiked; 
  };
</script>

<div
  class={isPostLiked
    ? "upvote-container upvoted"
    : "upvote-container not-upvoted"}
  on:click={handleClick}
>
  <div style="height: 22px; width: 24px; text-align: center;">
    {#if isPostLiked}
      <TriangleIcon height={"10px"} width={"10px"} color={"blue"} />
    {:else}
      <TriangleIcon height={"10px"} width={"10px"} color={"white"} />
    {/if}
  </div>
  <span style=" font-size: 14px;">{upvote}</span>
</div>

<style>
  .upvote-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1px 4px;
    border-radius: 4px;
    margin-left: 10px;
  }

  .upvoted {
    border: 0.3px solid var(--text-primary-300);
    color: var(--text-primary-300);
    background-color: var(--bg-primary-650);
  }

  .not-upvoted {
    border: 0.3px solid var(--bg-secondary-200);
  }
</style>
