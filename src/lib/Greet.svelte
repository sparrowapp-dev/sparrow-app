<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri"

  let name = "";
  let greetMsg = ""

  async function greet(){
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsg = await invoke("greet", { name })
  }
</script>

<div>
  <form class="row" on:submit|preventDefault={greet}>
    <input id="greet-input" class="form-control" placeholder="Enter a name..." bind:value={name} />
    <button class="btn btn-primary mt-2" type="submit">Greet</button>
  </form>
  <p>{greetMsg}</p>
</div>