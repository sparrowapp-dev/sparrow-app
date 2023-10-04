<script lang="ts">
  import { navigate } from "svelte-navigator";
  import { handleRegisterValidation } from "./register-page";
  import Header from "$lib/components/header/Header.svelte";

  let userData = {
    email: "",
    username: "",
    fullName: "",
    password: "",
    teamName: "",
    tnsCheckbox: false,
  };

  let validationErrors: any = {};
</script>

<div
  class="d-flex bg-black flex-column p-5 justify-content-center align-items-center h-50 m-auto"
  style="max-width: 500px;"
  data-tauri-drag-region
>
  <Header />
  <h1 data-tauri-drag-region>Create Account</h1>
  <p data-tauri-drag-region>Create an account to get started.</p>

  <form
    class="form mt-4"
    novalidate
    on:submit|preventDefault={async () => {
      validationErrors = await handleRegisterValidation(userData);
    }}
    data-tauri-drag-region
  >
    <div class="form-group" data-tauri-drag-region>
      <label for="email" data-tauri-drag-region>Email</label>
      <input
        class="form-control mt-1"
        type="email"
        name="email"
        id="email"
        required
        bind:value={userData.email}
      />
      {#if validationErrors.email}
        <small class="text-danger form-text">{validationErrors.email}</small>
      {/if}
    </div>
    <div class="form-group mt-3" data-tauri-drag-region>
      <label for="username" data-tauri-drag-region>Username</label>
      <input
        class="form-control mt-1"
        type="text"
        name="username"
        id="username"
        required
        bind:value={userData.username}
      />
    </div>
    {#if validationErrors.username}
      <small class="text-danger form-text">{validationErrors.username}</small>
    {/if}
    <div class="form-group mt-3" data-tauri-drag-region>
      <label for="fullName" data-tauri-drag-region>Full Name</label>
      <input
        class="form-control mt-1"
        type="text"
        name="fullName"
        id="fullName"
        required
        bind:value={userData.fullName}
      />
    </div>
    {#if validationErrors.fullName}
      <small class="text-danger form-text">{validationErrors.fullName}</small>
    {/if}
    <div class="form-group mt-3" data-tauri-drag-region>
      <label for="password" data-tauri-drag-region>Password</label>
      <input
        class="form-control mt-1"
        type="password"
        name="password"
        id="password"
        required
        bind:value={userData.password}
      />
    </div>
    {#if validationErrors.password}
      <small class="text-danger form-text">{validationErrors.password}</small>
    {/if}
    <div class="form-group mt-3" data-tauri-drag-region>
      <label for="teamName" data-tauri-drag-region
        >Team or Organization Name</label
      >
      <input
        class="form-control mt-1"
        type="text"
        name="teamName"
        id="teamName"
        disabled
      />
      <small data-tauri-drag-region class="text-muted form-text"
        >Team name should be all small case and should not contain special
        characters and spaces. (disabled currently / coming soon)</small
      >
    </div>
    <div class="form-group mt-4" data-tauri-drag-region>
      <input
        type="checkbox"
        class="form-check-input"
        id="tnsCheckbox"
        bind:checked={userData.tnsCheckbox}
      />
      <label
        data-tauri-drag-region
        class="form-check-label ms-2"
        for="tnsCheckbox"
        >I agree to the <a href="#">Terms and Conditions</a></label
      >
    </div>

    <button type="submit" class="btn btn-primary mt-4 w-100"
      >Create Free Account</button
    >
  </form>
  <button class="btn btn-link mt-4 w-100" on:click={() => navigate(-1)}
    >Go Back</button
  >
</div>
