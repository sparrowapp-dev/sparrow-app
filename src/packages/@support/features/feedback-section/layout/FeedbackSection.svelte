<script lang="ts">
  import { user } from "$lib/store";
  import type { userDetails } from "$lib/utils/interfaces";
  import { Button } from "@library/ui";
  import IconFallback from "@library/ui/icon-fallback/IconFallback.svelte";
  export let onInputFeedback;
  let userInfo;
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
  style="height:80px; background-color:#151515; margin-left:30px; padding:20px; justify-content: space-between !important;  "
>
  <div class="d-flex flex-row align-items-center" style="gap:20px;">
    <div class="" style="">
      <IconFallback character={userInfo?.name?.charAt(0)} />
    </div>
    <div style="font-weight: 500px; font-size:21px;">
      Hey {userInfo?.name}, share your feedback
    </div>
  </div>
  <div style=" ">
    <Button
      title="+ Add Feedback"
      type="primary"
      buttonStyleProp="width:240px; height:40px; align-items:center; justify-content:center; font-weight:600px; font-size:14px;"
    />
  </div>
</div>
