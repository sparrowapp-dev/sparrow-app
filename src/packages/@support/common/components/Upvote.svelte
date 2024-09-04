<script lang="ts">
  import { TriangleIcon } from "@library/icons";
  export let upvote;
</script>

<div
  style="display: flex; flex-direction: column; align-items: center; border: 0.3px solid #8A9299; padding: 5px; border-radius: 4px; cursor: pointer; margin-left: 10px;"
>
  <div style="height: 24px; width:24px; text-align:center;">
    <TriangleIcon height={"5px"} width={"10px"} color={"var(--white-color)"} />
  </div>
  <span style="margin-top: 5px; font-size: 14px;">{upvote}</span>
</div>
