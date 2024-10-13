<script lang="ts">
  import { TriangleIcon } from "@sparrow/library/icons";

  export let upvote: number;
  export let postID: string;
  export let likePost: (postId: string) => void;
  export let dislikePost: (postId: string) => void;
  export let isPostLiked: boolean;
  export let isHoverRequired: boolean = true; // Default value is true
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
  class={`
    upvote-container 
    ${isPostLiked ? "upvoted" : "not-upvoted"} 
    ${!isPostLiked && isHoverRequired ? "hover-effect" : ""}
  `}
  on:click={handleClick}
>
  <div style="height: 22px; width: 24px; text-align: center;">
    {#if isPostLiked}
      <TriangleIcon
        height={"10px"}
        width={"10px"}
        color={"var(--icon-primary-300)"}
      />
    {:else}
      <TriangleIcon
        height={"10px"}
        width={"10px"}
        color={"var(--icon-secondary-100)"}
      />
    {/if}
  </div>
  <span style="font-size: 14px;">{upvote}</span>
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
    border: 0.3px solid var(--border-primary-300);
    background-color: var(--bg-primary-650);
  }
  .not-upvoted {
    border: 0.3px solid var(--border-secondary-200);
  }
  .hover-effect:hover {
    opacity: 70%;
    background-color: var(--bg-tertiary-850);
  }
</style>
