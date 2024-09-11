<script>
  import { SearchIcon } from "$lib/assets/icons";

  // import { SearchIcon } from "$lib/assets/icons";
  import { Select } from "@library/forms";
  import { CategoryIcon, CrossIcon, StackIcon } from "@library/icons";
    import { Loader } from "@library/ui";
  import HelpInfoCard from "@support/common/components/HelpInfo-Card/HelpInfoCard.svelte";
  import { onMount } from "svelte";

  export let fetchPosts;

  export let   setPostId

  let isLoading=false;

  let productStatus = [];
  let type = "allCategories";
  let searchTerm = "";

  /**
   * Returns a color code based on the provided status.
   *
   * @param status - The current status of the product (e.g., "Under Review", "In Progress", "Planned").
   * @returns The corresponding color code.
   */
  function getColor(status) {
    if (status === "Under Review") return "white";
    if (status === "In Progress") return "#DF77F9";
    if (status === "Planned") return "#FFE47E";
    return "white";
  }

  /**
   * Transforms an array of posts into a product status map.
   *
   * @param posts - An array of posts, each containing a status and other product details.
   */
  function transformPostsToProductStatus(posts) {
    const statusMap = {
      "under review": { status: "Under Review", products: [] },
      "in progress": { status: "In Progress", products: [] },
      planned: { status: "Planned", products: [] },
    };

    posts.forEach((post) => {
      let mappedStatus = post.status;
      // Check if mappedStatus exists in statusMap, if not, use it as it is
      if (statusMap[mappedStatus]) {
        statusMap[mappedStatus].products.push(post);
      }
    });

    // Convert the statusMap object to an array suitable for rendering in Svelte
    productStatus = Object.values(statusMap);
  }

  $: filteredProductStatus = productStatus.map((status) => ({
    ...status,
    filteredProducts: status.products.filter((product) => {
      // Filter by search term
      const matchesSearchTerm =
        searchTerm.trim().length === 0 ||
        product.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory =
        type === "allCategories" ||
        (type === "featureRequest" &&
          product?.category?.name === "Feature Request") ||
        (type === "UI Improvement" &&
          product?.category?.name === "UI Improvement") ||
        (type === "bug" && product?.category?.name === "Bug");

      return matchesSearchTerm && matchesCategory;
    }),
  }));

  onMount(async () => {
    isLoading=true;
    const response = await fetchPosts();
    if (response?.data?.posts) {
      transformPostsToProductStatus(response.data.posts);
    }
    isLoading=false;
  });
</script>

<div style="height:100%; width:100%;">
  <div class="container-data" style="padding: 20px;">
    <div class="headerq">
      <p style="font-size: 20px; font-weight:700;">Roadmap</p>
      <p style="color: var(--text-secondary-50); font-size;14px;">
        Stay updated with all feedback, from planning to progress, on a single
        roadmap.
      </p>
    </div>

    <div class="d-flex justify-content-between page-funationality">
      <div
        style="margin-bottom: 37px;"
        class={`d-flex search-input-container rounded py-1 px-2 `}
      >
        <SearchIcon
          width={14}
          height={14}
          color={"var(--icon-secondary-200)"}
          classProp={`my-auto me-3`}
        />
        <input
          type="text"
          id="search-input"
          class={`bg-transparent w-100 border-0 my-auto`}
          placeholder="Search workspaces"
          on:input={(e) => {
            searchTerm = e.target.value;
          }}
          bind:value={searchTerm}
        />

        {#if searchTerm.length != 0}
          <div
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
            { name: "All Categories", id: "allCategories" },
            { name: "Feature Request", id: "featureRequest" },
            { name: "UI Improvement", id: "UI Improvement" },
            { name: "Bug", id: "bug" },
          ]}
          onclick={(id = "") => {
            type = id;
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
    <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
    {:else}
    <div
    class="d-flex justify-content-between gap-2 update-state-section"
    style="width:100%;"
  >
    {#each filteredProductStatus as { status, products, filteredProducts }}
      <div
        class="rounded-2"
        style="width:100%; background-color: var(--bg-secondary-800); overflow: hidden;"
      >
        <div
          style="font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; background-color:var(--bg-secondary-870); height:32px;  color:{getColor(
            status,
          )}; border-bottom:1px solid {getColor(status)};"
        >
          {status}
        </div>
        <div class="p-2">
          {#if (filteredProducts?.length == 0 && searchTerm.length > 0) || filteredProducts?.length == 0}
            <p
              class="mx-1 text-fs-12 mb-0 text-center mb-3 mt-3"
              style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px; "
            >
              No Result Found.
            </p>{:else}
            <HelpInfoCard { setPostId} status={filteredProducts} />
          {/if}
        </div>

        {#if filteredProductStatus.length == 0 && searchTerm.length >= 0}
          <p
            class="mx-1 text-fs-12 mb-0 text-center mb-3 mt-3"
            style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px; "
          >
            No results found.
          </p>
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
