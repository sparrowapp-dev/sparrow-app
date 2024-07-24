<script lang="ts">
  import { SendIcon } from "@library/icons";

  export let placeholder = "";
  export let sendPrompt;
  export let prompt: string = "";
  export let onUpdateAiPrompt;
</script>

<div class="d-flex prompt-input p-3">
  <div class="position-relative w-100">
    <input
      type=""
      bind:value={prompt}
      on:input={() => {
        onUpdateAiPrompt(prompt);
      }}
      class="w-100 pe-5 py-2 ps-2 border-radius-6 text-fs-12"
      style="border:1px solid grey; outline: none; background-color: var(--bg-secondary-1100); border: 1px solid var(--border-tertiary-190); "
      {placeholder}
      on:keydown={(event) => {
        if (event.key === "Enter" && prompt) {
          sendPrompt(prompt);
          onUpdateAiPrompt("");
        }
      }}
    />

    <div
      style="position:absolute; right:12px ; top: 50%; 
        transform : translateY(-60%);
      "
      on:click={() => {
        if (data) {
          sendPrompt(data);
          data = "";
        }
      }}
    >
      <SendIcon
        height={"16px"}
        width={"16px"}
        color={"var(--icon-secondary-100)"}
      />
    </div>
  </div>
</div>

<style>
  input::placeholder {
    color: var(--text-secondary-250);
  }
</style>
