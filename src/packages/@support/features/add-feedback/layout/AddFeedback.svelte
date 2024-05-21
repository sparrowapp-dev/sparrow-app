<script>
  import { Select } from "@library/forms";
  import { PlusIcon } from "@library/icons";
  import { Modal } from "@library/ui";

  let dropdownTitle = "feedback";
  let isExposeFeedbackForm = false;
</script>

<div>
  <button
    on:click={() => {
      isExposeFeedbackForm = true;
    }}
    class="add-feedback w-100 outline-none border-0 border-radius-4 text-fs-14"
  >
    <PlusIcon
      height={"18px"}
      width={"18px"}
      color={"var(--bg-secondary-100)"}
    /> Add Feedback
  </button>
</div>
<div class="position-relative">
  <Modal
    title={"Add Feedback"}
    type={"dark"}
    width={"55%"}
    zIndex={10000}
    isOpen={isExposeFeedbackForm}
    handleModalState={(flag = false) => {
      isExposeFeedbackForm = flag;
    }}
  >
    <div class="d-flex">
      <Select
        id={"hash999"}
        data={[
          {
            name: "Feedback",
            id: "feedback",
          },
          {
            name: "Bugs",
            id: "bugs",
          },
          {
            name: "Feature Request",
            id: "feature-request",
          },
        ]}
        zIndex={499}
        titleId={dropdownTitle}
        onclick={(id = "") => {
          dropdownTitle = id;
          //   onUpdateRequestState({ requestAuthNavigation: id });
        }}
        disabled={false}
        borderType={"none"}
        borderActiveType={"none"}
        borderHighlight={"hover-active"}
        headerHighlight={"hover-active"}
        headerHeight={"36px"}
        minBodyWidth={"150px"}
        minHeaderWidth={"128px"}
        maxHeaderWidth={"150px"}
        borderRounded={"4px"}
        headerTheme={"violet"}
        bodyTheme={"violet"}
        menuItem={"v2"}
        headerFontSize={"10px"}
        isDropIconFilled={true}
        position={"absolute"}
      />
    </div>
  </Modal>
</div>

<style>
  .add-feedback {
    padding: 10px 16px 10px 12px;
    background-color: var(--bg-primary-300);
  }
  .add-feedback:hover {
    background-color: var(--bg-primary-250);
  }
  .add-feedback:active {
    background-color: var(--bg-primary-500);
  }
</style>
