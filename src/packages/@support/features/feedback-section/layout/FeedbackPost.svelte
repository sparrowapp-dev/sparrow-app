<script>
  import { LeftIcon } from "$lib/assets/app.asset";
  import { Input } from "@library/forms";

  import { IconFallback } from "@library/ui";
  import { UpvoteIcon } from "@support/common/components";
  import { onMount } from "svelte";
  export let isPostopen;
  export let userInfo;
  export let id;
  export let onRetrievePost;

  onMount(async () => {
    const res = await onRetrievePost(id);
  });
</script>

<div class="d-flex flex-row" style="margin-top: 51px; ">
  <div
    class="back-button"
    style="width:187px; margin-right:28px; height:29px; display:flex; align-items:center; border-radius:2px; cursor:pointer; padding-left:10px;"
    on:click={() => {
      isPostopen = false;
    }}
  >
    <LeftIcon color={"#FFFFFF"} />
    <span class="px-2" style="font-size: 14px;">back</span>
  </div>
  <div style="gap:26px; width:calc(100% - 187px ); ">
    <div>
      <div
        class="flex-column"
        style="display: flex; height:50px;  margin-bottom: 12px; justify-content: space-between;"
      >
        <span style="font-size: 18px; font-weight: 700;">Not able to login</span
        >
        <span
          style="border:0.2px solid #DF77F9 ; color:#DF77F9; padding-bottom: 14px; border-radius: 2px; font-size:10px !important; align-text:center; padding-left:4px; width:60px; height:12px;"
          >In Progress</span
        >
      </div>
      <div class="d-flex flex-row">
        <div
          style="display: flex; flex-direction: column; gap: 1px; min-height:133px; width:calc(100% - 37px);"
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <IconFallback character={userInfo?.name?.charAt(0)} />
            <div style="font-size: 14px; font-weight: 500;">
              {userInfo?.name}
            </div>
          </div>
          <div style="font-size: 14px; padding-left:45px; font-weight:400;">
            After login, the user is navigated to create a new account page,
            whereas the user should be able to navigate to the home page.
          </div>
          <div
            style="display: flex; align-items: center; font-size: 12px; margin-top:10px; color:#999999 !important;"
          >
            <span style="padding-left:45px;">3 hours ago </span>
            <span class="px-2">|</span>
            <span class="px-2">Edit post</span>
          </div>
        </div>
        <div><UpvoteIcon /></div>
      </div>
      <div class="w-100" style="">
        <Input
          placeholder="Leave a comment"
          style="font-size:13px; height:30px; padding-left:8px;"
          hoveredBorderColor={"none"}
          isEditIconRequired={false}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .back-button:hover {
    background-color: #232424;
  }
</style>
