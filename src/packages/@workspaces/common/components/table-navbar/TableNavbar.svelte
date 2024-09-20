<script>
  import { ArrowOutwardIcon, CrossIcon } from "@library/icons";

  export let selectedNode;
</script>

<div
  class="d-flex align-items-center justify-content-between p-1 ps-2 pe-2"
  style="height:34px; background-color:var(--bg-tertiary-300); border-bottom:1px solid #4B4F6B ; "
>
  <div
    class="d-flex align-items-center justify-content-start gap-2"
    style="width:calc(100% - 50px)"
  >
    <p
      class="text-fs-10 mb-0 pb-0"
      style="color:var(--text-secondary-270); margin-bottom:0px; padding-bottom:0px;"
    >
      {selectedNode?.request?.property?.request?.method}
    </p>
    <p
      class="text-fs-12 mb-0 pb-0 ellipsis"
      style="color:var(--text-secondary-270); margin-bottom:0px; padding-bottom:0px;"
    >
      {selectedNode?.request?.name}
    </p>
    <div
      style="height: 12px; width:1px; background-color:var(--bg-secondary-270); border:1px solid #D7D7D7 "
    ></div>
    <p
      class="text-fs-12 mb-0 pb-0 ellipsis"
      style="color:var(--text-secondary-270); font-weight:400;"
    >
      {selectedNode?.request?.property?.request?.url}
    </p>
  </div>
  <div class="d-flex gap-2 align-items-center" style="cursor:pointer">
    <ArrowOutwardIcon
      width={"8px"}
      height={"8px"}
      color={"var(  --icon-secondary-200)"}
    />
    <CrossIcon
      width={"14px"}
      height={"14px"}
      color={"var(--icon-secondary-200)"}
    />
  </div>
</div>
