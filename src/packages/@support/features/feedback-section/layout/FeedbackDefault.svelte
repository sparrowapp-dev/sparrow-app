<script>
  import { IconFallback } from "@library/ui";
  import { AddFeedback } from "@support/features/add-feedback";
  export let userInfo;
  export let onInputFeedback;
  export let onAddFeedback;
</script>

<div style="height: 89px; !important; padding-bottom:21px;">
  <div style="font-weight: 700; font-size:20px; margin-bottom:12px;  ">
    Feedbacks
  </div>
  <p style="font-size: 14px; color:#999999;">
    Share your feedback to help us refine and enhance your experience.
  </p>
</div>
<div
  class="d-flex flex-row align-items-center"
  style="height:80px; background-color:#151515; padding:12px; justify-content: space-between !important;  "
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
    <AddFeedback {onInputFeedback} {onAddFeedback} selectId={"gightPanel"} />
  </div>
</div>
