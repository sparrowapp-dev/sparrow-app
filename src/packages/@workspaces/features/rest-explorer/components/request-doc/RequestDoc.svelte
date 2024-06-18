<script lang="ts">
    import { EditIcon } from "@library/icons";
</script>

<div class="d-flex flex-column " style="height: 234px; gap:8px; font-size:14px;">
  <div class="d-flex" style="justify-content: space-between;">
    <div style="font-weight:600; ">Documentation</div>
    <div class="d-flex align-items-center " style="gap: 6.78px; " >
        <div class="mb-1"> <EditIcon height={"10.56px"} width={"10.56px"} color={"#3670F7"} /> </div>
        <p class="mb-0" style="font-size: 12px; color:#3670F7; " >Edit</p>
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
