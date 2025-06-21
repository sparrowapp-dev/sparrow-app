<script lang="ts">
  import { CaretUpFilled, TriangleIcon } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";

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

<Button
  type={"outline-secondary"}
  onClick={handleClick}
  size="small"
  startIcon={CaretUpFilled}
  title={upvote}
  buttonClassProp="upvote-button"
  customWidth={"55px"}
  iconSize={16}
/>

<style>
</style>
