<script>
   import whitePlus from "$lib/assets/plus-white.svg";
</script>
<div class="main-container  ps-3 pe-3 pt-3">
<p class="main-header">Add Collections to your Workspace to group your requests or send an API request directly</p>
<div class="button-container">
    <button class="buttons">
      <img src={whitePlus } alt="+">Collection
    </button>
    <button class="buttons">
      <img src={whitePlus} alt="+">
      API Request</button>
</div>
</div>

<style>
.main-container{
  width: 100%;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.main-header{
  font-size: 14px;
}
.button-container{
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 10px;
  align-items: center;
}
.buttons{
display: flex;
justify-content: center;
align-items: center;
gap:5px;
width:180px;
height: 32px;
padding: 4px, 12px, 4px, 4px;
border-radius: 4px;
background: linear-gradient(270deg, #6147FF -1.72%, #1193F0 100%);
border: none;
}
</style>