<script>
  import { Avatar } from "@sparrow/library/ui";
  import { AddFeedback } from "../../../features/add-feedback";
  export let userInfo;
  export let onInputFeedback;
  export let onAddFeedback;
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
</script>

<div style="">
  <p
    class="text-ds-font-size-20 fw-semibold mb-2"
    style="color: var(--text-ds-neutral-50);"
  >
    Feedbacks
  </p>
  <p class="text-ds-font-size-14" style=" color: var(--text-ds-neutral-400);">
    Share your feedback to help us refine and enhance your experience.
  </p>
</div>
<div
  class="d-flex flex-row align-items-center px-3"
  style="height:76px; background-color:var(--bg-ds-surface-700); padding:12px; justify-content: space-between !important; border-radius: 6px; "
>
  <div class="d-flex flex-row align-items-center" style="gap:20px;">
    <div class="" style="">
      <Avatar
        type={"letter"}
        size={"medium"}
        letter={userInfo?.name?.charAt(0)}
        bgColor={"var(--bg-ds-secondary-400)"}
      />
    </div>
    <div
      class="text-ds-font-size-20 fw-semibold"
      style="color: var(--text-ds-neutral-50);"
    >
      Hey {userInfo?.name}, share your feedback
    </div>
  </div>
  <div
    style="width:calc(100% - 70% );  "
    on:click={() => {
      MixpanelEvent(Events.Add_Feedback);
    }}
  >
    <AddFeedback {onInputFeedback} {onAddFeedback} selectId={"gightPanel"} />
  </div>
</div>
