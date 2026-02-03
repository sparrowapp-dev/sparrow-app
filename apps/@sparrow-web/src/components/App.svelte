<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";
  import { Modal, Toast } from "@sparrow/library/ui";
  import Authguard from "../routing/Authguard.svelte";
  import Navigate from "../routing/Navigate.svelte";
  import Dashboard from "../pages/Dashboard/Dashboard.svelte";
  import { onMount, onDestroy } from "svelte";
  import { handleLogin } from "./App";
  import { initPostHog } from "@app/utils/posthog/posthogConfig";
  export let url = "/";
  import { inviteModalStore } from "@app/store/inviteModal.store";

  let channel: BroadcastChannel;

  onMount(async () => {
    if (typeof window !== "undefined") {
      initPostHog();

      // Listen for refresh events from other tabs
      channel = new BroadcastChannel("sparrow_app_channel");
      channel.onmessage = (event) => {
        if (event.data === "refresh") {
          window.location.reload();
        }
      };
    }
    handleLogin(window.location.search);
  });

  onDestroy(() => {
    if (channel) channel.close();
  });
</script>

{#if $inviteModalStore.show && $inviteModalStore.data}
  <Modal
    title="Access Granted!"
    type="dark"
    width="520px"
    zIndex={2000}
    isOpen={true}
    handleModalState={() => {
      inviteModalStore.set({ show: false, data: null });
    }}
  >
    <div style="display:flex; flex-direction:column; gap:12px;">
      <p class="text-fs-14">
        You’re now a <b>{$inviteModalStore.data.role}</b>
        in the following workspace(s) under the
        <b>{$inviteModalStore.data.teamName}</b> hub:
      </p>

      <ol style="padding-left:18px;">
        {#each $inviteModalStore.data.workspaceNames as workspace}
          <li>{workspace}</li>
        {/each}
      </ol>

      <div style="display:flex; justify-content:flex-end;">
        <button
          class="btn btn-primary"
          on:click={() => inviteModalStore.set({ show: false, data: null })}
        >
          Continue
        </button>
      </div>
    </div>
  </Modal>
{/if}

<Router {url}>
  <Authguard>
    <section slot="loggedIn">
      <Route path="/app/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/app/" /></Route>
    </section>
    <section slot="guestUser">
      <Route path="/guest/*" component={Dashboard} />
      <Route path="/*"><Navigate to="/guest/" /></Route>
    </section>
    <!-- <section slot="unauthorized">ACCESS DENIED</section> -->
  </Authguard>
</Router>

<Toast />

<style>
</style>
