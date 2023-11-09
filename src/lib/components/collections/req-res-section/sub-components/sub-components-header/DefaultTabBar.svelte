<script lang="ts">
     import about from "$lib/assets/about.svg";
     import collections from "$lib/assets/collections.svg";
     import apiRequest  from "$lib/assets/apiRequest.svg";
     import { v4 as uuidv4 } from "uuid";
    import { handleTabAddons } from "$lib/store/request-response-section";
    import { moveNavigation } from "$lib/utils/helpers/navigation";
    import { createSampleRequest } from "$lib/utils/sample/request.sample";
  const addApiRequest=()=>{
        handleTabAddons(
          createSampleRequest(
            uuidv4()));
        moveNavigation('right');
}
</script>
<div class="main-container">
   <div class="header-container">
    <h1 class="main-container-header">
      Check this Workspace's documentation
    </h1>
      <button class="about-btn">
        <img src={about} alt="" style="font-size: 12px;"/>
        About My Workspace</button>
   </div>
   <div class="create-container">
    <h1 class="create-container-header">
      Create New
    </h1>
    <div class="create-container-button">
      <button class="create-container-btn" on:click={()=>{addApiRequest()}}>
        <img src={apiRequest} alt="" style="width: 20px;"/>
        API Request</button>
        <button class="create-container-btn">
          <img src={collections} alt="" style="width: 26px;"/>
          Collection</button>
    </div>
   </div>
</div>


<style>
.main-container{
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
}
.header-container,.create-container{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
}
.create-container{
  margin-top: 35px;
}

.main-container-header,.create-container-header{
  font-size: 15px;
  color: gray;
}
.about-btn{
  display: flex;
  width:150px;
  align-items:center;
  background-color: #313233;
  justify-content:space-around;
  font-size: 12px;
  padding: 8px 8px;
  border: none;
  border-radius: 4px;
}
.create-container-button{
  display: flex;
  justify-content: space-between;
  gap:40px;
}
.create-container-btn{
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap:10px;
  background: none;
  border:1px solid  #313233;
  border-radius: 10px;
  font-size: 12px;
  padding: 20px;
  height: 77px;
}
</style>
