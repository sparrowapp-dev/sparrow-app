<script>
  import { SearchIcon } from "@sparrow/library/assets";
  import { Select } from "@sparrow/library/forms";
  import { CategoryIcon, StatusIcon } from "@sparrow/library/icons";
  import { FeedbackType } from "@sparrow/support/types/feedback";
  export let type = FeedbackType.ALL_CATEGORY;
  export let posts = [];
</script>

<div class="d-flex" style=" margin-top:38px; justify-content: space-between;">
  <div class="" style="">
    <div class={`d-flex search-input-container rounded py-1 px-2 mb-2`}>
      <SearchIcon width={14} height={14} classProp={`my-auto me-3`} />
      <input
        type="text"
        id="search-input"
        class={`bg-transparent w-100 border-0 my-auto`}
        placeholder="Search updates"
      />
    </div>
  </div>

  <div class="d-flex" style="gap:15px;">
    <div>
      <Select
        iconRequired={true}
        data={[
          {
            name: "Feature Request",
            id: FeedbackType.FEATURE_REQUEST,
          },
          {
            name: "UX Improvement",
            id: FeedbackType.UI_IMPROVEMENT,
          },
          {
            name: "Bugs",
            id: FeedbackType.BUG,
          },
          {
            name: "All Categories",
            id: FeedbackType.ALL_CATEGORY,
          },
        ]}
        icon={CategoryIcon}
        onclick={(id = "") => {
          type = id;
        }}
        titleId={type}
        id={"feeds"}
        zIndex={499}
        disabled={false}
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
        placeholderText={"Categories"}
        menuItem={"v2"}
        headerFontSize={"10px"}
        isDropIconFilled={true}
        position={"absolute"}
      />
    </div>
    <div>
      <Select
        data={[
          {
            name: "Feature Request",
            id: FeedbackType.FEATURE_REQUEST,
          },
          {
            name: "UX Improvement",
            id: FeedbackType.UI_IMPROVEMENT,
          },
          {
            name: "Bugs",
            id: FeedbackType.BUG,
          },
          {
            name: "All Categories",
            id: FeedbackType.ALL_CATEGORY,
          },
        ]}
        placeholderText={"Status"}
        id={"feeds"}
        zIndex={499}
        onclick={() => {}}
        disabled={false}
        iconRequired={true}
        icon={StatusIcon}
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
</div>

<style>
  .search-input-container {
    /* border: 1px solid var(--border-color); */
    background: var(--bg-tertiary-400);
    width: 20vw;
    font-size: 12px;
    height: 26px;
    position: relative;
    border: 1px solid transparent;
  }
  .search-input-container:hover {
    border: 1px solid var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  .search-input-container:focus-within {
    border-color: var(--border-primary-300);
    caret-color: var(--border-primary-300);
  }

  #search-input {
    padding-bottom: 5px !important;
  }
  #search-input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
</style>
