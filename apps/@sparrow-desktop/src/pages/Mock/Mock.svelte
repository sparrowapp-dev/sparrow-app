<script lang="ts">
  import UnderDevelopment from "../UnderDevelopment/UnderDevelopment.svelte";
  import { Motion } from "svelte-motion";
  // import { scaleMotionProps } from "@deprecate/utils/animations";
</script>

<!-- <Motion {...scaleMotionProps} let:motion> -->
<div class="d-flex" use:motion>
  <UnderDevelopment
    heading="Mock Server"
    description="Seamlessly simulate the behavior of a real API server, effortlessly accepting requests and delivering responses."
    subHeading="Mock server will provide you the ability of:"
    subSubHeadingOne="Enhanced Collaborative Mocking"
    subSubDescOne="Fostering seamless collaborative mocking feature to allow multiple team members to contribute to the configuration of a mock server in real-time."
    subSubHeadingTwo="Dynamic Response Variation"
    subSubDescTwo="Elevating precision testing by introducing intelligent response variations allowing the mock server to dynamically adjust responses based on the incoming requests."
  />
</div>
<!-- </Motion> -->
