<script>
  import { CrossIcon, HistoryIcon } from "@library/icons";

  import { Tooltip } from "@library/ui";
  import { WithButtonV5 } from "@workspaces/common/hoc";
  const timelines = ["", "", "", "", ""];
</script>

<div class="position-relative">
  <div>
    <Tooltip title="History" placement="bottom-left" distance={10}>
      <WithButtonV5
        icon={HistoryIcon}
        onClick={() => {
          // quickHelp = true;
        }}
        disable={false}
        loader={false}
      />
    </Tooltip>
    <div
      class="position-absolute d-flex flex-column bg-tertiary-300 border-radius-2 p-3"
      style="bottom:-10px;
              right:0;
              z-index:100;
              width: 300px; 
              height: 500px;
              transform: translateY(100%)"
    >
      <div>
        <!-- HEADER -->
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <HistoryIcon
              height={"15px"}
              width={"15px"}
              color={"var(--icon-secondary-100)"}
            />
            <span class="ms-2 text-fs-12"> Run History </span>
          </div>
          <div>
            <CrossIcon
              height={"15px"}
              width={"15px"}
              color={"var(--icon-secondary-170)"}
            />
          </div>
        </div>
        <hr class="my-3" />

        <!-- TITLE -->
        <p class="text-fs-10">Login Flow</p>
      </div>
      <!-- BODY -->
      <div style="flex:1; overflow:auto;">
        <div class="time-line ms-3">
          {#each timelines as tm}
            <div class="position-relative">
              <div class="m-3 p-3 bg-secondary-400">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Harum
                nam min
              </div>
              <div
                class="position-absolute bg-primary-300"
                style="height:20px; width:20px; top:0; left: -10px; border-radius:50%; overflow:hidden;"
              ></div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .time-line {
    border-left: 1px solid red;
  }
</style>
