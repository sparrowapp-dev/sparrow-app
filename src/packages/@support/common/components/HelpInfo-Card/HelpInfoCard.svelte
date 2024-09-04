<script>
  import angleRight from "$lib/assets/angle-right-v2.svg";
  import { TriangleIcon } from "@library/icons";

  export let status;
  console.log("This is status ", status);
</script>

<div>
  {#each status as status}
    <div class="p-2 review-card">
      <div class=" d-flex justify-content-between align-items-center">
        <div>
          <p class="card-title pb-0 mb-0" style="font-weight: 500; ">
            {status.title}
          </p>
          <span class="category">{status.category.name}</span>
        </div>

        <div
          class="px-2 py-2 rounded-1"
          style="display:flex; flex-direction:column; align-items:center; border:1px solid #8A9299; cursor:pointer;"
        >
          <TriangleIcon
            height={"10px"}
            width={"10px"}
            color={"var(--white-color)"}
          />
          <span class="votes mt-1">{status.score}</span>
        </div>
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
    height: 62px;
    background-color: #1e1e1e;
    color: #fff;
    margin: 10px 0;
    border-radius: 3px;
    border: 0.5px solid #4e4e4e;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .category {
    background-color: #333;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .votes {
    color: white;
    font-size: 12px;
  }
</style>
