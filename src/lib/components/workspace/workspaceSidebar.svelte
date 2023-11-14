<script lang="ts">
  import gear from "$lib/assets/gear.svg";
  import circleinfo from "$lib/assets/circle-info.svg";
    import { user } from "$lib/store/auth.store";
    import { onDestroy } from "svelte";
    import { currentTab } from "$lib/store/request-response-section";
    import type { User } from "$lib/utils/user";
    import { collectionList } from "$lib/store/collection";
    import type { Collection } from "$lib/utils/interfaces/collection.interface";
   let userInfo:Partial<User>={};
   let workspaceId:string;
   let userName:string;
   let collection:Collection[]=[];
   let apiRequests:number=0;
   const collectionListUnsubscribe = collectionList.subscribe((value) => {
    collection = value;
    apiRequests=0;
    collection.map((coll)=>{
      apiRequests+=coll.totalRequests
    })
  }
  );
   const userUnsubscribe=user.subscribe((value)=>{
      userInfo=value;
   })
   const currentTabUnsubscribe = currentTab.subscribe((value) => {
    if (value && value.id) {
      workspaceId = value.id;
      if (workspaceId && userInfo) {
        userName=userInfo.personalWorkspaces.filter((workspace)=>{
          return workspaceId= workspace.workspaceId
        })[0].name
      }
    }
  });
    
    onDestroy(()=>{
      userUnsubscribe()
      currentTabUnsubscribe()
    })
</script>
<div class="main-container">
<div class="sidebar w-100 p-4">
  <div class="sidebar-btn d-flex flex-column gap-2">
     <button><img src={circleinfo} alt="circleinfo">About</button>
     <button><img src={gear} alt="gear">Workspace Setting</button>
  </div>
  <div class="border my-3 border-bottom border-dark"></div>
  <div class="fs-6 p-2 pt-1">
    <p class="text-secondary font-family-roboto fs-6 fw-bold">Last Activity by</p>
    <p style="margin-top: -10px;">{userName}</p>
  </div>
</div>
<div class="workspace-info">
<p><span class="api-info">{apiRequests}</span>API REQUESTS</p>
<p><span class="api-info">{collection.length}</span>COLLECTION</p>
</div>
</div>

<style>
  .main-container{
    width: 280px;
    position: fixed;
    font-family: Roboto;
    right: 0;
    top: 80px;
    border-left: 1px solid var(--border-color);
    height: calc(100vh - 80px);
    z-index: 99;
  }
  .sidebar-btn>button{
    display: flex;
    align-items: center;
    background-color: #313233;
    gap:4px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    padding: 5px;
  }
  .workspace-info{
    position: fixed;
    bottom: 0;
    padding: 15px;
    display: flex;
    width: 100%;
    color:#45494D;
    font-size: 12px;
  }
  .workspace-info>:first-child{
    margin-right: 10px;
  }
  .api-info{
    color: #85C2FF;
    line-height: 18px;
    font-size: 16px;
    padding-left: 10px;
  }
</style>