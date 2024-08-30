<script lang="ts">
  import { user } from "$lib/store";
  import type { userDetails } from "$lib/utils/interfaces";
  import { Button } from "@library/ui";
  import IconFallback from "@library/ui/icon-fallback/IconFallback.svelte";
  import AddFeedback from "@support/features/add-feedback/layout/AddFeedback.svelte";
  export let onInputFeedback;
  export let onAddFeedback;
  let userInfo: any = {};
  user.subscribe((value) => {
    userInfo = value;
  });
</script>

<div
  style="height: 89px; padding-left:34px; padding-top:8px !important; padding-bottom:21px;"
>
  <div style="font-weight: 700; font-size:20px; ">Feedbacks</div>
  <p style="font-size: 14px; color:#999999;">
    Share your feedback to help us refine and enhance your experience.
  </p>
</div>
<div
  class="d-flex flex-row align-items-center"
  style="height:80px; background-color:#151515; margin-left:30px; padding:12px; justify-content: space-between !important;  "
>
  <div class="d-flex flex-row align-items-center" style="gap:20px;">
    <div class="" style="">
      <IconFallback character={userInfo?.name?.charAt(0)} />
    </div>
    <div style="font-weight: 500px; font-size:21px;">
      Hey {userInfo?.name}, share your feedback
    </div>
  </div>
  <div style="width:calc(100% - 72.5% );  ">
    <AddFeedback {onInputFeedback} {onAddFeedback} />
  </div>
</div>
