<script lang="ts">
  import { Motion } from "svelte-motion";
  import { scaleMotionProps } from "$lib/utils/animations";
  import { EnvironmentList, EnvironmentPanel } from "$lib/components";
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="d-flex" use:motion>
    <EnvironmentList />
    <EnvironmentPanel />
  </div>
</Motion>
