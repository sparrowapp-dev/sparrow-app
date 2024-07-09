<script lang="ts">
  import { Input } from "@library/forms";
  import { Shimmer } from "../../images";

  let search = "";
  export let modifiedUser;
</script>

<div class="workspace-setting h-100" style="padding:24px; padding-top:0;">
  <div class="d-flex flex-column" style="">
    <div class="">
      <Input
        class="search-area text-fs-12 rounded p-2"
        type="search"
        bind:value={search}
        on:input={() => {}}
        width={"300px"}
        style="outline:none; width:358px; font-size:12px !important; height:32px; border:none; background-color: var(--bg-tertiary-250); border-radius:4px;"
        placeholder="Search People in my workspace"
        defaultBorderColor="transparent"
        hoveredBorderColor={"var(--border-primary-300)"}
        focusedBorderColor={"var(--border-primary-300)"}
      />
    </div>
    <div
      class="d-flex align-items-center"
      style="height: 46px; width:100%; margin-top:24px; margin-bottom:8px;"
    >
      <div
        class="rounded-5 me-2 border border-defaultColor d-flex justify-content-center align-items-center"
        style="height: 32px; width: 32px;"
      >
        {modifiedUser?.name[0]}
      </div>
      <div class="d-flex flex-column" style="width: 420px; font-size:12px; ">
        <div style="color: var(--text-secondary-100);">
          {modifiedUser?.name} (You)
        </div>
        <div style="color: var(--text-secondary-200) ;">
          {modifiedUser?.email}
        </div>
      </div>
      <div
        style="color: var(--text-secondary-100); marging-left:auto; font-size:12px;"
      >
        Owner
      </div>
    </div>
    <div
      style="width: 100%; border-bottom:2px solid #313233;  padding-bottom:8px;"
    ></div>
    <img
      src={Shimmer}
      alt="shimmer effect"
      width="100%"
      height="100%"
      style="margin-left: -5px; margin-top:8px;"
    />
  </div>
</div>
