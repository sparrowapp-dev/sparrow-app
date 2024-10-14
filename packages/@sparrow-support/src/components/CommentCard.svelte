<script lang="ts">
  import { AttachmentIcon, CrossIcon } from "@sparrow/library/icons";
  import { Button, IconFallback } from "@sparrow/library/ui";
  import { CommentCard } from "@sparrow/support/components";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { Attachment } from "@sparrow/support/components";
  import { ImageModal } from "@sparrow/library/ui";
  import { notifications } from "@sparrow/library/ui";

  /**
   * @description - The current comment being added or modified by the user.
   */
  export let comment;

  /**
   * @description - Information about the current user, including details like name, ID, etc.
   */
  export let userInfo;

  /**
   * @description - Callback function triggered when a new comment is added.
   */
  export let onAddComment;

  /**
   * @description - Function to fetch comments for a specific post from the server.
   */
  export let fetchComments;

  /**
   * @description - Function to reload the list of comments, typically after a new comment is added or deleted.
   */
  export let reloadComments;

  /**
   * @description - The ID of the post to which the comments belong.
   */
  export let postId;

  export let getColor;

  let isCommenting = false;

  let isReplying = false;

  let commentValue = "";

  const isAuthor = userInfo?.email === comment?.author?.email;

  let currentImage = "";

  let isImageOpen = false;

  let inputId = "reply-input2";

  /**
   * Formats a given date into a human-readable "time ago" string.
   * @param  date - The date to format.
   * @returns  Formatted time string (e.g., "2 hours ago").
   */
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

  let uploadReplyAttachment = {
    file: {
      value: [],
    },
  };

  /**
   * Updates the comment value with the input from the event.
   * @param {Event} e - The input event.
   */
  const handleAddCommentInput = (e: InputEvent) => {
    commentValue = e.target.value;
  };

  const handleInputAttachment = (e: InputEvent) => {
    const sizeExceededMessage =
      "One or more files exceed the size limit of 2MB.";
    const typeErrorMessage =
      "Only image files (jpg, jpeg, png, svg) are allowed.";
    const maxFilesExceededMessage =
      "Failed to upload the file. You are allowed to upload only 3 files per comment.";

    // Safely gather selected files
    let newFiles = Array.from(e?.target?.files || e?.dataTransfer?.files || []);

    const maxImageSize = 2097152; // 2MB
    let isSizeExceeded = false;
    let isInvalidType = false;

    // Filter valid image files
    const validFiles = newFiles.filter((file) => {
      const fileExtension = file.name?.split(".").pop().toLowerCase();
      if (!fileExtension) return false; // Ignore files without extension

      // Check file type
      if (["jpg", "jpeg", "png", "svg"].includes(fileExtension)) {
        // Check file size
        if (file.size > maxImageSize) {
          isSizeExceeded = true;
          return false;
        }
        return true;
      } else {
        isInvalidType = true;
        return false;
      }
    });

    // Get currently uploaded files
    const existingFiles = uploadReplyAttachment.file?.value || [];

    // Prevent adding duplicates (files already uploaded should not be uploaded again)
    const uniqueNewFiles = validFiles.filter(
      (newFile) =>
        !existingFiles.some(
          (existingFile) => existingFile.name === newFile.name,
        ),
    );

    // Total number of files already uploaded
    let currentFileCount = existingFiles.length;
    let newFileCount = uniqueNewFiles.length;

    // Prevent adding more than 5 files in total
    if (currentFileCount + newFileCount > 3) {
      uniqueNewFiles.length = 3 - currentFileCount; // Adjust the number of files to keep the total <= 5
      notifications.error(maxFilesExceededMessage);
    }

    // Error notifications
    if (isSizeExceeded) {
      notifications.error(sizeExceededMessage);
    }
    if (isInvalidType) {
      notifications.error(typeErrorMessage);
    }

    // Update the feedback files with unique new files if no critical errors
    if (!isSizeExceeded && !isInvalidType) {
      uploadReplyAttachment.file.value = [...existingFiles, ...uniqueNewFiles];
    }

    // Reset the file input so that the same file can be selected again if needed
    e.target.value = "";
  };

  const removeCommentAttachment = (index: number) => {
    uploadReplyAttachment.file.value = uploadReplyAttachment.file.value.filter(
      (_i, idx) => idx !== index, // Corrected: Use 'idx' to check against the index
    );
  };

  /**
   * Handles adding a reply to a comment on a post.
   *
   * @param {string} postId - The ID of the post where the reply is being added.
   * @param {object} comment - The comment object to which the reply is being added.
   * @param {object} uploadReplyAttachment - The attachment associated with the reply.
   */
  const handleAddReply = async (postId, comment, uploadReplyAttachment) => {
    isCommenting = true;
    commentValue = commentValue.trim();

    if (commentValue !== "") {
      await onAddComment(
        postId,
        commentValue,
        comment?.id,
        uploadReplyAttachment,
      );
    }

    commentValue = "";
    uploadReplyAttachment.file.value = [];

    await reloadComments();
    isReplying = false;
    isCommenting = false;
  };
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
    <div class="comment-author text-fs-14 mt-1">
      {comment.author.name || ""}
      {#if comment.value === "" && comment.author?.isAdmin === true}
        <span
          class="text-fs-14"
          style="marign-start: 4px; color: var(--text-secondary-150); font-weight: 400;"
        >
          has marked this post as
          <span
            class="mb-0 ms-2 px-2"
            style="border:0.2px solid {getColor(comment?.status)
              .fontColor}; color: {getColor(comment?.status)
              .fontColor};   border-radius: 2px; font-size:10px !important; align-text:center;  width:fit-content; height:12px;"
          >
            {comment?.status
              ? comment?.status.charAt(0).toUpperCase() +
                comment?.status.slice(1)
              : ""}
          </span>
        </span>
      {/if}
    </div>
    <div
      class="text-fs-12"
      style="font-weight: 400; color:var(--text-secondary-1000);  "
    >
      {#if comment.value !== ""}
        <p class="mb-1 pb-0" style="word-break: break-all;">
          {comment.value}
        </p>
      {/if}
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

    <div class="comment-meta">
      <div class="comment-moreinfo">
        <span class="comment-time">{timeAgo(comment.created)}</span>
        {#if !comment.parentID}
          <p
            on:click={() => {
              isReplying = !isReplying;
              MixpanelEvent(Events.Reply_Comment);
            }}
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
        class={`d-flex align-items-start search-input-container  mb-3 mt-1 p-1 px-2`}
        style=" display:felx; flex-direction:column;"
      >
        <div class="d-flex justify-content-end" style="width: 100%;">
          <input
            type="text"
            id="reply-input"
            class={`bg-transparent w-100 border-0 my-auto`}
            placeholder="Leave a comment"
            on:input={(e) => {
              handleAddCommentInput(e);
            }}
            bind:value={commentValue}
          />

          <div class="d-flex align-items-center gap-2 ms-1">
            <Attachment onFileSelect={handleInputAttachment} {inputId} />

            <Button
              title={`Add`}
              type={`primary`}
              loaderSize={13}
              textStyleProp={"font-size:11px;"}
              buttonStyleProp={`height: 20px; width:35px; justify-content:center;`}
              loader={isCommenting}
              onClick={() =>
                handleAddReply(postId, comment, uploadReplyAttachment)}
              disable={commentValue.trim() === "" || isCommenting}
            />
          </div>
        </div>

        <div class="">
          {#if uploadReplyAttachment?.file?.value?.length > 0}
            <div class="mt-2 file-scroller mb-1 d-flex gap-1 flex-wrap">
              {#each uploadReplyAttachment.file.value as file, index}
                <div
                  class="files d-flex align-items-center bg-tertiary-300 mb-1 px-3 py-1 border-radius-4"
                >
                  <span>
                    <AttachmentIcon
                      height={"12px"}
                      width={"12px"}
                      color={"var(--text-secondary-200)"}
                    />
                  </span>
                  <span class="mb-0 text-fs-12 px-2 ellipsis">{file?.name}</span
                  >
                  <span
                    on:click={() => {
                      removeCommentAttachment(index);
                    }}
                    ><CrossIcon
                      height={"12px"}
                      width={"9px"}
                      color={"var(--text-secondary-200)"}
                    /></span
                  >
                </div>
              {/each}
            </div>
          {/if}
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
    width: 100%;
    display: flex;
    flex-direction: column;
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
    background: var(--bg-secondary-800);
    width: 100%;
    font-size: 12px;
    position: relative;
    border: 1px solid var(--border-secondary-310);
    border-radius: 2px;
  }

  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
  #reply-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
</style>
