<script lang="ts">
  import { SearchIcon } from "@sparrow/library/assets";
  import { Select } from "@sparrow/library/forms";
  import {
    CategoryIcon,
    CrossIcon,
    MessageDisabledIcon,
    MessageIcon,
    StackIcon,
  } from "@sparrow/library/icons";
  import { Loader } from "@sparrow/library/ui";
  import HelpInfoCard from "../../../components/HelpInfo-Card/HelpInfoCard.svelte";
  import { FeedbackType } from "@sparrow/support/types";

  import { onMount } from "svelte";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";

  /** @type {Function} Function to fetch posts. */
  export let fetchPosts;

  /** @type {Function} Sets the post ID. @param {number} id - Post ID. */
  export let setPostId;

  /** @type {Function} Returns color based on status. @param {string} status - Status to determine color. @returns {{ fontColor: string, backgroundColor: string }} */
  export let getColor;

  let isLoading = false;

  let feedbackStatus = [];

  let type = FeedbackType.ALL_CATEGORY;

  let searchTerm = "";

  /**
   * Transforms an array of posts into a product status map.
   *
   * @param posts - An array of posts, each containing a status and other product details.
   */
  function transformPostsToFeedbackStatus(posts) {
    const statusMap = {
      "under review": { status: "under review", products: [] },
      "in progress": { status: "in progress", products: [] },
      planned: { status: "planned", products: [] },
    };

    posts.forEach((post) => {
      let mappedStatus = post.status;
      // Check if mappedStatus exists in statusMap, if not, use it as it is
      if (statusMap[mappedStatus]) {
        statusMap[mappedStatus].products.push(post);
      }
    });

    // Convert the statusMap object to an array suitable for rendering in Svelte
    feedbackStatus = Object.values(statusMap);
  }

  /**
   * @description - Filters the product statuses based on the search term and category type.
   * Each product status is extended with a `filteredProducts` property that contains products
   * matching the search term and category filters.
   */
  $: filteredFeedbackStatus = feedbackStatus.map((status) => ({
    ...status,
    filteredFeedbacks: status.products.filter((product) => {
      // Filter by search term
      const matchesSearchTerm =
        searchTerm.trim().length === 0 ||
        product.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory =
        type === FeedbackType.ALL_CATEGORY ||
        (type === FeedbackType.FEATURE_REQUEST &&
          product?.category?.name === FeedbackType.FEATURE_REQUEST) ||
        (type === FeedbackType.UI_IMPROVEMENT &&
          product?.category?.name === FeedbackType.UI_IMPROVEMENT) ||
        (type === FeedbackType.BUG &&
          product?.category?.name === FeedbackType.BUG);

      return matchesSearchTerm && matchesCategory;
    }),
  }));

  /**
   * @description - Runs when the component mounts. Fetches posts and transforms them into product statuses.
   *
   * - Sets `isLoading` to `true` while fetching.
   * - Calls `fetchPosts()` to retrieve posts and `transformPostsToFeedbackStatus()` to process the data.
   * - After fetching, sets `isLoading` to `false`.
   */
  onMount(async () => {
    isLoading = true;
    const response = await fetchPosts();
    if (response) {
      transformPostsToFeedbackStatus(response);
    }

    isLoading = false;
  });
</script>

<div style="height:100%; width:100%;">
  <div class="container-data" style="padding: 20px;">
    <div class="headerq">
      <p style="font-size: 20px; font-weight:700;">Roadmap</p>
      <p class="text-fs-14" style="color: var(--text-secondary-50);">
        Stay updated with all feedback, from planning to progress, on a single
        roadmap.
      </p>
    </div>

    <div class="d-flex justify-content-between page-funationality">
      <div
        style="margin-bottom: 37px;"
        class={`d-flex search-input-container rounded py-1 px-2 `}
        on:click={() => {
          MixpanelEvent(Events.Roadmap_Search);
        }}
      >
        <SearchIcon
          width={14}
          height={14}
          color={"var(--icon-secondary-200)"}
          classProp={`my-auto ms-2`}
        />
        <input
          type="text"
          id="search-input"
          class={`bg-transparent w-100 border-0 ms-1 my-auto`}
          placeholder="Search updates"
          on:input={(e) => {
            searchTerm = e.target.value;
          }}
          bind:value={searchTerm}
        />

        {#if searchTerm.length != 0}
          <div
            style="cursor: pointer;"
            class="clear-icon"
            on:click={() => {
              searchTerm = "";
            }}
          >
            <CrossIcon
              height="16px"
              width="12px"
              color="var(--icon-secondary-300)"
            />
          </div>
        {/if}
      </div>

      <div class="filter">
        <Select
          data={[
            { name: "Feature Request", id: FeedbackType.FEATURE_REQUEST },
            { name: "UI Improvement", id: FeedbackType.UI_IMPROVEMENT },
            { name: "Bugs", id: FeedbackType.BUG },
            { name: "All Categories", id: FeedbackType.ALL_CATEGORY },
          ]}
          onclick={(id = "") => {
            type = id;
            MixpanelEvent(Events.Roadmap_Categories_Filter);
          }}
          titleId={type}
          minHeaderWidth={"185px"}
          headerHeight={"26px"}
          iconRequired={true}
          icon={CategoryIcon}
          iconColor={"var(--icon-primary-300)"}
          isDropIconFilled={true}
          borderType={"none"}
          borderActiveType={"none"}
          headerHighlight={""}
          headerTheme={"violet"}
          menuItem={"v2"}
          headerFontSize={"12px"}
          maxHeaderWidth={"185px"}
          zIndex={200}
          bodyTheme={"violet"}
          borderRounded={"2px"}
          position={"absolute"}
          placeholderText={"Category"}
        />
      </div>
    </div>

    {#if isLoading}
      <div class="mt-5">
        <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
      </div>
    {:else}
      <div
        class="d-flex justify-content-between gap-3 update-state-section"
        style="width:100%;"
      >
        {#each filteredFeedbackStatus as { status, products, filteredFeedbacks }}
          <div
            class="rounded-2"
            style="width:100%; background-color: var(--bg-secondary-800); overflow: hidden; border:0.6px solid var(--border-secondary-300)"
          >
            <div
              style="font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; background-color:var(--bg-secondary-870); height:32px;  color:{getColor(
                status,
              ).fontColor}; border-bottom:0.5px solid {getColor(status)
                .fontColor};"
            >
              {status
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
                .join(" ")}
            </div>

            {#if filteredFeedbacks?.length == 0 && searchTerm === ""}
              <div
                class=" d-flex align-items-center justify-content-center"
                style="height: calc(100% - 32px);"
              >
                <div
                  class="p-3"
                  style="display: flex; flex-direction:column; justify-content:center; align-items:center;"
                >
                  <MessageDisabledIcon
                    height={"30px"}
                    width={"30px"}
                    color={"var(--icon-primary-300)"}
                  />

                  <p
                    class="mx-1 mt-3 text-fs-14 mb-0 text-center"
                    style=" font-weight:500;color: var(--text-secondary-550); letter-spacing: 0.5px;  text-align:center;"
                  >
                    Share your feedback and check back here for updates.
                  </p>
                </div>
              </div>
              <!-- {/if} -->
            {:else if filteredFeedbacks.length == 0 && searchTerm.length > 0}
              <div
                class="w-100 h-100 mb-4"
                style="display: flex; align-items-center; justify-content:center;"
              >
                <p
                  class="mx-1 text-fs-12 mb-0 text-center mb-3"
                  style="display:flex; align-items:center; font-weight:500;color: var(--text-secondary-550); letter-spacing: 0.5px; "
                >
                  No result found.
                </p>
              </div>
            {:else}
              <div
                style="background-color: var(--bg-secondary-800); padding:12px;"
              >
                <HelpInfoCard {setPostId} status={filteredFeedbacks} />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary-400);
    width: 24vw;
    font-size: 12px;
    position: relative;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .search-input-container > input:focus {
    outline: none;
    caret-color: var(--workspace-hover-color);
  }
  .search-input-container:focus-within {
    border: 1px solid var(--workspace-hover-color);
  }

  .search-input-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }
</style>
