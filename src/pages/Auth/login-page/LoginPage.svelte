<!-- SignIn.svelte -->
<script lang="ts">
  import { navigate } from "svelte-navigator";
  import { authActions } from "$lib/store/auth.store";
  import Header from "$lib/components/header/Header.svelte";
  import logo from "$lib/assets/logo.svg";
  import googleLogo from "$lib/assets/googlelogo.png";

  import {
    navigateToRegister,
    authNavigate,
    handleLoginValidation,
  } from "./login-page";

  //------------------------------ TOKEN -----------------------------------//
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("t");
  if (token) {
    authActions.setUser({ token });
    navigate("/");
  }

  //------------------------------ Login State --------------------------//
  let loginState = false;

  //---------------- Login Validation --------------------//
  let validationErrors: any = {};

  //------------ login Credentials ---------------//
  let loginCredentials = {
    email: "",
    password: "",
  };

  // Handle sign-in with external providers
  const handleSignInWithProvider = (provider: string) => {
    // Handle sign-in with GitHub, Google, Microsoft, etc.
    // You can implement the authentication logic here.
    // Example: Redirect to OAuth authorization URL for the selected provider.
    console.log(`Signing in with ${provider}`);
  };
</script>

<div class="card-body">
  <Header />

  <div class="formControl">
    <h1 class="card-title mb-4">Welcome to Sparrow!</h1>

    <form
      class="login-form"
      on:submit|preventDefault={async () => {
        validationErrors = await handleLoginValidation(loginCredentials);
      }}
    >
      <h2 class="card-subtitle">Sign In</h2>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Please enter your registered email id"
          bind:value={loginCredentials.email}
        />
      </div>
      {#if validationErrors.email}
        <small class="text-danger form-text">{validationErrors.email}</small>
      {/if}

      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="exampleInputPassword1"
          placeholder="Please enter your Password"
          bind:value={loginCredentials.password}
        />
      </div>
      {#if validationErrors.password}
        <small class="text-danger form-text">{validationErrors.password}</small>
      {/if}

      <a
        href="/forgot"
        class=" text-decoration-none mb-3 d-flex justify-content-end"
        >Forgot Password?</a
      >

      <div class="mb-5 mt-3">
        <button class="btn btn-gradient w-100">Sign In</button>
      </div>

      <div class="d-flex flex-column align-items-center justify-content-center">
        <p>or continue with</p>
        <div class="gap-4">
          <!-- <button
                  class="w-8 rounded"
                  on:click={() => handleSignInWithProvider("GitHub")}
                >
                  <i class="fab fa-github" />
                </button> -->
          <button
            class="w-2 card rounded bg-light-black d-flex align-items-center justify-content-center"
            on:click={() => handleSignInWithProvider("Google")}
          >
            <img src={googleLogo} alt="Google Logo" class="googleLogo" />
          </button>

          <!-- <button
                  class="w-8 rounded"
                  on:click={() => handleSignInWithProvider("Microsoft")}
                >
                  <i class="fab fa-microsoft" />
                </button> -->
        </div>
        <p class="fs-6 gap-2 mt-3">
          New to Sparrow? <a href="/register" class=" text-decoration-none"
            >Create Account</a
          >
        </p>
      </div>
    </form>
  </div>

  <!-- "New to the website? Create an account" link -->
  <div class="BottomLogo"><img src={logo} alt="" /></div>
</div>

<style>
  /* Add your custom styles here */

  h2.card-subtitle {
    font-size: 24px; /* Adjust the font size as needed */
    color: white;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  h1.card-title {
    font-size: 39px; /* Adjust the font size as needed */
    color: white;
    margin-left: 30px;
    margin-top: 30px;
  }

  .card-body {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: black;
    margin: auto;
    padding-top: 10px;
    padding-bottom: 10px;
    max-width: 500px;
    overflow: hidden;
  }

  .login-form {
    padding-left: 30px;
    padding-right: 30px;
  }

  .btn-gradient {
    background-image: linear-gradient(to right, hwb(211 0% 0%), #4930eec1);
    color: white;
  }

  .googleLogo {
    width: 23px;
    height: 23px;
  }

  .bg-light-black {
    background-color: #3333337a; /* You can adjust the color code as needed */
  }

  .BottomLogo {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }

  .BottomLogo > img {
    width: 28vw;
  }

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

    .BottomLogo > img {
      width: 15vw;
    }

    .formControl {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .login-form {
      height: 429px;
      width: 408px;
    }

    h2.card-subtitle {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    h1.card-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .BottomLogo {
      margin-top: 90px;
    }
  }
</style>
