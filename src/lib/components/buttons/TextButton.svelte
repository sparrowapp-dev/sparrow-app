<script lang="ts">
  /**
   * @deprecated This component is deprecated and will be removed in future releases.
   * Please use Button Component instead.
   */
  export let text: string;
  export let onClick;
</script>

<button
  style="color: #85C2FF; border: 1px solid #85C2FF; font-size: 12px; margin-bottom:4px;"
  class="btn"
  on:click={() => {
    onClick();
  }}>{text}</button
>
