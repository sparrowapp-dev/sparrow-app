<script>
  import { LeftIcon, SearchIcon } from "$lib/assets/app.asset";
  import { Input, Select, Textarea } from "@library/forms";
  import {
    AttachmentIcon,
    CategoryIcon,
    CrossIcon,
    SortIcon,
    StatusIcon,
  } from "@library/icons";
  import Comment from "@library/icons/Comment.svelte";

  import { Button, IconFallback, Modal } from "@library/ui";
  import ImageModal from "@library/ui/image-modal/ImageModal.svelte";
  import Spinner from "@library/ui/spinner/Spinner.svelte";
  import { CommentCard, UpvoteIcon } from "@support/common/components";
  import { FeedbackType } from "@support/common/types";
  import { FeedbackStatusType } from "@support/common/types/feedback";
  import { Drop } from "@workspaces/features/import-collection/components";
  import { onMount } from "svelte";

  export let isPostopen;
  export let userInfo;
  export let id;
  export let onRetrievePost;
  export let postIdFromActivity;
  export let onAddComment;
  export let fetchComments;

  let post = [];
  let currentImage = "";
  let createdAt = "";
  let isExposeFeedbackForm = false;
  let feedbackDescription = "";
  let feedbackSubject = "";
  let type = FeedbackType.CATEGORY;
  let isLoading = false;
  let postImages = [];
  let commentValue = "";
  let loading = false;

  const timeAgo = (date) => {
    const diffInSeconds = (new Date() - new Date(date)) / 1000;
    const hours = Math.floor(diffInSeconds / 3600);

    return hours >= 1
      ? `${hours} hour${hours > 1 ? "s" : ""} ago`
      : `${Math.floor(diffInSeconds / 60)} minutes ago`;
  };

  let isImageOpen = false;

  let comments = [];
  let nestedComments = [];

  function nestComments(comments) {
    const commentMap = {};
    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });
    comments.forEach((comment) => {
      if (comment.parentID) {
        const parentComment = commentMap[comment.parentID];
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      }
    });
    return comments.filter((comment) => !comment.parentID);
  }

  const logMessage = async () => {
    comments = await fetchComments(id);
    nestedComments = nestComments(comments);
  };

  onMount(async () => {
    try {
      loading = true;
      console.log(post);
      const res = await onRetrievePost(id || postIdFromActivity);
      post = await res?.data;
      console.log(post);
      console.log(post, "post");
      createdAt = timeAgo(post?.created);
      postImages = post?.imageURLs;
      comments = await fetchComments(id);
    } catch (error) {
      loading = false;
    }
  });

  $: {
    if (comments) {
      nestedComments = nestComments(comments);
    }
  }
</script>

<div class="d-flex flex-row" style="margin-top: 51px; ">
  <!-- Back Button -->
  <div
    class="back-button"
    on:click={() => {
      isPostopen = false;
    }}
  >
    <LeftIcon color={"#FFFFFF"} />
    <span class="px-2" style="font-size: 14px;">back</span>
  </div>

  <!-- Post Card -->

  <div style="gap:26px; width:calc(100% - 187px );">
    {#if post.length === 0}
      <div
        style="display: flex; justify-content: center; margin: 60px 0px 60px 0px;"
      >
        <Spinner size={10} classProp="small" />
      </div>
    {:else}
      <div>
        <div
          class="flex-column"
          style="display: flex; height:50px;  margin-bottom: 12px; justify-content: space-between;"
        >
          <span style="font-size: 18px; font-weight: 700;">{post?.title}</span>
          <span
            class="px-2"
            style="border:0.2px solid #DF77F9 ; color:#DF77F9; padding-bottom: 14px; border-radius: 2px; font-size:10px !important; align-text:center;  width:fit-content; height:12px;"
            >{post?.status}</span
          >
        </div>

        <div class="d-flex flex-row">
          <div
            style="display: flex; flex-direction: column; gap: 1px; min-height:80px; width:calc(100% - 37px);"
          >
            <div style="display: flex; align-items: center; gap: 12px;">
              <IconFallback character={post?.author?.name.charAt(0)} />
              <div style="font-size: 14px; font-weight: 500;">
                <!-- {userInfo?.name} -->
                {post?.author?.name}
              </div>
            </div>
            <div style="font-size: 14px; padding-left:45px; font-weight:400;">
              {post?.details}
            </div>
            <div>
              {#each postImages as postImage}
                <img
                  on:click={() => {
                    isImageOpen = true;
                    currentImage = postImage;
                  }}
                  src={postImage}
                  alt="post image"
                  style="width:100px; display:inline; height: 100px; margin-top: 20px; border-radius: 2px; margin:10px;"
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
              style="display: flex; align-items: center; font-size: 12px; margin-top:10px; color:#999999 !important;"
            >
              <span style="padding-left:10px;">{createdAt} </span>
              <span class="px-2">|</span>
              <span
                class="px-2"
                on:click={() => {
                  isExposeFeedbackForm = true;
                }}>Edit post</span
              >
            </div>
          </div>

          <div>
            <UpvoteIcon upvote={post?.score} />
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

          <div class="d-flex align-items-center gap-2">
            <AttachmentIcon
              height={"12px"}
              width={"12px"}
              color={"var(--text-secondary-200)"}
            />

            <Button
              title={`Add`}
              type={`primary`}
              loaderSize={17}
              textStyleProp={"font-size: var(--small-text)"}
              buttonClassProp={`ps-2`}
              buttonStyleProp={`height: 20px; width:35px; rounded;`}
              onClick={async () => {
                await onAddComment(id, commentValue, null);
                comments = await fetchComments(id);
                commentValue = "";
              }}
              disable={commentValue.length == 0}
            />
          </div>
        </div>

        <!-- Commnet activity section -->
        {#if nestedComments.length > 0}
          <div>
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6>Activity Feed</h6>

              <Select
                data={[
                  {
                    name: "Open",
                    id: FeedbackStatusType.OPEN,
                  },
                  {
                    name: "Completed",
                    id: FeedbackStatusType.COMPLETED,
                  },
                ]}
                onclick={(id = "") => {}}
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
                  {onAddComment}
                  {userInfo}
                  {comment}
                  {fetchComments}
                  {logMessage}
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
</div>

<Modal
  title={"Edit Feedback"}
  type={"dark"}
  width={"40%"}
  zIndex={10000}
  isOpen={isExposeFeedbackForm}
  handleModalState={(flag = false) => {
    isExposeFeedbackForm = flag;
    feedbackDescription = post?.details;
    feedbackSubject = post?.title;
    type = FeedbackType.CATEGORY;
  }}
>
  <div class="pt-2"></div>
  <div class="d-flex pb-2">
    <Select
      data={[
        {
          name: "Feature Request",
          id: FeedbackType.FEATURE_REQUEST,
        },
        {
          name: "UX Improvement",
          id: FeedbackType.UI_IMPROVEMENT,
        },
        {
          name: "Bugs",
          id: FeedbackType.BUG,
        },
        {
          name: "All Categories",
          id: FeedbackType.ALL_CATEGORY,
        },
      ]}
      iconRequired={true}
      icon={CategoryIcon}
      placeholderText={"Category"}
      id={"feeds"}
      zIndex={499}
      titleId={type}
      onclick={(id = "") => {
        type = id;
      }}
      disabled={false}
      borderType={"none"}
      borderActiveType={"none"}
      borderHighlight={"hover-active"}
      headerHighlight={"hover-active"}
      headerHeight={"36px"}
      minBodyWidth={"150px"}
      minHeaderWidth={"128px"}
      maxHeaderWidth={"200px"}
      borderRounded={"4px"}
      headerTheme={"violet2"}
      bodyTheme={"violet"}
      menuItem={"v2"}
      headerFontSize={"10px"}
      isDropIconFilled={true}
      position={"absolute"}
    />
  </div>
  <div style="">
    <p class="text-fs-14 mb-0 text-secondary-150">Description</p>
    <p class="text-fs-12 text-secondary-200 mb-0">
      {feedbackDescription.length} / 200
    </p>

    <div
      class="p-2 bg-tertiary-300 mb-3"
      style="height: 137px; border-radius: 4px; color:#676A80; "
    >
      <Input
        on:input={() => {
          // if (feedbackSubject.length > 0) {
          //   isSubjectEmpty = false;
          //   isTextArea = false;
          // }
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
          // if (feedbackDescription.length > 0) {
          //   isDescriptionEmpty = false;
          //   isTextArea = false;
          // }
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

    <div class="drop-box mb-2" style="">
      <Drop
        styleProp={""}
        maxFileSize={2048}
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
          <span class="text-fs-12 text-tertiary-100">/5</span>
        </div>
      </div>
    </div>
  </div>
  <div class="d-flex align-items-center justify-content-between">
    <div class="d-flex">
      <Button
        type={"violet"}
        title={"Cancel"}
        buttonClassProp={"me-2"}
        onClick={async () => {
          isExposeFeedbackForm = false;
          feedbackDescription = "";
          feedbackSubject = "";
          type = FeedbackType.CATEGORY;
          uploadFeedback = {
            file: {
              value: [],
            },
          };
        }}
      />
      <Button
        type={"primary"}
        title={"Add"}
        loader={isLoading}
        onClick={async () => {
          isLoading = true;

          if (!feedbackDescription || !feedbackSubject) {
            if (!feedbackDescription && !feedbackSubject) {
              isTextArea = true;
              isSubjectEmpty = isDescriptionEmpty = false;
            } else {
              isTextArea = false;
              isSubjectEmpty = !feedbackSubject;
              isDescriptionEmpty = !feedbackDescription;
            }
            isLoading = false;
          } else {
            isSubjectEmpty = isDescriptionEmpty = isTextArea = false;
            const res = await onInputFeedback(
              feedbackSubject,
              feedbackDescription,
              type === FeedbackType.CATEGORY ? FeedbackType.ALL_CATEGORY : type,
              uploadFeedback,
            );
            if (res?.isSuccessful) {
              isExposeFeedbackForm = false;
              type = FeedbackType.CATEGORY;
              feedbackDescription = "";
              feedbackSubject = "";
            }
          }
          isLoading = false;
        }}
      />
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
    /* border: 1px solid var(--border-color); */
    background: var(--bg-tertiary-400);
    width: 100%;
    font-size: 12px;
    height: 30px;
    position: relative;
    border: 1px solid transparent;
  }
  /* .search-input-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  } */

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
