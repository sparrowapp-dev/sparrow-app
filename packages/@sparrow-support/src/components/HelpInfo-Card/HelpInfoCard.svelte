<script>
  import Upvote from "../Upvote.svelte";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Tag } from "@sparrow/library/ui";

  export let status;
  export let setPostId;
</script>

<div>
  {#each status as status}
    <div
      class="p-2 py-0 review-card"
      on:click={() => {
        setPostId("feedback", status.id);
        MixpanelEvent(Events.Roadmap_Feedback_Link);
      }}
    >
      <div class=" d-flex justify-content-between">
        <div class="test d-flex flex-column">
          <p
            class="card-title pb-0 mb-0 ellipsis text-ds-font-size-12 text-ds-font-weight-semi-bold"
          >
            {status.title}
          </p>
          <Tag text={status?.category?.name || "Uncategorized"} />
        </div>

        <Upvote isHoverRequired={false} upvote={status.score} />
      </div>
    </div>
  {/each}
</div>

<style>
  .card-title {
    cursor: pointer;
  }
  .card-title:hover {
    color: var(--text-primary-300);
    text-decoration: underline;
  }
  .review-card {
    height: 66px;
    background-color: var(--bg-ds-surface-600);
    color: #fff;
    margin: 10px 0;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 22px;
  }

  .test {
    width: calc(100% - 70px);
    gap: 6px;
  }
</style>
