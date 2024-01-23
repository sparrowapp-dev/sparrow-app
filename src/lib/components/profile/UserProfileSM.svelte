<script lang="ts">
  export let username: string;
  export let userProfileUrl: string | undefined = undefined;
</script>

<div>
  {username?.length > 0 && username[0]}
</div>

<style lang="scss">
</style>
