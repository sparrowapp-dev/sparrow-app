<script lang="ts">
  import {
    AttachmentIcon,
    AttachRegular,
    CrossIcon,
    DismissRegular,
  } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { CommentCard } from "@sparrow/support/components";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  import { Attachment } from "@sparrow/support/components";
  import { ImageModal } from "@sparrow/library/ui";
  import { notifications } from "@sparrow/library/ui";
  import { Tag } from "@sparrow/library/ui";
  import { Avatar } from "@sparrow/library/ui";

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
  <Avatar
    type={"letter"}
    size={"extra-small"}
    letter={comment?.author?.name.charAt(0) || ""}
    bgColor={"var(--bg-ds-surface-500)"}
  />

  <div class="comment-content">
    <div class="comment-author text-fs-14">
      {comment.author.name || ""}

      {#if comment.value === "" && comment.author?.isAdmin === true}
        <span
          class="text-fs-14"
          style="margin-start: 4px; color: var(--text-ds-neutral-400); font-weight: 400; display: inline-flex; align-items: center; gap: 4px;"
        >
          has marked this post as
          <Tag
            type={getColor(comment?.status)}
            text={comment?.status
              ? comment?.status.charAt(0) + comment?.status.slice(1)
              : ""}
          />
        </span>
      {/if}
    </div>
    <div
      class="text-fs-14"
      style="font-weight: 400; color:var(--text-ds-neutral-200);  "
    >
      {#if comment.value !== ""}
        <p class="mb-2 pb-0" style="word-break: break-all;">
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
          <span>|</span>
          <p
            on:click={() => {
              isReplying = !isReplying;
              MixpanelEvent(Events.Reply_Comment);
            }}
            style="margin: 0px; color: {isReplying
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
        <div class="d-flex justify-content-between gap-3" style="width: 100%;">
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

          <div class="d-flex align-items-center gap-3">
            <Attachment onFileSelect={handleInputAttachment} {inputId} />

            <Button
              title={`Add`}
              type={`primary`}
              loaderSize={13}
              size={"small"}
              customWidth={"72px"}
              textStyleProp={"font-size:11px;"}
              buttonStyleProp={`justify-content:center;`}
              loader={isCommenting}
              onClick={() =>
                handleAddReply(postId, comment, uploadReplyAttachment)}
              disable={commentValue.trim() === "" || isCommenting}
            />
          </div>
        </div>

        <div class="">
          {#if uploadReplyAttachment?.file?.value?.length > 0}
            <div class="mt-2 file-scroller d-flex gap-2 flex-wrap">
              {#each uploadReplyAttachment.file.value as file, index}
                <div
                  class="files d-flex align-items-center mb-1 px-1 py-1 border-radius-4"
                >
                  <span>
                    <AttachRegular
                      size={"16px"}
                      color={"var(--text-ds-neutral-100)"}
                    />
                  </span>
                  <span class="mb-0 text-fs-12 px-2 filename-ellipsis"
                    >{file?.name}</span
                  >
                  <Button
                    startIcon={DismissRegular}
                    size="extra-small"
                    type="teritiary-regular"
                    onClick={() => {
                      removeCommentAttachment(index);
                    }}
                  />
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
    margin-bottom: 10px;
    gap: 10px;
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
    margin-top: 2px;
    margin-bottom: 8px;
    color: var(--text-ds-neutral-50);
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
    color: var(--text-ds-neutral-400);
  }

  .comment-moreinfo {
    display: flex;
    gap: 10px;
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
    background: var(--bg-ds-surface-400);
    width: 100%;
    border: 1px solid var(--bg-ds-surface-400);
    font-size: 12px;
    position: relative;
    border-radius: 4px;
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

  .filename-ellipsis {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .files {
    max-width: 200px;
    padding: 2px;
    background-color: var(--bg-ds-surface-200);
    cursor: default;
  }
</style>
