<script>
  import { SearchIcon } from "$lib/assets/icons";
  import { Select } from "@library/forms";
  import Input from "@library/forms/Input/Input.svelte";
  import { CategoryIcon, CrossIcon, StackIcon } from "@library/icons";
  import HelpInfoCard from "@support/common/components/HelpInfo-Card/HelpInfoCard.svelte";

  const productStatus = [
    {
      status: "Under Review",
      products: [
        {
          title: "Awesome Product",
          category: "featureRequest",
          votes: 21,
          link: "https://example.com",
        },
        {
          title: "Another Great Product",
          category: "uxImprovement",
          votes: 19,
          link: "https://example.com/another",
        },
        {
          title: "Must-Have Item",
          category: "bugs",
          votes: 15,
          link: "https://example.com/must-have",
        },
        {
          title: "Unique Tool",
          category: "featureRequest",
          votes: 12,
          link: "https://example.com/unique-tool",
        },
        {
          title: "Necessary Fix",
          category: "bugs",
          votes: 18,
          link: "https://example.com/necessary-fix",
        },
      ],
    },
    {
      status: "In Progress",
      products: [
        {
          title: "Revamped UI",
          category: "uxImprovement",
          votes: 40,
          link: "https://example.com/revamped-ui",
        },
        {
          title: "New Feature",
          category: "featureRequest",
          votes: 32,
          link: "https://example.com/new-feature",
        },
        {
          title: "Critical Bug Fix",
          category: "bugs",
          votes: 27,
          link: "https://example.com/critical-bug-fix",
        },
      ],
    },
    {
      status: "Planned",
      products: [
        {
          title: "Future Enhancement",
          category: "featureRequest",
          votes: 50,
          link: "https://example.com/future-enhancement",
        },
        {
          title: "Improved UX",
          category: "uxImprovement",
          votes: 38,
          link: "https://example.com/improved-ux",
        },
        {
          title: "Minor Bug Fixes",
          category: "bugs",
          votes: 22,
          link: "https://example.com/minor-bug-fixes",
        },
      ],
    },
  ];

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

  $: filteredProductStatus = productStatus.map((status) => ({
    ...status,
    products:
      searchTerm.trim().length > 0
        ? status.products.filter((product) =>
            product.title
              .toLowerCase()
              .includes(searchTerm.trim().toLowerCase()),
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
      {#each filteredProductStatus as { status, products }}
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
            {#if products.length > 0}
              <HelpInfoCard status={products} />
            {:else}
              <p
                class="mx-1 text-fs-12 mb-0 text-center mb-3 mt-3"
                style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px; "
              >
                No results found
              </p>
            {/if}
          </div>
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
