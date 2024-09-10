<script lang="ts">
  import { TriangleIcon } from "@library/icons";

  export let upvote: number; // Current upvote count
  export let postID: string; // Post ID
  export let hasUpvoted: boolean = false; // Track if the user has upvoted
  export let likePost: (postId: string) => void; // Function to call `Upvote`
  export let dislikePost: (postId: string) => void; // Function to call `UndoUpvote`
  export let authordId: string;
  export let handleUpvote

  let upvoteValue = upvote;

  const handleClick = () => {
    if (hasUpvoted) {
      dislikePost(postID);
      handleUpvote() // Remove upvote
      upvoteValue--;
    } else {
      likePost(postID); // Add upvote
      handleUpvote()
      upvoteValue++;
    }
    hasUpvoted = !hasUpvoted; // Toggle the upvote state
  };


</script>

<div
  class={hasUpvoted ? 'upvote-container upvoted' : 'upvote-container not-upvoted'}
  on:click={handleClick}
>
  <div style="height: 24px; width: 24px; text-align: center;">
    {#if hasUpvoted}
    <TriangleIcon
      height={"15px"}
      width={"10px"}
      color={"blue"}
    />
    {:else}

    <TriangleIcon
    height={"15px"}
    width={"10px"}
    color={"white"}
  />
    {/if}
    
  </div>
  <span style="margin-top: 1px; font-size: 14px;">{upvote}</span>
</div>

<style>
  .upvote-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 0.3px solid #8A9299;
    padding: 1px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
    background-color: #1e1e1e; /* Optional: Set a background color */
  }

  .upvoted {
    border: 0.3px solid blue;
    color: blue;

  }

  .not-upvoted {
    border: 0.3px solid white;
   
  }
</style>
