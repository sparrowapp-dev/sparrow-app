<script>
  import { GithubIcon, LinkedinOrgIcon, XIcon } from "@sparrow/library/icons";
  import { Button } from "@sparrow/library/ui";
  import { Avatar } from "@sparrow/library/ui";
</script>

<div
  class="d-flex flex-column"
  style="gap : 60px; padding: 12px; color: var(--text-ds-neutral-50);"
>
  <div class="d-flex flex-column" style="gap: 20px;">
    <div class="d-flex align-items-center" style="gap : 8px;">
      {#if false}
        <Avatar type="image" size="large" image={""} />
      {:else}
        <Avatar
          type="letter"
          size="large"
          letter="T"
          bgColor="var(--bg-secondary-600)"
        />
      {/if}
      <span
        class="text-ds-font-size-28 text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);">AdCore Labs</span
      >
    </div>
    <hr style="color: var(--border-ds-surface-50);" />
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column" style="gap: 20px; width: 60%;">
        <div class="d-flex flex-column" style="gap: 8px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Hub Summary</span
          >
          <span
            >AdCore Labs builds robust tools for managing and optimizing digital
            marketing campaigns across multiple platforms. With a focus on
            automation, performance tracking, and real-time insights, it helps
            teams run smarter, data-driven campaigns with ease.</span
          >
        </div>
        <div class="d-flex flex-column" style="gap: 8px">
          <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
            >Owner</span
          >
          <span>AdCorelabs123</span>
        </div>
      </div>
    
    </div>
  </div>
    <div
        class="d-flex flex-column"
        style=" gap: 20px; width: 30%; align-items: start;"
      >
        <span class="text-ds-font-size-20 text-ds-font-weight-semi-bold"
          >Social Links</span
        >
        <div class="d-flex flex-row align-items-center" style="gap: 8px;">
          <GithubIcon color="white"/>
          <Button
            title="hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
            type={"link-primary"}
            size="small"
            maxWidth="70%"
          />
        </div>
        <Button
          title="hii"
          type={"link-primary"}
          startIcon={LinkedinOrgIcon}
          size="small"
          buttonClassProp="ps-0 pe-1"
        />
        <Button
          title="hii"
          type={"link-primary"}
          startIcon={XIcon}
          size="small"
          buttonClassProp="ps-0 pe-1"
        />
      </div>
</div>
