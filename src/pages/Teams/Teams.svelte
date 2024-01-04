<script lang="ts">
  // import TeamsList from "$lib/components/teams/teams-list/TeamsList.svelte";
  // import TeamsContent from "$lib/components/teams/teams-content/TeamsContent.svelte";
  import { Motion } from "svelte-motion";
  import UnderDevelopment from "../UnderDevelopment/UnderDevelopment.svelte";
  import { scaleMotionProps } from "$lib/utils/animations";
</script>

<Motion {...scaleMotionProps} let:motion>
  <div class="d-flex" use:motion>
    <!-- <TeamsList /> -->
    <!-- <TeamsContent /> -->
    <UnderDevelopment
      heading="Teams"
      description="Elevating team collaboration seamlessly by leveraging features that streamline onboarding, foster team discovery, and facilitate shared workspace for enhanced cooperation on API projects."
      subHeading="Teams is set to provide you the power of:"
      subSubHeadingOne="Unified Collaboration Interface"
      subSubDescOne="Enhanced teamwork efficiency with centralized interface, fostering seamless collaboration on API projects through discussions, comments, and shared workspaces for request, versions, schemas and scripts. "
      subSubHeadingTwo="Multi-team Collaboration Flexibility"
      subSubDescTwo="Seamlessly create, join, and switch between teams, empowering users to manage diverse projects effortlessly across various structures. "
    />
  </div>
</Motion>
