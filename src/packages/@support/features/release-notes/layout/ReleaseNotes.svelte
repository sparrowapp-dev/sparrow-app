<script>
  import { SearchIcon } from "$lib/assets/icons";
  import { Select } from "@library/forms";
  import {
    ArrowUnfilledIcon,
    CrossIcon,
    FilterIcon,
    LinkedinIcon,
    ThumbIcon,
  } from "@library/icons";
  import { onMount } from "svelte";
  export let listChangeLog;
  import { marked } from "marked";
  import constants from "$lib/utils/constants";

  const externalSparrowGithub = constants.SPARROW_GITHUB;
  const externalSparrowLinkedin = constants.SPARROW_LINKEDIN;

  let events = [];
  let filteredEvents = events;

  onMount(async () => {
    // here in thsi function we weill sent thetype based on the select compoent
    let releaseNotes = await listChangeLog();
    console.log("This is realse notes", releaseNotes);
    events = releaseNotes.data.entries;
    console.log("This is filterreed events", events);
    filteredEvents = events;
  });

  //   {
  //     date: "Jul 31, 2020",
  //     title: "v2.4.2 - Latest Version",
  //     description:
  //       "The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process",
  //     tags: ["New"], // Example with only one tag
  //     link: "Github",
  //     reactions: 41,
  //   },
  //   {
  //     date: "Aug 05, 2024",
  //     title: "v2.4.3 - Latest Version",
  //     description:
  //       "The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process.",
  //     tags: ["New", "Fixed", "Improved"], // Example tags
  //     link: "Github",
  //     reactions: 41,
  //   },
  //   {
  //     date: "Jul 31, 2026",
  //     title: "v2.4.4 - Latest Version",
  //     description:
  //       "The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process",
  //     tags: ["New"], // Example with only one tag
  //     link: "Github",
  //     reactions: 41,
  //   },
  //   {
  //     date: "Aug 05, 2028",
  //     title: "v2.4.5 - Latest Version",
  //     description:
  //       "The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process.",
  //     tags: ["New", "Fixed", "Improved"], // Example tags
  //     link: "Github",
  //     reactions: 41,
  //   },
  //   {
  //     date: "Jul 31, 2029",
  //     title: "v2.4.6 - Latest Version",
  //     description:
  //       "The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process. The latest update includes improved JSON Schema Validation. This enhancement ensures more accurate validation of complex JSON structures, helping you catch errors early in the testing process",
  //     tags: ["New"],
  //     link: "Github",
  //     reactions: 41,
  //   },
  // ];

  let searchQuery = "";
  let selectedEvent = [];
  let showTimeline = true;

  const filterEvents = () => {
    filteredEvents = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const handleInput = (e) => {
    searchQuery = e.target.value;
    filterEvents();
  };

  const clearSearch = () => {
    searchQuery = "";
    filteredEvents = events;
  };

  function getTagClass(tag) {
    if (tag === "new") return "tag-new";
    if (tag === "fixed") return "tag-fixed";
    if (tag === "improved") return "tag-improved";
    return "";
  }

  const handleSeeMore = (event) => {
    selectedEvent = event;
    showTimeline = false;
  };

  const handleBack = () => {
    selectedEvent = null;
    showTimeline = true;
  };

  let type = "all";

  const truncateDescription = (description) => {
    const words = description.split(" ");
    return words.length > 30
      ? words.slice(0, 30).join(" ") + "..."
      : description;
  };
  let subCategory;

  let selectedTag = ""; // Default to 'All'

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  }

  // Function to handle select changes
  function handleSelectChange(id) {
    selectedTag = id;
    if (selectedTag === "all") {
      filteredEvents = events;
    } else {
      filteredEvents = events.filter((event) =>
        event.types.includes(selectedTag),
      );
    }
  }
</script>

<div style="height:100%; width:100%;">
  <div class="container-data" style="padding: 20px;">
    <div class="headerq">
      <p style="font-size: 20px; font-weight:700;">Updates</p>
      <p style="color: #999999; font-size;14px;">
        Check out our latest releases designed to boost your productivity and
        efficiency.
      </p>
    </div>

    <div class="d-flex justify-content-between page-funationality">
      <div class="" style="">
        <div class={`d-flex search-input-container rounded py-1 px-2 mb-4`}>
          <SearchIcon
            width={14}
            height={14}
            color={"grey"}
            classProp={`my-auto me-3`}
          />
          <input
            type="text"
            id="search-input"
            class={`bg-transparent w-100 border-0 my-auto`}
            placeholder="Search updates"
            on:input={handleInput}
          />

          {#if searchQuery.length != 0}
            <div
              class="clear-icon"
              on:click={() => {
                clearSearch();
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
      </div>

      <div class="filter">
        <Select
          id={"feeds"}
          data={[
            { name: "All", id: "all" },
            { name: "New", id: "new" },
            { name: "Fixed", id: "fixed" },
            { name: "Improved", id: "improved" },
          ]}
          titleId={selectedTag}
          onclick={(id = "") => {
            type = id;
            handleSelectChange(id);
          }}
          placeholderText={"Filters"}
          zIndex={499}
          disabled={false}
          iconRequired={true}
          icon={FilterIcon}
          iconColor={"var(--white-color)"}
          borderType={"none"}
          borderActiveType={"none"}
          borderHighlight={"hover-active"}
          headerHighlight={"hover-active"}
          headerHeight={"26px"}
          minBodyWidth={"150px"}
          minHeaderWidth={"150px"}
          maxHeaderWidth={"200px"}
          borderRounded={"2px"}
          headerTheme={"violet2"}
          bodyTheme={"violet"}
          menuItem={"v2"}
          headerFontSize={"10px"}
          isDropIconFilled={true}
          position={"absolute"}
        />
      </div>
    </div>
    {#if showTimeline}
      {#if filteredEvents.length > 0}
        <div class="timeline">
          {#each filteredEvents as event}
            <div class="timeline-event">
              <div class="timeline-date">{formatDate(event.publishedAt)}</div>
              <div class="timeline-circle"></div>
              <div class="timeline-content">
                <h3>{event.title}</h3>
                <div class="tags">
                  {#each event.types as tag}
                    <span class="tag {getTagClass(tag)}">{tag}</span>
                  {/each}
                </div>
                {#if event.plaintextDetails.split(" ").length > 20}
                  <p
                    style="font-size: 14px; font-weight:400; line-height:24px; "
                    class=""
                  >
                    {truncateDescription(event.plaintextDetails)}
                    <span
                      style="text-decoration: underline; color:#3670F7; border:none; background-color:transparent; cursor:pointer "
                      class="ms-0"
                      on:click={() => handleSeeMore(event)}>see more</span
                    >
                  </p>
                {:else}
                  <p
                    style="font-size: 14px; font-weight:400; line-height:24px; "
                    class=""
                  >
                    {event.description}
                  </p>
                {/if}
                <div class="d-flex align-items-center justify-content-between">
                  <p
                    style=" cursor:pointer; margin-bottom: 0px; text-decoration:underline; color:var(--text-primary-300); "
                    class="mb-0"
                    on:click={async () => {
                      await open(externalSparrowGithub);
                    }}
                  >
                    Github
                  </p>

                  <div class="d-flex align-items-center gap-2">
                    <!-- <ThumbIcon height={"18px"} width={"18px"} />
                    <div style="color: var(--white-color);">
                      {event.reactions?.like || ""}
                    </div> -->
                    <div
                      style="cursor:pointer; border-left:1px solid grey;"
                      class="ps-2"
                      on:click={async () => {
                        await open(externalSparrowLinkedin);
                      }}
                    >
                      <LinkedinIcon height={"18px"} width={"18px"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div
          class="no-results mt-5 d-flex justify-content-center align-items-center mx-1 text-fs-14 mb-0 text-center"
          style=" font-weight:300;color: var(--text-secondary-550); letter-spacing: 0.5px;"
        >
          <p>No results found</p>
        </div>
      {/if}
    {:else}
      <div class="d-flex selected-event-detail">
        <div style="width:23.5%; " class="d-flex mt-2">
          <div>
            <div
              on:click={handleBack}
              style="cursor:pointer; transform: rotate(90deg);"
            >
              <ArrowUnfilledIcon
                height={"16px"}
                width={"16px"}
                color={"var(--white-color )"}
              />
            </div>
          </div>
          <div
            class="ms-2 text-fs-14"
            style="margin-top:1.5px; color:var(--white-color); font-weight:700;"
          >
            {formatDate(selectedEvent.publishedAt)}
          </div>
        </div>

        <div class="ms-2 timeline-content">
          <h3>{selectedEvent.title}</h3>
          <div class="tags">
            {#each selectedEvent.types as tag}
              <span class="tag {getTagClass(tag)}">{tag}</span>
            {/each}
          </div>

          <p style="font-size: 14px; font-weight:400; " class="mt-3">
            {@html marked(selectedEvent.markdownDetails)}
          </p>

          <div class="d-flex align-items-center justify-content-between p-1">
            <p
              style=" cursor:pointer; margin-bottom: 0px; text-decoration:underline; color:var(--text-primary-300); "
              class="mb-0"
            >
              Github
            </p>
            <div class="d-flex align-items-center gap-2">
              <!-- <ThumbIcon height={"18px"} width={"18px"} />
              <div style="color: var(--white-color);">
                {selectedEvent.reactions?.like || ""}
              </div> -->
              <div
                style="border-left:1px solid grey;"
                class="ps-2"
                on:click={async () => {
                  await open(externalSparrowLinkedin);
                }}
              >
                <LinkedinIcon height={"18px"} width={"18px"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(h1) {
    font-size: 24px;
  }
  .selected-event-detail {
    display: flex;
    justify-content: space-between;
  }
  .search-input-container {
    border: 1px solid var(--border-color);
    background: var(--bg-tertiary-400);
    height: 26px;
    width: 300px;
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

  .timeline {
    position: relative;
    margin-left: 130px;
  }

  .timeline::before {
    content: "";
    position: absolute;
    width: 1px;
    background-color: #3670f7;
    top: 0;
    bottom: 0;
    left: 7px;
    margin-left: -1px;
    margin-top: 26px;
    margin-bottom: 170px;
  }

  .timeline-event {
    display: flex;
    justify-content: flex-start;
    position: relative;
    margin-bottom: 50px;
  }

  .timeline-event:last-child {
    margin-bottom: 0;
  }

  .timeline-date {
    padding: 0;
    position: absolute;
    left: -140px;
    top: 10px;
    font-weight: bold;
    color: #ffffff;
    width: 120px;
    text-align: right;
    font-weight: 700;
    font-size: 14px;
  }

  .timeline-circle {
    width: 12px;
    height: 12px;
    background-color: var(--bg-primary-300);
    border-radius: 50%;
    position: absolute;
    left: 0px;
    top: 15px;
    z-index: 1;
  }

  .timeline-content {
    margin-left: 40px;
    padding: 10px 20px;
    background-color: var(--bg-secondary-800);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    width: 100%;
  }

  .timeline-content h3 {
    font-size: 18px;
    font-weight: 700;
    line-height: 27px;
    color: #ffffff;
  }

  .timeline-content h3:hover {
    color: #3670f7;
  }

  .timeline-content a {
    color: #3670f7;
    text-decoration: underline;
    margin-right: 10px;
  }

  .timeline-reactions {
    display: flex;
    align-items: center;
    font-size: 0.9em;
    margin-top: 10px;
  }

  .timeline-reactions .icon {
    margin-left: 10px;
  }

  .tags {
    margin-bottom: 10px;
  }

  .tag {
    display: inline-block;
    padding: 1.24px 5px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    margin-right: 8px;
    border: 1px solid;
  }

  .tag-new {
    color: #1193f0;
    border-color: #1193f0;
  }

  .tag-fixed {
    color: #df77f9;
    border-color: #df77f9;
  }

  .tag-improved {
    color: #00a86b; /* I believe you meant this color for "Improved" */
    border-color: #00a86b;
  }
</style>
