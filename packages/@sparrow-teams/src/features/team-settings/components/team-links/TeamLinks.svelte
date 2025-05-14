<script lang="ts">
  import { Input } from "@sparrow/library/forms";
  import { GithubIcon, LinkedinOrgIcon, XIcon } from "@sparrow/library/icons";
  export let openTeam;
  export let onUpdateTeam;
  let hubGithubUrl = openTeam?.githubUrl;
  let hubXUrl = openTeam?.xUrl;
  let hubLinkedinUrl = openTeam?.linkedinUrl;
</script>

<div
  style="flex:1; overflow:auto; gap:16px; display: flex; flex-direction: column; "
  class="ps-5 pe-1"
>
  <div class="input-icon">
    <span class="input-header">GitHub Url</span>
    <Input
      id="github-link"
      value={hubGithubUrl}
      type="text"
      placeholder="Enter GitHub Url"
      size="small"
      variant="primary"
      width="90%"
      startIcon={GithubIcon}
      iconSize={20}
      iconColor={"#ffffff"}
      on:blur={async (e) => {
        await onUpdateTeam(openTeam.teamId, {
          githubUrl: e.detail,
        });
      }}
    />
  </div>
  <div class="input-icon">
    <span class="input-header">LinkedIn Url</span>
    <Input
      id="linkedIn-link"
      type="text"
      value={hubLinkedinUrl}
      placeholder="Enter LinkedIn Url"
      size="small"
      variant="primary"
      width="90%"
      startIcon={LinkedinOrgIcon}
      iconColor="#ffffff"
      iconSize={20}
      on:blur={async (e) => {
        await onUpdateTeam(openTeam.teamId, {
          linkedinUrl: e.detail,
        });
      }}
    />
  </div>
  <div class="input-icon">
    <span class="input-header">X Url</span>
    <Input
      id="X-link"
      type="text"
      value={hubXUrl}
      placeholder="Enter X Url"
      size="small"
      variant="primary"
      width="90%"
      startIcon={XIcon}
      iconSize={16}
      on:blur={async (e) => {
        await onUpdateTeam(openTeam.teamId, {
          xUrl: e.detail,
        });
      }}
    />
  </div>
</div>

<style lang="scss">
  .input-header {
    font-size: 12px;
    color: var(--text-ds-neutral-200);
    font-weight: 500;
  }
  .input-icon {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
