<script lang="ts">
  import { LeftIcon, SearchIcon } from "@sparrow/library/assets";
  import { Input, Select, Textarea } from "@sparrow/library/forms";
  import {
    AttachmentIcon,
    AttachRegular,
    CategoryIcon,
    ChatMultipleRegular,
    ChevronLeftRegular,
    CrossIcon,
    DismissRegular,
    FilterRegular,
    MessageIcon,
    SortIcon,
    StatusIcon,
  } from "@sparrow/library/icons";

  import { Button, Avatar, Loader, Modal, Tag } from "@sparrow/library/ui";
  import { ImageModal } from "@sparrow/library/ui";
  import {
    CommentCard,
    Drop,
    Attachment,
    Upvote,
  } from "@sparrow/support/components";
  import { FeedbackType } from "@sparrow/support/types";
  import { onMount } from "svelte";
  import { FormatTime } from "@sparrow/common/utils";
  const formatTimeAgo = new FormatTime().formatTimeAgo;
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { notifications } from "@sparrow/library/ui";

  export let isPostopen;
  export let userInfo;
  export let onRetrievePost;
  export let onAddComment;
  export let fetchComments;
  export let postId;
  export let handleUpvote;
  export let getColor;
  export let onUpdateFeedback;

  export let likePost;
  export let dislikePost;

  let post = [];
  let nestedComments = [];
  let postImages = [];
  let comments = [];
  let createdAt = "";
  let commentValue = "";
  let currentImage = "";
  let feedbackSubject = "";
  let feedbackDescription = "";
  let uploadFeedback = {
    file: {
      value: [],
    },
  };
  let uploadedImageAttachment = {
    file: {
      value: [],
    },
  };
  let isLoading = false;
  let isSaving = false;
  let isImageOpen = false;
  let isCommenting = false;
  let isExposeFeedbackForm = false;
  let type = FeedbackType.CATEGORY;
  let isAuthor = false;
  let isEditingPost = false;
  let imageURLsArray = [];
  let tempImageURLsArray = [];

  let originalFeedbackDescription = "";
  let originalFeedbackSubject = "";

  function nestComments(comments) {
    const commentMap = {};
    comments?.forEach((comment) => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });
    comments?.forEach((comment) => {
      if (comment.parentID) {
        const parentComment = commentMap[comment.parentID];
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      }
    });
    return comments.filter((comment) => !comment.parentID);
  }

  const reloadComments = async () => {
    comments = await fetchComments(postId);
    nestedComments = nestComments(comments);
  };

  const reloadPost = async () => {
    const res = await onRetrievePost(postId);
    post = await res?.data;
    createdAt = formatTimeAgo(post?.created);
    postImages = post?.imageURLs;
    comments = await fetchComments(postId);
    isAuthor = userInfo?.email === post?.author?.email;
    feedbackDescription = post?.details;
    feedbackSubject = post?.title;
    type = post?.category?.name;
    imageURLsArray = post?.imageURLs?.map((url) => url);
    tempImageURLsArray = [...imageURLsArray];
    originalFeedbackDescription = feedbackDescription;
    originalFeedbackSubject = feedbackSubject;
  };

  onMount(async () => {
    isLoading = true;
    await reloadPost();
    isLoading = false;
  });

  function sortCommentsOldToNew(comments) {
    if (!Array.isArray(comments)) {
      console.error("Invalid comments data: expected an array.");
      return [];
    }
    return comments
      .slice()
      .sort((a, b) => new Date(a.created) - new Date(b.created));
  }

  function sortCommentsNewToOld(comments) {
    if (!Array.isArray(comments)) {
      console.error("Invalid comments data: expected an array.");
      return [];
    }
    return comments
      .slice()
      .sort((a, b) => new Date(b.created) - new Date(a.created)); // Reversed comparison
  }

  const handleSortChange = (id: string) => {
    if (id == "new first") {
      nestedComments = sortCommentsNewToOld(nestedComments);
    } else {
      nestedComments = sortCommentsOldToNew(nestedComments);
    }
  };

  $: {
    if (comments) {
      nestedComments = nestComments(comments);
    }
  }

  let isDescriptionEmpty = false;
  let isSubjectEmpty = false;
  let isTextArea = false;

  const handleLogoInputChange = (e: InputEvent) => {
    const errorMessage =
      "Failed to upload the file. You are allowed to upload only 5 files per feedback.";
    const formatErrorMessage =
      "This file type isn’t supported. Upload in SVG, JPEG, JPG, or PNG.";
    const sizeErrorMessage = "Upload limit exceeded. Choose a file under 2 MB.";

    let targetFile = [
      ...uploadFeedback.file.value,
      ...(e?.target?.files || e?.dataTransfer?.files),
    ];
    const maxImageSize = 2097152; // 2 MB
    if (targetFile?.length === 0) {
      return;
    }
    let isLimitError = false;
    let isFormatError = false;
    let isSizeError = false;

    const selectedFiles = targetFile.filter((file) => {
      let fileType = "mp4";
      if (file.name) {
        fileType = `.${(file?.name).split(".").pop().toLowerCase()}`;
      }

      if (
        fileType !== ".jpg" &&
        fileType !== ".jpeg" &&
        fileType !== ".png" &&
        fileType !== ".svg"
      ) {
        isFormatError = true;
        return false;
      }

      if (
        fileType === ".jpg" ||
        fileType === ".jpeg" ||
        fileType === ".png" ||
        fileType === ".svg"
      ) {
        if (file.size > maxImageSize) {
          // image size exceeded
          isSizeError = true;
          return false;
        }
        return true;
      } else {
        isLimitError = true;
        return false;
      }
    });

    let totalImagesCount = selectedFiles.length + tempImageURLsArray.length;
    if (totalImagesCount > 5) {
      selectedFiles.length = 5 - tempImageURLsArray.length;
      isLimitError = true;
    }

    if (isLimitError) {
      notifications.error(errorMessage);
    }
    if (isSizeError) {
      notifications.error(sizeErrorMessage);
    }
    if (isFormatError) {
      notifications.error(formatErrorMessage);
    }

    uploadFeedback.file.value = selectedFiles;
  };

  const removeFile = (index, isImageUrl = false) => {
    if (isImageUrl) {
      // Remove from imageURLsArray
      tempImageURLsArray = tempImageURLsArray.filter((_, i) => i !== index);
    } else {
      // Remove from uploadFeedback.file.value
      const files = Array.from(uploadFeedback.file.value).filter(
        (_, i) => i !== index,
      );
      if (uploadFeedback?.file) {
        uploadFeedback.file.value = files;
      }
    }
  };

  let inputId = "attachment-icon-container1";

  const handleInputAttachment = (e: InputEvent) => {
    const sizeExceededMessage =
      "One or more files exceed the size limit of 2MB.";
    const typeErrorMessage =
      "Only image files (jpg, jpeg, png, svg) are allowed.";
    const maxFilesExceededMessage =
      "Failed to upload the file. You are allowed to upload only 3 files per comment";

    // Safely gather selected files
    let newFiles = Array.from(e?.target?.files || e?.dataTransfer?.files || []);

    const maxImageSize = 2097152; // 2MB
    let isSizeExceeded = false;
    let isInvalidType = false;

    // Filter valid image files
    const validNewFiles = newFiles.filter((file) => {
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
    const existingFiles = uploadedImageAttachment.file?.value || [];

    // Prevent adding duplicates
    const newUniqueFiles = validNewFiles.filter(
      (newFile) =>
        !existingFiles.some(
          (existingFile) => existingFile.name === newFile.name,
        ),
    );

    // Calculate total file count after adding new unique files
    let currentFileCount = existingFiles.length;
    let newFileCount = newUniqueFiles.length;

    // Prevent adding more than 5 files in total
    if (currentFileCount + newFileCount > 3) {
      newUniqueFiles.length = 3 - currentFileCount; // Adjust the number of files to keep the total <= 5
      notifications.error(maxFilesExceededMessage);
    }

    // Error notifications
    if (isSizeExceeded) {
      notifications.error(sizeExceededMessage);
    }
    if (isInvalidType) {
      notifications.error(typeErrorMessage);
    }

    // Update the feedback files with only new unique files
    if (!isSizeExceeded && !isInvalidType) {
      uploadedImageAttachment.file.value = [
        ...existingFiles,
        ...newUniqueFiles,
      ];
    }

    // Reset the input field after the files are processed
    e.target.value = ""; // This allows the same file to be uploaded again
  };

  const removeCommentAttachment = (index: number) => {
    uploadedImageAttachment.file.value =
      uploadedImageAttachment.file.value.filter(
        (_i, idx) => idx !== index, // Corrected: Use 'idx' to check against the index
      );
  };

  /**
   * Handles adding a comment to the post.
   *
   * @param {string} postId - The ID of the post to add the comment to.
   * @returns {Promise<void>} - A promise that resolves once the comment has been added and comments have been fetched.
   */
  const handleAddComment = async (postId: string) => {
    isCommenting = true;
    commentValue = commentValue.trim();

    if (commentValue !== "") {
      await onAddComment(postId, commentValue, null, uploadedImageAttachment);
    }

    commentValue = "";
    uploadedImageAttachment = {
      file: {
        value: [],
      },
    };

    comments = await fetchComments(postId);
    isCommenting = false;

    MixpanelEvent(Events.Add_Comment);
    type = "new first";
  };

  const handleCommentInputValue = (e: InputEvent) => {
    commentValue = e.target.value;
  };
</script>

<div class="d-flex flex-row justify-content-between" style="margin-top: 24px; ">
  <!-- Back Button -->
  <div style="margin-right: 28px;">
    <Button
      title="Back"
      type="teritiary-regular"
      size="medium"
      startIcon={ChevronLeftRegular}
      onClick={() => {
        isPostopen = false;
        handleUpvote();
      }}
      buttonClassProp={"ps-0"}
    />
  </div>

  <!-- Post Card -->

  {#if isLoading}
    <div style="width:100%; margin-top: 64px;" class="">
      <Loader loaderSize={"20px"} loaderMessage="Loading..." />
    </div>
  {:else}
    <div style="gap:26px; width:calc(100% - 187px ); padding-inline: 12px;">
      <div>
        <div
          class="flex-column mt-3"
          style="display: flex; height:50px;  margin-bottom: 12px; justify-content: space-between;"
        >
          <span
            class="text-ds-font-size-16 text-ds-font-weight-semi-bold"
            style="color: var(--text-ds-neutral-50);">{post?.title}</span
          >
          <Tag type={getColor(post?.status)} text={post?.status || ""} />
        </div>

        <div class="d-flex flex-row">
          <div
            style="display: flex; flex-direction: column; gap: 1px; min-height:80px; width:calc(100% - 37px);"
          >
            <div style="display: flex; align-items: center; gap: 12px;">
              <Avatar
                type={"letter"}
                size={"extra-small"}
                letter={post?.author?.name?.charAt(0)}
                bgColor={"var(--bg-ds-surface-500)"}
              />
              <div
                class="text-ds-font-size-14 text-ds-font-weight-semi-bold"
                style="color: var(--text-ds-neutral-50);"
              >
                {post?.author?.name}
              </div>
            </div>
            <div
              class="text-ds-font-size-14 text-ds-font-weight-regular mt-2"
              style=" padding-left:36px; color: var(--text-ds-neutral-200);"
            >
              {post?.details}
            </div>
            <div class="ms-4">
              <div>
                {#each postImages as postImage}
                  <img
                    on:click={() => {
                      isImageOpen = true;
                      currentImage = postImage;
                    }}
                    src={postImage}
                    alt="post image"
                    style="display:inline; height: 100px; margin-top: 20px; border-radius: 2px; margin:12px;   object-fit: contain;   max-width: 100%; "
                  />
                  <ImageModal
                    isOpen={isImageOpen}
                    type={"dark"}
                    width={"50%"}
                    height={"60%"}
                    zIndex={10000}
                    handleModalState={(flag = false) => {
                      isImageOpen = flag;
                    }}
                  >
                    <img
                      src={currentImage}
                      alt="post image"
                      style="width: 100%; height: 100%; object-fit: cover;"
                    />
                  </ImageModal>
                {/each}
              </div>

              <div
                class="mt-2"
                style="display: flex; align-items: center; font-size: 12px; color:var(--text-ds-neutral-400) !important;"
              >
                <span style="padding-left:14px;">{createdAt} </span>

                {#if isAuthor}
                  <span class="px-2">|</span>
                  <span
                    role="button"
                    on:click={() => {
                      isEditingPost = !isEditingPost;
                    }}
                    style="color: {isEditingPost
                      ? 'white'
                      : 'grey'}; text-decoration: {isEditingPost
                      ? 'underline'
                      : 'none'};"
                    class=""
                    on:click={() => {
                      isExposeFeedbackForm = true;
                      MixpanelEvent(Events.Edit_Post);
                    }}>Edit post</span
                  >
                {/if}
              </div>
            </div>
          </div>

          <div class="" style="cursor: pointer; margin-top: 36px;">
            <Upvote
              isPostLiked={post?.isPostLiked}
              upvote={post?.score}
              {likePost}
              {dislikePost}
              postID={post.id}
            />
          </div>
        </div>
      </div>

      <!-- Add comment input -->
      <div
        class={`d-flex align-items-start search-input-container mt-3 p-1 px-2`}
        style=" display:flex; flex-direction:column; margin-bottom: 36px;"
      >
        <div class="d-flex justify-content-between gap-3" style="width: 100%;">
          <input
            type="text"
            id="search-input"
            class={`bg-transparent w-100 border-0 my-auto`}
            placeholder="Leave a comment"
            on:input={handleCommentInputValue}
            bind:value={commentValue}
          />

          <div class="d-flex align-items-center gap-3">
            <Attachment onFileSelect={handleInputAttachment} {inputId} />

            <Button
              title={`Add`}
              type={`primary`}
              size={"small"}
              loaderSize={13}
              customWidth={"72px"}
              textStyleProp={"font-size:11px;"}
              buttonStyleProp={`justify-content:center;`}
              loader={isCommenting}
              onClick={() => handleAddComment(postId)}
              disable={commentValue.trim() === "" || isCommenting}
            />
          </div>
        </div>

        <div class="">
          {#if uploadedImageAttachment?.file?.value?.length > 0}
            <div class="mt-2 file-scroller d-flex gap-2 flex-wrap">
              {#each uploadedImageAttachment.file.value as file, index}
                <div
                  class="files d-flex align-items-center mb-1 px-1 py-1 border-radius-4"
                >
                  <span>
                    <AttachRegular
                      size={"16px"}
                      color={"var(--text-ds-neutral-100)"}
                    />
                  </span>
                  <span class="mb-0 text-ds-font-size-12 px-2 ellipsis"
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
      {#if nestedComments.length > 0}
        <div>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6
              class="text-ds-font-size-16"
              style="color: var(--text-ds-neutral-50);"
            >
              Activity Feed
            </h6>

            <div style="margin-right: -8px;">
              <Select
                data={[
                  {
                    name: "New First ",
                    id: "new first",
                  },
                  {
                    name: "Old First",
                    id: "old first",
                  },
                ]}
                onclick={(id = "") => {
                  type = id;
                  handleSortChange(id);
                }}
                titleId={type}
                placeholderText={"Sort By"}
                zIndex={499}
                disabled={false}
                iconRequired={true}
                icon={FilterRegular}
                iconColor={"var(--icon-primary-300)"}
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
                headerFontSize={"10px"}
                isDropIconFilled={true}
                position={"absolute"}
                variant={"secondary"}
              />
            </div>
          </div>

          <!-- List of comments -->
          <div>
            {#each nestedComments as comment}
              <CommentCard
                {postId}
                {onAddComment}
                {userInfo}
                {comment}
                {fetchComments}
                {reloadComments}
                {getColor}
              />
            {/each}
          </div>
        </div>
      {:else}
        <div
          class="d-flex"
          style="display: flex; flex-direction:column; justify-content:center; align-items:center; margin-top: 64px;"
        >
          <ChatMultipleRegular
            size={"32px"}
            color={"var(--text-secondary-550)"}
          />

          <p
            class="mx-1 text-ds-font-size-14 text-ds-font-weight-500 mb-0 mt-4 text-center"
            style="color: var(--text-secondary-550); letter-spacing: 0.5px;"
          >
            No result found.
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<Modal
  title={"Edit Feedback"}
  type={"dark"}
  width={"40%"}
  zIndex={10000}
  isOpen={isExposeFeedbackForm}
  handleModalState={(flag = false) => {
    isExposeFeedbackForm = flag;
    isEditingPost = false;
  }}
>
  <div>
    <div class="pt-2"></div>

    <div style="">
      <p
        class="text-ds-font-size-14 mb-0"
        style="color: var(--text-ds-neutral-200);"
      >
        Description
      </p>
      <p
        class="text-ds-font-size-12 mb-2"
        style="color: var(--text-ds-neutral-400);"
      >
        {feedbackDescription.length} / 200
      </p>

      <div
        class="p-2 {isDescriptionEmpty || isSubjectEmpty || isTextArea
          ? 'empty-data-error mb-0'
          : 'mb-3'}"
        style="height: 137px; border-radius: 4px; color: var(--text-ds-neutral-400); background-color: var(--bg-ds-surface-400);"
      >
        <Input
          on:input={() => {
            if (feedbackSubject.length > 0) {
              isSubjectEmpty = false;
              isTextArea = false;
            }
          }}
          id="feedback-subject"
          width={"100%"}
          type="text"
          size={"large"}
          isEditIconRequired={false}
          bind:value={feedbackSubject}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-20 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;"
          disabled={false}
          placeholder="Subject"
          maxlength={200}
        />
        <hr class="m-0 ms-2" style="padding-bottom:5px; border-width: 2px;" />
        <Textarea
          width={"100%"}
          on:input={() => {
            if (feedbackDescription.length > 0) {
              isDescriptionEmpty = false;
              isTextArea = false;
            }
          }}
          id="feedback-description"
          height={"76px"}
          bind:value={feedbackDescription}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          blankTextarea={true}
          class="text-fs-14 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;
       "
          disabled={false}
          placeholder="Add short description"
          maxlength={200}
        />
      </div>

      {#if isSubjectEmpty}
        <p class="error-message">Enter a suitable subject for feedback.</p>
      {/if}
      {#if isDescriptionEmpty}
        <p class="error-message">Enter relevant description for feedback.</p>
      {/if}
      {#if isTextArea}
        <p class="error-message">
          Please enter subject and description for adding a feedback.
        </p>
      {/if}

      <p
        class="text-ds-font-size-14 text-ds-font-weight-regular mb-0"
        style="color: var(--text-ds-neutral-200);"
      >
        Upload Files
      </p>
      <p
        class="text-ds-font-size-12 mb-2"
        style="color: var(--text-ds-neutral-400);"
      >
        Upload up to 5 images. Max size: 2MB each.
      </p>

      <div class="drop-box mb-2" style="">
        <Drop
          styleProp={""}
          maxFileSize={2048}
          onChange={handleLogoInputChange}
          labelDescription="Choose an image or drag and drop it here."
          inputId="upload--feedback-file-input"
          inputPlaceholder="Drag and Drop or"
          supportedFileTypes={[".png", ".jpg", ".jpeg", ".svg"]}
          height={"120px"}
          infoMessage={"Images: SVG, PNG, JPG, JPEG <br/> (limit 2MB each)<br/> No video files, only images <br/> are accepted"}
        />
        <div class="d-flex justify-content-between">
          <div></div>
          <div>
            <span class="text-fs-12 text-tertiary-100">
              {(uploadFeedback.file.value.length || 0) +
                (tempImageURLsArray.length || 0)}/5
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex file-scroller gap-2 flex-wrap">
      {#if tempImageURLsArray.length > 0}
        <div class="file-scroller mb-2 d-flex gap-2 flex-wrap">
          {#each tempImageURLsArray as file, index}
            <div
              class="files d-flex align-items-center mb-2 px-1 border-radius-4"
            >
              <span class="flex-shrink-0">
                <AttachRegular size={"16px"} />
              </span>
              <span class="mb-0 text-ds-font-size-12 px-2 filename-ellipsis"
                >{file?.name || file?.slice(-10)}</span
              >
              <Button
                startIcon={DismissRegular}
                size="extra-small"
                type="teritiary-regular"
                onClick={() => {
                  removeFile(index, true);
                }}
              />
            </div>
          {/each}
        </div>
      {/if}

      {#if uploadFeedback?.file?.value?.length > 0}
        <div class="file-scroller mb-2 d-flex gap-2 flex-wrap">
          {#each uploadFeedback?.file?.value as file, index}
            <div
              class="files d-flex align-items-center mb-2 px-1 border-radius-4"
            >
              <span class="flex-shrink-0">
                <AttachRegular size={"16px"} />
              </span>
              <span class="mb-0 text-ds-font-size-12 px-2 filename-ellipsis"
                >{file?.name || file?.slice(-10)}</span
              >
              <Button
                startIcon={DismissRegular}
                size="extra-small"
                type="teritiary-regular"
                onClick={() => {
                  removeFile(index);
                }}
              />
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="d-flex align-items-center justify-content-end">
      <div class="d-flex">
        <Button
          type={"secondary"}
          title={"Cancel"}
          customWidth={"96px"}
          buttonClassProp={"me-2"}
          onClick={async () => {
            isExposeFeedbackForm = false;
            isEditingPost = false;
            tempImageURLsArray = [...imageURLsArray];
            feedbackDescription = originalFeedbackDescription;
            feedbackSubject = originalFeedbackSubject; // Restore original values
            isTextArea = false;
            isDescriptionEmpty = false;
            isSubjectEmpty = false;
            uploadFeedback = {
              file: {
                value: [],
              },
            };
          }}
        />
        <Button
          type={"primary"}
          title={"Save"}
          customWidth={"96px"}
          loader={isSaving}
          onClick={async () => {
            isSaving = true;

            if (!feedbackDescription || !feedbackSubject) {
              if (!feedbackDescription && !feedbackSubject) {
                isTextArea = true;
                isSubjectEmpty = isDescriptionEmpty = false;
              } else {
                isTextArea = false;
                isSubjectEmpty = !feedbackSubject;
                isDescriptionEmpty = !feedbackDescription;
              }
              isSaving = false;
            } else {
              isSubjectEmpty = isDescriptionEmpty = isTextArea = false;
              const res = await onUpdateFeedback(
                post?.id,
                feedbackSubject,
                feedbackDescription,
                uploadFeedback,
                tempImageURLsArray,
              );
              if (res?.isSuccessful) {
                isExposeFeedbackForm = false;
                isEditingPost = false;
                await reloadPost();
                uploadFeedback = {
                  file: {
                    value: [],
                  },
                };
              }
            }
            isSaving = false;
          }}
        />
      </div>
    </div>
  </div>
</Modal>

<style>
  .visually-hidden {
    display: none;
  }

  .search-input-container {
    background: var(--bg-ds-surface-400);
    width: 100%;
    font-size: 14px;
    border: 1px solid var(--bg-ds-surface-400);
    position: relative;
    border-radius: 4px;
  }

  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  .empty-data-error {
    border: 1px solid var(--error--color);
  }

  .error-message {
    color: var(--error--color);
    font-size: 12px;
    margin-bottom: 20px;
  }

  .file-scroller::-webkit-scrollbar {
    display: none;
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
  }
</style>
