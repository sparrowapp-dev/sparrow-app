<script lang="ts">
    import { updateWorkspace } from "$lib/services/workspace.service";
    import { currentTab, handleTabUpdate } from "$lib/store/request-response-section";
    import { currentWorkspace } from "$lib/store/workspace.store";
    import { onDestroy } from "svelte";
    import { setCurrentWorkspace } from "$lib/store/workspace.store";

  interface workspace{
    id:string;
    name:string;

  }
  let selectedWorkspace:Partial<workspace>={}
  let currentWorkSpaceTabId:string;
  let newWorkspaceName:string;
  const workspaceUnSubscribe=currentWorkspace.subscribe((value)=>{
     selectedWorkspace=value;
  })
  const currentTabUnsubscribe = currentTab.subscribe((value)=>{
    if(value && value.id){
    currentWorkSpaceTabId = value.id;
    }
  });

  const handleWorkspaceInput=(event)=>{
    handleTabUpdate({save:false},currentWorkSpaceTabId)
    newWorkspaceName=event.target.value;
  }


  const modifyWorkspace=async()=>{
    debugger;
    const workspace=await updateWorkspace(selectedWorkspace.id,{name:newWorkspaceName})
    const {_id:id, name}=workspace.data.data;
    setCurrentWorkspace(id,name);
    handleTabUpdate({save:true,name},id)
}
  onDestroy(() => {
  workspaceUnSubscribe();
  currentTabUnsubscribe();
});
</script>
<div class="main-container">
<div class="my-workspace">
  <div class="my-workspace-header">
    <input type="text" value={selectedWorkspace.name} class="workspace-input" on:input={(event)=>{handleWorkspaceInput(event)}}
      on:blur={()=>{modifyWorkspace()}} on:keydown={(event)=>{
        if(event.key=="Enter"){modifyWorkspace()}}}>
    <button class="invite-btn">Invite</button>
  </div>
  <div class="my-workspace-info">
    <p class="workspace-info">This is your personal workspace.Start Typing. Describe the Objective of your workspace and how it is meant to be used. Or create a comprehensive API documentaion by including links to your collection and requests</p>
  </div>
</div>
</div>


<style>
  .main-container {
    margin-top: 44px;
    position: fixed;
    left: 352px;
    width: calc(100vw - 352px - 280px);
    height: calc(100vh - 44px);
    background-color:var(--background-color);
  }
  .my-workspace{
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
  .my-workspace-header{
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  .workspace-input{
    border: none;
    text-align: center;
    background-color: linear-gradient(0deg, #313233, #313233);
    border-bottom: 1px solid  #85C2FF;
  }
  .invite-btn{
    background-color: #1193F0;
    padding: 5px 20px;
    border: none;
    border-radius: 5px;
  }
  .workspace-info{
    font-size: 15px;
    margin-top: 15px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #8A9299;
  }
</style>
