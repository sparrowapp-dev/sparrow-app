<script>
  import { AttachmentIcon } from "@library/icons";
  import { Button, IconFallback } from "@library/ui";
  import { CommentCard } from "@support/common/components";

  export let comment;
  export let userInfo;
  export let onAddComment;
  export let fetchComments;
  export let logMessage;
  export let postId;
  const isAuthor = userInfo?.email === comment?.author?.email;

  let parentID = comment?.id;

  const timeAgo = (date) => {
    const diffInSeconds = (new Date() - new Date(date)) / 1000;
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours >= 1) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes >= 1) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      const seconds = Math.floor(diffInSeconds);
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  };

  let isReplying = false;
  let commentValue = "";
  const handleAddCommentInput = (e) => {
    commentValue = e.target.value;
  };

  let isCommenting = false;
</script>

<div class="comment">
  <IconFallback
    character={comment.author.name.charAt(0)}
    width="34px"
    height="32px"
    backgroundColor="#1C1D2B"
    borderColor="#45494D"
  />

  <div class="comment-content">
    <div class="comment-author">{comment.author.name || ""}</div>
    <div class="comment-text">
      {comment.value}
    </div>
    <div class="comment-meta">
      <div class="comment-moreinfo">
        <span class="comment-time">{timeAgo(comment.created)}</span>
        {#if !comment.parentID}
          <p
            on:click={() => (isReplying = !isReplying)}
            style="color: {isReplying
              ? 'white'
              : 'grey'}; text-decoration: {isReplying ? 'underline' : 'none'};"
          >
            Reply
          </p>
        {/if}
        {#if isAuthor}
          <!-- <span class="edit-comment">Edit comment</span> -->
        {/if}
      </div>
    </div>

    {#if isReplying}
      <div
        class={`d-flex align-items-center search-input-container  px-2 mb-2`}
      >
        <input
          type="text"
          id="search-input"
          class={`bg-transparent w-100 border-0 my-auto`}
          placeholder="Leave a comment"
          on:input={(e) => {
            handleAddCommentInput(e);
          }}
          bind:value={commentValue}
        />

        <div class="d-flex align-items-center gap-2">
          <!-- <AttachmentIcon
            height={"12px"}
            width={"12px"}
            color={"var(--text-secondary-200)"}
          /> -->

          <Button
            title={`Add`}
            type={`primary`}
            loaderSize={13}
            loader={isCommenting}
            textStyleProp={"font-size: var(--small-text)"}
            buttonStyleProp={`height: 20px;  rounded;`}
            onClick={async () => {
              isCommenting = true;
              await onAddComment(postId, commentValue, comment?.id);
              isCommenting = false;

              logMessage();
              commentValue = "";
              setTimeout(() => {
                isReplying = false;
              }, 3000);
            }}
            disable={commentValue.length == 0 || isCommenting}
          />
        </div>
      </div>
    {/if}

    <!-- Check if the comment has replies and render them recursively -->
    {#if comment.replies && comment.replies.length > 0}
      <div>
        {#each comment.replies as reply}
          <CommentCard
            {onAddComment}
            {userInfo}
            comment={reply}
            {fetchComments}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .comment {
    display: flex;
    align-items: flex-start;
    margin-bottom: 5px;
    gap: 10px;
    padding: 10px;
  }

  .comment:hover {
    border-radius: 5px;
    cursor: pointer;
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

  .reply-input-container {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .reply-input {
    flex-grow: 1;
    background: #333;
    border: 1px solid #555;
    color: white;
    padding: 8px;
    border-radius: 5px;
  }

  .search-input-container {
    background: var(--bg-tertiary-400);
    width: 100%;
    font-size: 12px;
    height: 30px;
    position: relative;
    border: 1px solid transparent;
  }

  .search-input-container:focus-within {
    border-color: #636566;
    caret-color: var(--border-primary-300);
  }
  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
</style>
