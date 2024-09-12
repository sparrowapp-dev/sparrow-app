<script>
  import Upvote from "../Upvote.svelte";

  export let status;
  export let   setPostId;
</script>

<div>
  {#each status as status}
    <div
      class="p-2 review-card"
      on:click={setPostId("feedback", status.id)}
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
    border: 0.5px solid var(--bg-secondary-315);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .category {
    background-color: var(--bg-secondary-330);
    padding: 2px 5px 2px 5px;
    border-radius: 4px;
    font-size: 12px;
  }

  .test {
    width: calc(100% - 40px);
  }
</style>
