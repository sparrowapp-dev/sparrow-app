<script>
  import { JSONEditor } from "svelte-jsoneditor";

  let content = {
    text: `
      {
        "nameS": "Testing",
        "email": "testing@testing.com"
      }`, // can be used to pass a stringified JSON document instead
    json: {
      name: "Testin",
      email: "testing@testing.com",
    },
  };

  $: console.log("contents changed:", content);
</script>

<div>
    <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Dropdown button
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" href="#">Action</a>
          <a class="dropdown-item" href="#">Another action</a>
          <a class="dropdown-item" href="#">Something else here</a>
        </div>
      </div>
</div>
<div class="editor ps-3 rounded">
  <JSONEditor bind:content />
</div>

<!-- <style>
    .editor {
      width: 100%;
      max-width: 600px;
      height: 400px;
    }
  </style> -->
