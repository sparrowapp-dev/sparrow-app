<script>
  import { SendIcon } from "@library/icons";

  export let placeholder = "";
  export let sendPrompt;
  let data = "";
</script>

<div class="d-flex">
  <input
    type=""
    bind:value={data}
    {placeholder}
    on:keydown={(event) => {
      if (event.key === "Enter" && data) {
        sendPrompt(data);
        data = "";
      }
    }}
  />
  <button
    on:click={() => {
      if (data) {
        sendPrompt(data);
        data = "";
      }
    }}
  >
    <SendIcon height={"16px"} width={"16px"} color={"red"} />
  </button>
</div>
