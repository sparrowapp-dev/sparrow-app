<script>
  import { loginSchema } from "$lib/utils/validation";
  import { Link } from "svelte-navigator";

  export let onLearnMore;

  export let releaseNotesData;

  let items = [];

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  $: {
    items = releaseNotesData.map((note) => ({
      dateCreated: formatDate(note.dateCreated),
      versionName: note.versionName,
      features: note.features.split("\n"),
      dummyLink: note.dummyLink,
    }));
  }
</script>

<div
  class="container1"
  style="background-color: black ;  overflow-y: scroll !important;"
>
  <div style="overflow-y :scroll;">
    <div class="update-section">
      <h3
        class=""
        style="font-size: 14px; font-weight : 700 line-height: 21px; "
      >
        Release Notes
      </h3>
      <p class="fw-light" style="font-size: 14px;">
        Check out our latest releases designed to boost your productivity and
        efficiency.
      </p>

      <!-- here i want to add that mapped function that div's -->
      <!-- Mapped items -->

      <div class="p-0 outer-div">
        {#each items as item, index}
          <div class="outer-div item mt-3 d-flex flex-column internal-div">
            <div class="top-line"></div>

            <div class="d-flex ms-4 mt-3">
              <div class="details d-flex flex-column gap-0">
                <p class="text-primary">{item.dateCreated}</p>
                <p class="fs-8 fw-semibold">
                  Latest Version: {item.versionName}
                </p>
              </div>

              <div class="features">
                <p class=" test-p fs-6 font-bold">Features</p>
                <p class="features-data">
                  {#each item.features as feature}
                    <p>{feature}</p>
                  {/each}
                </p>

                <div class="d-flex align-items-center gap-3">
                  <div
                    class="d-flex align-items-center gap-3"
                    style="color: var(--text-primary-300); font-weight: 400; font-size: 16px; cursor: pointer;"
                    on:click={async () => {
                      onLearnMore();
                    }}
                  >
                    Learn more
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      <!-- here end -->
    </div>
  </div>
</div>

<style>
  .outer-div {
    width: 100%;
  }
  .details {
    width: 20%;
  }

  .top-line {
    height: 1px;
    background-color: var(--background-light);
  }
  .features {
    width: 80%;
  }
  .features-data {
    font-weight: 400;
  }

  .test-p {
    font-weight: 700;
  }

  .container1 {
    background-color: var(--text-danger-850);
    color: var(--text-secondary-100);
    padding: 20px;
    padding-top: 0px;
    border-radius: 10px;
    margin: 0 auto;
  }

  .update-section {
    padding: 15px;
    margin-top: 10px;
    border-radius: 4px;
    border-color: var(--bg-primary-600);
    display: none;
  }

  .update-section {
    display: block;
  }
</style>
