<script>
  import { SearchIcon } from "@sparrow/library/assets";
  import { Select } from "@sparrow/library/forms";
  import {
    ArrowUnfilledIcon,
    CrossIcon,
    FilterIcon,
    LinkedinIcon,
    LinkIcon,
    ThumbIcon,
  } from "@sparrow/library/icons";
  import { onMount } from "svelte";
  import { marked } from "marked";
  import { Loader, Tag, Tooltip } from "@sparrow/library/ui";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { notifications } from "@sparrow/library/ui";
  import { UpdatesTagType } from "../../../types/feedback";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums/mixpanel-events.enum";
  import { Search } from "@sparrow/library/forms";
  export let listChangeLog;

  export let onReleaseNoteRedirect;
  export let onLinkedInRedirect;

  /**
   * Type of events to filter.
   */
  let type = "all";

  /**
   * List of events.
   */
  let events = [];

  /**
   * Search query input by the user.
   */
  let searchQuery = "";

  /**
   * Boolean flag to determine whether to show the timeline.
   */
  let showTimeline = true;

  /**
   * The currently selected event.
   */
  let selectedEvent = [];

  /**
   * List of events filtered by search query or selected tag.
   */
  let filteredEvents = events;

  /**
   * The currently selected tag for filtering events.
   * Defaults to an empty string, which corresponds to "All".
   */
  let selectedTag = UpdatesTagType.ALL;

  /**
   * Boolean flag to indicate whether events are being loaded.
   */
  let isLoading = false;

  /**
   * Filters the list of events based on the search query.
   */
  const filterEvents = () => {
    filteredEvents = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  /**
   * Handles input change for the search query.
   * @param {Event} e - The input event triggered when typing in the search field.
   */
  const handleInput = (e) => {
    searchQuery = e.detail;
    filterEvents();
  };

  /**
   * Clears the search input and resets the filtered events to show all.
   */
  const clearSearch = () => {
    searchQuery = "";
    filteredEvents = events;
  };

  /**
   * Gets the appropriate CSS class for a given tag.
   * @param  tag - The tag associated with an event (e.g., "new", "fixed", "improved").
   * @returns  - The CSS class corresponding to the tag.
   */
  const getTagClass = (tag) => {
    if (tag === UpdatesTagType.NEW) return "tag-new";
    if (tag === UpdatesTagType.FIXED) return "tag-fixed";
    if (tag === UpdatesTagType.IMPROVED) return "tag-improved";
    return "";
  };
  const getTagType = (tag) => {
    if (tag === UpdatesTagType.NEW) return "cyan";
    if (tag === UpdatesTagType.FIXED) return "pink";
    if (tag === UpdatesTagType.IMPROVED) return "green";
    return "";
  };

  /**
   * Handles the action when the user clicks to see more details of an event.
   * @param {Object} event - The event data to be displayed.
   */
  const handleSeeMore = (event) => {
    selectedEvent = event;
    showTimeline = false;
  };

  /**
   * Handles the action when the user clicks to go back to the timeline view.
   */
  const handleBack = () => {
    selectedEvent = null;
    showTimeline = true;
  };

  /**
   * Truncates an event description if it exceeds a certain word count.
   * @param {string} description - The event description to truncate.
   * @returns {string} - The truncated description followed by ellipsis if it's too long.
   */
  const truncateDescription = (description) => {
    const words = description.split(" ");
    return words.length > 30
      ? words.slice(0, 40).join(" ") + "..."
      : description;
  };

  /**
   * Formats a date string into a more readable format.
   * @param {string} dateString - The raw date string to format.
   * @returns {string} - The formatted date string (e.g., "31 Dec 2024").
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  /**
   * Handles the selection change for event tags.
   * Filters events based on the selected tag.
   * @param {string} id - The tag ID selected by the user (e.g., "new", "all").
   */
  const handleSelectChange = (id) => {
    selectedTag = id;
    if (selectedTag === "all") {
      filteredEvents = events;
    } else {
      filteredEvents = events.filter((event) =>
        event.types.includes(selectedTag),
      );
    }
    MixpanelEvent(Events.Updates_Filter);
  };

  function extractReleaseDate(text) {
    // Updated regex to handle various release date formats with optional extra spaces
    const dateMatch = text.match(
      /Release\s*Date\s*:\s*([A-Za-z]{3,}\s*\d{1,2},\s*\d{4})/,
    );
    return dateMatch ? dateMatch[1].trim() : "Unknown Release Date";
  }

  onMount(async () => {
    isLoading = true;
    let releaseNotes = await listChangeLog();
    events = releaseNotes.data.entries;
    filteredEvents = events;
    isLoading = false;
  });

  // Render URL in web
  const renderer = new marked.Renderer();
  renderer.link = function (href, title, text) {
    let url = href;
    if (typeof href === "object" && href !== null) {
      url = href.href || href.raw || href.text || "#";
    }

    url = String(url);
    let linkText = text;
    if (typeof text === "object" && text !== null) {
      linkText = text.text || text.raw || "Link";
    }

    linkText = linkText !== undefined ? String(linkText) : "Link";
    return `<a href="${url}"${title ? ` title="${title}"` : ""} target="_blank" rel="noopener noreferrer">${url}</a>`;
  };

  marked.setOptions({ renderer });
</script>

<div style="height:100%; width:100%;">
  <div class="container-data" style="padding: 20px;">
    <div class="headerq">
      <p class="text-ds-font-size-20 text-ds-font-weight-semi-bold">Updates</p>
      <p class="text-ds-font-size-14" style="color: var(--text-secondary-50); ">
        Check out our latest releases designed to boost your productivity and
        efficiency.
      </p>
    </div>

    {#if showTimeline}
      <div class="d-flex justify-content-between page-funationality">
        <div class="" style="cursor:pointer">
          <div class={`d-flex  rounded py-1 px-2 mb-4`}>
            <Search
              variant="primary"
              customWidth={"300px"}
              id="search-input"
              placeholder="Search updates"
              on:input={handleInput}
              bind:value={searchQuery}
            />
          </div>
        </div>

        <div class="filter">
          <Select
            id={"feeds"}
            data={[
              { name: "New", id: UpdatesTagType.NEW },
              { name: "Fixed", id: UpdatesTagType.FIXED },
              { name: "Improved", id: UpdatesTagType.IMPROVED },
              { name: "All", id: UpdatesTagType.ALL },
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
            iconColor={"var(--text-secondary-100)"}
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
            headerFontSize={"12px"}
            isDropIconFilled={true}
            position={"absolute"}
          />
        </div>
      </div>
    {/if}
    {#if isLoading}
      <div class="mt-5">
        <Loader loaderSize={"20px"} loaderMessage="Please Wait..." />
      </div>
    {:else}
      <div>
        {#if showTimeline}
          {#if filteredEvents.length > 0}
            <div class="timeline">
              {#each filteredEvents as event}
                <div class="timeline-event">
                  <div class="timeline-date">
                    {#if event.plaintextDetails}
                      {extractReleaseDate(event.plaintextDetails)}
                    {:else}
                      {extractReleaseDate(event.markdownDetails)}
                    {/if}
                  </div>
                  <div class="timeline-circle"></div>
                  <div class="timeline-content">
                    <div class=" d-flex gap-2">
                      <h3
                        style="cursor: pointer;"
                        class="text-ds-font-size-16 text-ds-font-weight-semi-bold mb-0"
                        on:click={() => {
                          handleSeeMore(event);
                          MixpanelEvent(Events.Version_Updates);
                        }}
                      >
                        {event.title}
                      </h3>
                      <Tooltip
                        title={"Copy link"}
                        placement={"right-center"}
                        distance={10}
                        show={true}
                        zIndex={701}
                      >
                        <div
                          class="link-div d-flex align-items-center justify-content-cetner"
                          style="height:24px; width:24px; cursor:pointer"
                          on:click={async () => {
                            await copyToClipBoard(event.url);
                            notifications.success("Link copied to clipboard.");
                            MixpanelEvent(Events.Copy_Link);
                          }}
                        >
                          <LinkIcon
                            height={"18px"}
                            width={"18px"}
                            color={"var(--text-secondary-100)"}
                          />
                        </div>
                      </Tooltip>
                    </div>
                    <div class="tags" style="margin-top: 5px;">
                      {#each event.types as tag}
                        <span class="mt-[6px]">
                          <Tag type={getTagType(tag)} text={tag || ""} />
                        </span>
                      {/each}
                    </div>
                    {#if event.plaintextDetails.split(" ").length > 20}
                      <p
                        style=" line-height:24px; "
                        class="text-ds-font-size-14 text-ds-font-weight-regular"
                      >
                        {truncateDescription(event.plaintextDetails)}
                        <span
                          style="text-decoration: underline; color:#3670F7; border:none; background-color:transparent; cursor:pointer "
                          class="ms-0"
                          on:click={() => {
                            handleSeeMore(event);
                            MixpanelEvent(Events.See_More_Updates);
                          }}
                          >see more
                        </span>
                      </p>
                    {:else}
                      <p
                        style="line-height:24px; "
                        class="text-ds-font-size-14 text-ds-font-weight-regular"
                      >
                        {event.description}
                      </p>
                    {/if}
                    <div
                      class="d-flex align-items-center justify-content-between"
                    >
                      <p
                        style=" cursor:pointer; margin-bottom: 0px; text-decoration:underline; color:var(--text-primary-300); "
                        class="mb-0"
                        on:click={async () => {
                          onReleaseNoteRedirect(event?.title);
                        }}
                      >
                        Github
                      </p>

                      <div class="d-flex align-items-center gap-2">
                        <!-- <ThumbIcon height={"18px"} width={"18px"} />
                    <div style="color: var(--text-secondary-100);">
                      {event.reactions?.like || ""}
                    </div> -->
                        <div
                          style="cursor:pointer;"
                          class="ps-2"
                          on:click={onLinkedInRedirect}
                        >
                          <LinkedinIcon
                            height={"18px"}
                            width={"18px"}
                            color={"var(--icon-secondary-950)"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div
              class="no-results mt-5 d-flex justify-content-center align-items-center mx-1 mb-0 text-center text-ds-font-size-14 text-ds-font-weight-medium"
              style="color: var(--text-secondary-550); letter-spacing: 0.5px;"
            >
              <p>No result found.</p>
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
                    color={"var(--text-secondary-100)"}
                  />
                </div>
              </div>
              <div
                class="ms-2 text-ds-font-size-14 text-ds-font-weight-medium"
                style="margin-top:1.5px; color:var(--text-secondary-100); "
              >
                {#if event.plaintextDetails}
                  {extractReleaseDate(selectedEvent.plaintextDetails)}
                {:else}
                  {extractReleaseDate(selectedEvent.markdownDetails)}
                {/if}
              </div>
            </div>

            <div class="ms-2 timeline-content">
              <div class="d-flex gap-2">
                <p
                  class="pb-0 mb-1 text-ds-font-size-18 text-ds-font-weight-semi-bold"
                  style=" line-height: 27px;"
                >
                  {selectedEvent.title}
                </p>
                <Tooltip
                  title={"Copy link"}
                  placement={"right-center"}
                  distance={10}
                  show={true}
                  zIndex={701}
                >
                  <div
                    class="link-div"
                    style="  height: 24px; width:24px; cursor:pointer"
                    on:click={async () => {
                      await copyToClipBoard(selectedEvent.url);
                      notifications.success("Link copied to clipboard.");
                      MixpanelEvent(Events.Copy_Link);
                    }}
                  >
                    <LinkIcon
                      height={"18px"}
                      width={"18px"}
                      color={"var(--text-secondary-100)"}
                    />
                  </div>
                </Tooltip>
              </div>
              <div class="tags">
                {#each selectedEvent.types as tag}
                  <span class="mt-[6px]">
                    <Tag type={getTagType(tag)} text={tag || ""} />
                  </span>
                {/each}
              </div>

              <p class="mt-3 text-ds-font-size-14 text-ds-font-weight-regular">
                {@html marked(selectedEvent.markdownDetails)}
              </p>

              <div
                class="d-flex align-items-center justify-content-between p-1"
              >
                <p
                  style=" cursor:pointer; margin-bottom: 0px; text-decoration:underline; color:var(--text-primary-300); "
                  class="mb-0"
                  on:click={() => {
                    onReleaseNoteRedirect(selectedEvent?.title);
                  }}
                >
                  Github
                </p>
                <div class="d-flex align-items-center gap-2">
                  <!-- <ThumbIcon height={"18px"} width={"18px"} />
              <div style="color: var(--text-secondary-100);">
                {selectedEvent.reactions?.like || ""}
              </div> -->
                  <div
                    style="cursor:pointer;"
                    class="ps-2"
                    on:click={onLinkedInRedirect}
                  >
                    <LinkedinIcon
                      height={"18px"}
                      width={"18px"}
                      color={"var(--icon-secondary-950)"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  :global(h1) {
    font-size: 24px;
  }
  .link-div {
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
  }
  .link-div:hover {
    background-color: var(--dull-background-color);
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
    width: 0.6px;
    background-color: var(--bg-primary-300);
    top: 0;
    bottom: 0;
    left: 7px;
    margin-left: -1px;
    margin-top: 26px;
    margin-bottom: 175px;
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
    color: var(--text-secondary-100);
    width: 120px;
    text-align: right;
    font-weight: 500;
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
    line-height: 27px;
    color: var(--text-secondary-100);
  }

  .timeline-content h3:hover {
    color: var(--text-primary-300);
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
    font-weight: 500;
    margin-right: 6px;
    border: 1px solid;
  }

  .tag-new {
    color: var(--primary-btn-color);
    border-color: var(--border-primary-200);
  }

  .tag-fixed {
    color: var(--text-primary-440);
    border-color: var(--icon-primary-440);
  }

  .tag-improved {
    color: var(--text-success-200);
    border-color: var(--border-success-200);
  }
</style>
