<script lang="ts">
  export let username: string;
  export let width: number;
  export let height: number;
  export let borderRadius: number;
  export let classProp = "";
  export let stypeProp = "";
  export let userProfileUrl: string | undefined = undefined;
</script>

{#if !userProfileUrl || userProfileUrl == ""}
  <div
    style={`width: ${width ? width + "px" : "auto"}; height: ${
      height ? height + "px" : "auto"
    }; border-radius: ${borderRadius + "px"}; ${stypeProp}`}
    class="sparrow-user-profile-sm d-flex align-items-center justify-content-center {classProp}"
  >
    <p class="sparrow-fs-10 mb-0">
      {username?.length > 0 && username}
    </p>
  </div>
{/if}

<style lang="scss">
  .sparrow-user-profile-sm {
    border: 1px solid var(--defaultcolor);
  }
</style>
