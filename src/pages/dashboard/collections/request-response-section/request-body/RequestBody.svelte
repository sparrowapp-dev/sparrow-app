<script>
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { JSONEditor } from "svelte-jsoneditor";

  let content = {
    text: `
      {
        "nameS": "Testing",
        "email": "testing@testing.com"
      }`, 
    json: {
      name: "Testing",
      email: "testing45@testing.com",
    },
  };

  $: console.log("contents changed:", content);

  let handleDropdown = (tab)=>{
    console.log(tab);
  }
</script>


<div class="editor ps-3 rounded">
  <Dropdown data={["Pretty"]} onclick={handleDropdown} /><span class="px-2"/>
  <Dropdown data={["JSON", "XML", "RAW"]} onclick={handleDropdown} />
  <br/>
  <br/>
  <JSONEditor bind:content />
</div>