<script lang="ts">
  import { TriangleIcon } from "@library/icons";

  export let score;
</script>

<div
  style="height:50px; display: flex; flex-direction: column; align-items: center; border: 0.3px solid #8A9299; padding-left: 5px;  padding-right: 5px; border-radius: 4px; margin-left: 10px;"
>
  <div style="height: 24px; width:24px; text-align:center;">
    <TriangleIcon height={"5px"} width={"10px"} color={"var(--white-color)"} />
  </div>
  <span style="margin-top: 0px; font-size: 14px;">{score}</span>
</div>
