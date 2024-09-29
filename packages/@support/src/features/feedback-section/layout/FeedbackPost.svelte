<script>
  import { LeftIcon, SearchIcon } from "@deprecate/assets/app.asset";
  import { Input, Select, Textarea } from "@sparrow/library/forms";
  import {
    AttachmentIcon,
    CategoryIcon,
    CrossIcon,
    SortIcon,
    StatusIcon,
  } from "@sparrow/library/icons";

  import { Button, IconFallback, Loader, Modal } from "@sparrow/library/ui";
  import { ImageModal } from "@sparrow/library/ui";
  import {
    CommentCard,
    Drop,
    UpvoteIcon,
  } from "@sparrow/support/common/components";
  import { FeedbackType } from "@sparrow/support/common/types";
  import { onMount } from "svelte";
  import { FormatTime } from "@sparrow/common/utils";
  const formatTimeAgo = new FormatTime().formatTimeAgo;
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
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

  const handleSortChange = (id) => {
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

  const handleLogoInputChange = (e) => {
    const errorMessage =
      "Failed to upload the file. Please check the file size or the format";

    let targetFile = [
      ...uploadFeedback.file.value,
      ...(e?.target?.files || e?.dataTransfer?.files),
    ];
    const maxImageSize = 2097152; // 2 MB
    if (targetFile?.length === 0) {
      return;
    }
    let isErrorThrown = false;

    const selectedFiles = targetFile.filter((file) => {
      let fileType = "mp4";
      if (file.name) {
        fileType = `.${(file?.name).split(".").pop().toLowerCase()}`;
      }

      if (
        fileType === ".jpg" ||
        fileType === ".jpeg" ||
        fileType === ".png" ||
        fileType === ".svg"
      ) {
        if (file.size > maxImageSize) {
          // image size exceeded
          isErrorThrown = true;
          return false;
        }
        return true;
      } else {
        isErrorThrown = true;
        return false;
      }
    });

    let totalImagesCount = selectedFiles.length + tempImageURLsArray.length;
    if (totalImagesCount > 5) {
      selectedFiles.length = 5 - tempImageURLsArray.length;
      isErrorThrown = true;
    }

    if (isErrorThrown) {
      notifications.error(errorMessage);
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
</script>

<div class="d-flex flex-row" style="margin-top: 51px; ">
  <!-- Back Button -->
  <div
    class="back-button"
    on:click={() => {
      isPostopen = false;
      handleUpvote();
    }}
  >
    <LeftIcon color={"var(--text-secondary-100)"} />
    <span class="px-2" style="font-size: 14px;">back</span>
  </div>

  <!-- Post Card -->

  {#if isLoading}
    <div style="margin-left: 200px;" class="mt-5">
      <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
    </div>
  {:else}
    <div style="gap:26px; width:calc(100% - 187px ); ">
      <div>
        <div
          class="flex-column"
          style="display: flex; height:50px;  margin-bottom: 12px; justify-content: space-between;"
        >
          <span style="font-size: 18px; font-weight: 500;">{post?.title}</span>
          <span
            class="px-2"
            style="border:0.2px solid {getColor(post?.status)
              .fontColor}; color: {getColor(post?.status)
              .fontColor}; padding-bottom: 14px; border-radius: 2px; font-size:10px !important; align-text:center;  width:fit-content; height:12px;"
          >
            {post?.status
              ? post?.status.charAt(0).toUpperCase() + post?.status.slice(1)
              : ""}
          </span>
        </div>

        <div class="d-flex flex-row">
          <div
            style="display: flex; flex-direction: column; gap: 1px; min-height:80px; width:calc(100% - 37px);"
          >
            <div style="display: flex; align-items: center; gap: 12px;">
              <IconFallback
                character={post?.author?.name?.charAt(0)}
                width="34px"
                height="32px"
                backgroundColor="var(--bg-tertiary-750)"
                borderColor="var(--border-secondary-300)"
              />
              <div style="font-size: 14px; font-weight: 500;">
                {post?.author?.name}
              </div>
            </div>
            <div
              class="text-fs-12"
              style=" padding-left:45px; font-weight:400;"
            >
              {post?.details}
            </div>
            <div class="ms-4 ps-3">
              <div>
                {#each postImages as postImage}
                  <img
                    on:click={() => {
                      isImageOpen = true;
                      currentImage = postImage;
                    }}
                    src={postImage}
                    alt="post image"
                    style="display:inline; height: 100px; margin-top: 20px; border-radius: 2px; margin:10px;"
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

              <div
                style="display: flex; align-items: center; font-size: 12px; margin-top:10px; color:var(--text-secondary-50) !important;"
              >
                <span style="padding-left:4px;">{createdAt} </span>

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
                    class="px-2"
                    on:click={() => {
                      isExposeFeedbackForm = true;
                    }}>Edit post</span
                  >
                {/if}
              </div>
            </div>
          </div>

          <div class="mt-1">
            <UpvoteIcon upvote={post?.score} />
          </div>
        </div>
      </div>

      <!-- Add comment input -->
      <div
        class={`d-flex align-items-center search-input-container  mb-5 mt-3 px-2 mb-2`}
      >
        <input
          type="text"
          id="search-input"
          class={`bg-transparent w-100 border-0 my-auto`}
          placeholder="Leave a comment"
          on:input={(e) => {
            commentValue = e.target.value;
          }}
          bind:value={commentValue}
        />

        <div class="d-flex align-items-center gap-2 ms-1">
          <!-- <AttachmentIcon
            height={"12px"}
            width={"12px"}
            color={"var(--text-secondary-200)"}
          /> -->

          <Button
            title={`Add`}
            type={`primary`}
            loaderSize={13}
            textStyleProp={"font-size: var(--small-text)"}
            buttonStyleProp={`height: 20px; rounded;`}
            loader={isCommenting}
            onClick={async () => {
              isCommenting = true;
              await onAddComment(postId, commentValue, null);
              comments = await fetchComments(postId);
              commentValue = "";
              isCommenting = false;
              MixpanelEvent(Events.Add_Comment);
            }}
            disable={commentValue.length == 0 || isCommenting}
          />
        </div>
      </div>
      {#if nestedComments.length > 0}
        <div>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="text-fs-14">Activity Feed</h6>

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
              icon={SortIcon}
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
              />
            {/each}
          </div>
        </div>
      {:else}
        <p
          class="mx-1 text-fs-12 mb-0 text-center"
          style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
        >
          No Comments Yet
        </p>
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
      <p class="text-fs-14 mb-0 text-secondary-150">Description</p>
      <p class="text-fs-12 text-secondary-200 mb-0">
        {feedbackDescription.length} / 200
      </p>

      <div
        class="p-2 bg-tertiary-300 {isDescriptionEmpty ||
        isSubjectEmpty ||
        isTextArea
          ? 'empty-data-error mb-0'
          : 'mb-3'}"
        style="height: 137px; border-radius: 4px; color:#676A80; "
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
        <hr style="margin:0px; padding-bottom:8px;" />
        <Textarea
          width={"100%"}
          on:input={() => {
            if (feedbackDescription.length > 0) {
              isDescriptionEmpty = false;
              isTextArea = false;
            }
          }}
          id="feedback-description"
          height={"90px"}
          bind:value={feedbackDescription}
          defaultBorderColor="transparent"
          hoveredBorderColor="transparent"
          focusedBorderColor={"transparent"}
          class="text-fs-14 bg-transparent ellipsis fw-normal px-2"
          style="outline:none;
       "
          disabled={false}
          placeholder="Add short description"
          maxlength={200}
        />
      </div>

      {#if isSubjectEmpty}
        <p class="error-message">Enter a relevant subject for feedback.</p>
      {/if}
      {#if isDescriptionEmpty}
        <p class="error-message">Enter a relevant description for feedback.</p>
      {/if}
      {#if isTextArea}
        <p class="error-message">
          Please enter subject and description for adding a feedback.
        </p>
      {/if}

      <div class="drop-box mb-2" style="">
        <Drop
          styleProp={""}
          maxFileSize={2048}
          onChange={handleLogoInputChange}
          labelDescription="Choose an image or drag and drop it here."
          inputId="upload--feedback-file-input"
          inputPlaceholder="Drag and Drop or"
          supportedFileTypes={[".png", ".jpg", ".jpeg", ".svg"]}
          height={"80px"}
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
    <div class="d-flex gap-1 overflow-scroll file-scroller">
      {#if tempImageURLsArray.length > 0}
        <div class="file-scroller mb-2 d-flex gap-1">
          {#each tempImageURLsArray as file, index}
            <div
              class="files d-flex align-items-center bg-tertiary-300 mb-2 px-3 py-1 border-radius-4"
            >
              <span>
                <AttachmentIcon
                  height={"12px"}
                  width={"12px"}
                  color={"var(--text-secondary-200)"}
                />
              </span>
              <span class="mb-0 text-fs-12 px-2 ellipsis"
                >{file?.name || file?.slice(-10)}</span
              >
              <span
                on:click={() => {
                  removeFile(index, true);
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
      {#if uploadFeedback?.file?.value?.length > 0}
        <div class="file-scroller mb-2 d-flex gap-1">
          {#each uploadFeedback?.file?.value as file, index}
            <div
              class="files d-flex align-items-center bg-tertiary-300 mb-2 px-3 py-1 border-radius-4"
            >
              <span>
                <AttachmentIcon
                  height={"12px"}
                  width={"12px"}
                  color={"var(--text-secondary-200)"}
                />
              </span>
              <span class="mb-0 text-fs-12 px-2 ellipsis"
                >{file?.name || file?.slice(-10)}</span
              >
              <span
                on:click={() => {
                  removeFile(index);
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
    <div class="d-flex align-items-center justify-content-end">
      <div class="d-flex">
        <Button
          type={"violet"}
          title={"Cancel"}
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
  .back-button {
    width: 187px;
    margin-right: 28px;
    height: 29px;
    display: flex;
    align-items: center;
    border-radius: 2px;
    cursor: pointer;
    padding-left: 10px;
  }

  .back-button:hover {
    background-color: #232424;
  }

  .search-input-container {
    background: var(--bg-secondary-800);
    width: 100%;
    font-size: 12px;
    height: 30px;
    position: relative;
    border: 1px solid var(--border-secondary-310);
    border-radius: 2px;
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
</style>
