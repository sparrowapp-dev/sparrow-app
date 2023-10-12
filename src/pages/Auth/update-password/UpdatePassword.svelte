<script lang="ts">
  //   import { navigate } from "svelte-navigator";
  //   import { authActions } from "$lib/store/auth.store";
  import Header from "$lib/components/header/Header.svelte";
  import logo from "$lib/assets/logo.svg";
  import angleLeft from "$lib/assets/angleleft.png";
  export let email: string;
  //   import {
  //     navigateToRegister,
  //     authNavigate,
  //     handleLoginValidation,
  //   } from "./login-page";

  //------------------------------ TOKEN -----------------------------------//
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const token = urlParams.get("t");
  //   if (token) {
  //     authActions.setUser({ token });
  //     navigate("/reset/password");
  //   }

  //this is for testing
  const handleToResetPage = () => {
    navigate("/reset/password");
  };
</script>

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 800px;"
  data-tauri-drag-region
>
  <Header />
  <div class="formControl">
    <h1 class="card-title mb-4">Welcome to Sparrow!</h1>
    <div class="UpdateContainer">
      <div class="updatetop1">
        <div>
          <a href="/"><img src={angleLeft} alt="" /></a>
        </div>
        <h6>Change Password</h6>
      </div>
      <div class="updatetop2">
        <p class="paragraph1">
          To ensure that this is really you, we have sent a confirmation link to
          your email
          <span class="email-address">{email}</span>.
        </p>

    <div
      class="login-form text-lightGray ps-1 pe-1 gap-16"
      style="width:408px; height:183px"
    >
      <div class="d-flex flex-column align-items-left mb-2">
        <div class="d-flex align-items-left mb-3 gap-3">
          <a href="/"><img src={angleLeft} alt="" /></a>
          <h6 class="text-whiteColor fs-5">Change Password</h6>
        </div>
        <div style="font-size: 15px;">
          <p>
            To ensure that this is really you, we have sent a confirmation link
            to your email

            <span class="fw-bold text-whiteColor cursor-pointer"
              >raman.rayaprolu@techdome.net.in</span
            >
          </p>

          <p>
            The confirmation link will expire in <span
              class="fw-bold text-whiteColor">24 hours</span
            >.
          </p>

          <p>
            If your email ID is registered with us then you would have received
            an email in your inbox with verification link
          </p>
        </div>
      </div>
      <div class="d-flex gap-3">
        <p style="font-size: 13px;">No email in your inbox or spam folder?</p>
        <a
          href="/forgot/password"
          style="font-size: 13px;"
          class="text-decoration-none text-primaryColor fw-bold">Resend Email</a
        >
      </div>
    </div>
  </div>
</div>
