<script lang="ts">
    import { EditIcon } from "@library/icons";
</script>

<div class="d-flex flex-column " style="height: 234px; gap:8px; font-size:14px;">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight:600; ">Documentation</div>
    <div class="edit-btn d-flex align-items-center  " style="gap: 3px; padding-left: 4px; padding-right:4px; border-radius:2px;" >
        <div class="mb-1"> <EditIcon height={"10.56px"} width={"10.56px"} color={"#3670F7"} /> </div>
        <p class="edit-txt mb-0" style="font-size: 12px; " >Edit</p>
    </div>
  </div>
  <div style="height:200px;">
    <textarea
      class="h-100 w-100 border-0"
      style="background-color:#191919; outline:none; border-radius:2px; padding-top:8px; padding-left:12px;"
      placeholder="Add Documentation"
    />
  </div>
</div>

<style>
  .edit-btn:hover{
    background-color: #11253A;
    color: white !important;

  }
  .edit-txt{
    color:#3670F7 ; 

  }
</style>