<script lang="ts">
<<<<<<< HEAD
  export let size1 = "16px";
  export let color = "red";
  $: console.log("size-----", size1);
=======
  export let size = "20px";
  export let color = "";
  $: finalColor = color === "" ? "inherit" : color;
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
</script>

<i
  class="icon-ic_fluent_dismiss_20_regular"
<<<<<<< HEAD
  style="color:{color}; line-height:1; display: inline-block;"
></i>

<!-- <div class="preview">
  <span class="inner">
    <i class="icon icon-ic_fluent_accessibility_error_20_filled"></i>
  </span>
  <br />
  <span class="label">ic_fluent_accessibility_error_20_filled</span>
</div> -->

<style>
  .preview {
    width: 100px;
    display: inline-block;
    margin: 10px;
  }
  .preview .inner {
    display: inline-block;
    width: 100%;
    text-align: center;
    background: #f5f5f5;
    -webkit-border-radius: 3px 3px 0 0;
    -moz-border-radius: 3px 3px 0 0;
    border-radius: 3px 3px 0 0;
  }
  .preview .inner {
    line-height: 85px;
    font-size: 40px;
    color: #333;
  }
</style>
=======
  style="font-size:{size}; color:{finalColor}; display: flex; justify-content:center; align-items:center;"
></i>

<style>
</style>
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
