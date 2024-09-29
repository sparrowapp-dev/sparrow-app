<script>
  import Upvote from "../Upvote.svelte";
  import { Events } from "@deprecate/utils/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  export let status;
  export let setPostId;
</script>

<div>
  {#each status as status}
    <div
      class="p-2 review-card"
      on:click={() => {
        setPostId("feedback", status.id);
        MixpanelEvent(Events.Roadmap_Feedback_Link);
      }}
    >
      <div class=" d-flex justify-content-between align-items-center">
        <div class="test">
          <p class="card-title pb-0 mb-0 ellipsis" style="font-weight: 500; ">
            {status.title}
          </p>
          <span class="category">{status?.category?.name}</span>
        </div>

        <Upvote upvote={status.score} />
      </div>
    </div>
  {/each}
</div>

<style>
  .card-title {
    font-size: 13px;
    cursor: pointer;
  }
  .card-title:hover {
    color: var(--text-primary-300);
    text-decoration: underline;
  }
  .review-card {
    height: 62px;
    background-color: var(--background-dark);
    color: #fff;
    margin: 10px 0;
    border-radius: 3px;
    border: 1px solid var(--border-secondary-295);
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 22px;
  }

  .category {
    background-color: var(--bg-secondary-330);
    padding: 2px 5px 2px 5px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    color: #e0e0e0;
  }

  .test {
    width: calc(100% - 40px);
  }
</style>
