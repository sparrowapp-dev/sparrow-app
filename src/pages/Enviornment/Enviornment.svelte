<script lang="ts">
  import { M, Motion } from "svelte-motion";
  import UnderDevelopment from "../UnderDevelopment/UnderDevelopment.svelte";
  import { scaleComponent } from "$lib/utils/animations";
</script>

<Motion {...scaleComponent} let:motion>
  <div class="d-flex" use:motion>
    <UnderDevelopment
      heading="Environment"
      description="Experience versatility, swiftly adjustable settings, fostered secured collaboration of your workflow with our dynamic flexibility of Environment."
      subHeading="Environment is set to give you the power of:"
      subSubHeadingOne="Effortless Variable Configuration:"
      subSubDescOne="Easy creation and configuration of environment variables, specifying values for streamlining the process of setting up variables for request, headers, and scripts."
      subSubHeadingTwo="Enhanced Environment Management:"
      subSubDescTwo="Effective management of environment with creation, editing, switching of workflow, simplifying the adaption of personalizeable variables for different testing scenarios."
    />
  </div>
</Motion>
