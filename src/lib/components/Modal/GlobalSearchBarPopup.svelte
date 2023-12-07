<script>
  import tickMark from "$lib/assets/tickMark.svg";
  import collections from "$lib/assets/collections.svg";
  import workspaces from "$lib/assets/workspaces.svg";
  import Folder from "$lib/assets/folder.svg"
  import Request from "$lib/assets/apiRequest.svg"

</script>

<div class="background-overlay"></div>
<div class="container">
  <div class="workspace-options-container">
    <div class="workspace-options">
      <img src={tickMark} alt="tickMark" />
      <span>All</span>
    </div>
    <div class="workspace-options">
      <img src={workspaces} alt="workspaces" style="margin-left: -6px;"/>
      <span>Workspaces</span>
    </div>
    <div class="workspace-options">
      <img src={collections} alt="collections" style="margin-left: -6px;" />
      <span>Collections</span>
    </div>
    <div class="workspace-options">
      <img src={Folder} alt="folder" />
      <span>Folder</span>
    </div>
    <div class="workspace-options">
      <img src={Request} alt="request" />
      <span>Request</span>
    </div>
  </div>
  <div class="search-options-container">

  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 2fr 3fr;
    position: absolute;
    height: 400px;
    width: 400px;
    top: 30px;
    left: 0;
    background-color: var(--background-color);
    z-index: 9999;
    border-radius: 10px;
    margin-top: 5px;
  }

  .workspace-options-container {
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 10px;
  }

  .workspace-options {
    width: 90%;
    border-radius: 6px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    gap:8px;
    height: 32px;
    /* border:2px solid red; */
    /* background-color: #313233; */
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    padding: 6px 12px 6px 12px;
  }

  .workspace-options:hover{
    background-color: #313233;
  }

  .background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-hover);
    backdrop-filter: blur(3px);
    z-index: 9999;
    /* border:2px solid red; */
  }
</style>
