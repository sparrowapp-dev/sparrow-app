<script>
  import { SearchIcon } from "$lib/assets/icons";
  import { Select } from "@library/forms";
  import Input from "@library/forms/Input/Input.svelte";
  import { CategoryIcon, CrossIcon, StackIcon } from "@library/icons";
  import HelpInfoCard from "@support/common/components/HelpInfo-Card/HelpInfoCard.svelte";
  import { onMount } from "svelte";

  function getColor(status) {
    if (status === "Under Review") return "white";
    if (status === "In Progress") return "#DF77F9";
    if (status === "Planned") return "#FFE47E";
    return "white"; // Default color
  }

  function getBorderColor(status) {
    if (status === "Under Review") return "white";
    if (status === "In Progress") return "#DF77F9";
    if (status === "Planned") return "#FFE47E";
    return "white"; // Default border color
  }

  let searchTerm = "";

  // $: filteredProductStatus = productStatus.map((status) => ({
  //   ...status,
  //   products:
  //     searchTerm.trim().length > 0
  //       ? status.products.filter((product) =>
  //           product.title
  //             .toLowerCase()
  //             .includes(searchTerm.trim().toLowerCase()),
  //         )
  //       : status.products,
  // }));

  export let fetchPosts;
  let productStatus = [];

  onMount(async () => {
    const response = await fetchPosts();
    if (response?.data?.posts) {
      transformPostsToProductStatus(response.data.posts);
    }
    console.log("THis is response", response);
  });

  // function transformPostsToProductStatus(posts) {
  //   const statusMap = {};

  //   posts.forEach((post) => {
  //     const { status } = post;
  //     if (!statusMap[status]) {
  //       statusMap[status] = { status, products: [] };
  //     }
  //     statusMap[status].products.push(post);
  //   });

  //   productStatus = Object.values(statusMap);
  // }

  function transformPostsToProductStatus(posts) {
    const statusMap = {
      "under review": { status: "Under Review", products: [] },
      complete: { status: "In Progress", products: [] },
      open: { status: "Planned", products: [] },
    };

    posts.forEach((post) => {
      // Map "open" status to "Under Review"
      let mappedStatus = post.status; // === "open" ? "Under Review" : post.status;

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
    filteredProducts:
      searchTerm.trim().length > 0
        ? status.products.filter((product) =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : status.products,
  }));
</script>

<div style="height:100%; width:100%;">
  <div class="container-data" style="padding: 20px;">
    <div class="headerq">
      <p style="font-size: 20px; font-weight:700;">Roadmap</p>
      <p style="color: #999999; font-size;14px;">
        Stay updated with all feedback, from planning to progress, on a single
        roadmap.
      </p>
    </div>

    <div class="d-flex justify-content-between page-funationality">
      <div class={`d-flex search-input-container rounded py-2 px-2 mb-4`}>
        <SearchIcon
          width={14}
          height={14}
          color={"#8A9299"}
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
            { name: "Feature Request", id: "featureRequest" },
            { name: "UX Improvement", id: "uxImprovement" },
            { name: "Bugs", id: "bugs" },
            { name: "All Categories", id: "allCategories" },
          ]}
          onclick={(id = "") => {
            type = id;
            console.log("Hello world");
          }}
          minHeaderWidth={"185px"}
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

    <div
      class="d-flex justify-content-between gap-2 update-state-section"
      style="width:100%;"
    >
      {#each filteredProductStatus as { status, products, filteredProducts }}
        <div
          class="rounded-2"
          style="width:100%; background-color: #151515; overflow: hidden;"
        >
          <div
            style="font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; background-color:#1D1D20; height:32px;  color:{getColor(
              status,
            )}; border-bottom:1px solid {getBorderColor(status)};"
          >
            {status}
          </div>
          <div class="p-2">
            {#if products.length === 0}
              <p
                class="mx-1 text-fs-12 mb-0 text-center mb-3 mt-3"
                style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px; "
              >
                No Data is there.
              </p>
            {:else}
              <HelpInfoCard status={filteredProducts} />
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
  </div>
</div>

<style>
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary-400);
    width: 27vw;
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
