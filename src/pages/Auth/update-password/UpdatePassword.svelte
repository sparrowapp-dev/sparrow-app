SignIn.svelte
<script lang="ts">
  import { navigate } from "svelte-navigator";
  import { authActions } from "$lib/store/auth.store";
  import Header from "$lib/components/header/Header.svelte";
  import logo from "$lib/assets/logo.svg";
  import angleLeft from "$lib/assets/angleleft.png";

  //   import {
  //     navigateToRegister,
  //     authNavigate,
  //     handleLoginValidation,
  //   } from "./login-page";

  //------------------------------ TOKEN -----------------------------------//
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("t");
  if (token) {
    authActions.setUser({ token });
    navigate("/reset/password");
  }

  //---------------- Login Validation --------------------//
  let validationErrors: any = {};

  //------------ login Credentials ---------------//
  let loginCredentials = {
    email: "",
    password: "",
  };
</script>

<div class="card-body">
  <Header />
  <div class="formControl">
    <h1 class="card-title mb-4">Welcome to Sparrow!</h1>
    <div class="UpdateContainer">
      <div class="updatetop1">
        <img src={angleLeft} alt="" />
        <h6>Change Password</h6>
      </div>
      <div class="updatetop2">
        <p class="paragraph1">
          To ensure that this is really you, we have sent a confirmation link to
          your email raman.rayaprolu@techdome.net.in.
        </p>
        <p class="paragraph2">The confirmation link will expire in 24 hours</p>
        <p>
          No email in your inbox or spam folder? <a href="/reset/email"
            >Resend Email</a
          >
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  @media (min-width: 600px) {
    .card-body {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: black;
      margin: auto;
      padding-top: 10px;
      padding-bottom: 10px;
      max-width: 1500px;
      overflow: hidden;
    }

    .formControl {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 50px;
      width: Fill (408px);
    }

    .updatetop1 {
      display: flex;
      width: Fill (408px);
      height: Hug (27px);
      gap: 8px;
    }

    .updatetop2 {
      width: Fill (408px);
      height: Hug (125px);
      gap: 16px;
    }

    .paragraph1 {
      width: 408px;
      height: 42px;
    }
    .paragraph2 {
    }

    h1.card-title {
      display: flex;
      width: 408px;
      height: 48px;
      align-items: center;
    }

    .UpdateContainer {
      width: Fixed (408px);
      height: Hug (168px);
      border-radius: 8px;
      gap: 16px;
    }
  }
</style>
