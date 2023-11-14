<script lang="ts">
  import { navigate } from "svelte-navigator";
  import { setUser } from "$lib/store/auth.store";
  import { jwtDecode } from "$lib/utils/jwt";
  import Header from "$lib/components/header/Header.svelte";
  import logo from "$lib/assets/logo.svg";
  import googleLogo from "$lib/assets/googlelogo.svg";
  // import githubLogo from "$lib/assets/githublogo.svg";
  // import microsoftLogo from "$lib/assets/microsoftlogo.svg";

  import { handleLoginValidation } from "./login-page";

  let isEmailTouched = false;

  let isEmailValid = false;
  const validateEmail = () => {
    const emailRegex = /^[\w-]+@([\w-]+\.)+[\w-]{2,6}$/;
    isEmailTouched = true;
    isEmailValid = emailRegex.test(loginCredentials.email);
    if (isEmailValid) {
      validationErrors.email = "";
    } else if (isEmailTouched) {
      validationErrors.email = "";
    }
  };

  //------------------------------ TOKEN -----------------------------------//

  // Use the window object to maximize the page
  function maximizeWindow() {
    window.innerWidth = screen.width;
    window.innerHeight = screen.height;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("t");
  if (token) {
    setUser(jwtDecode(token));
    navigate("/");
    maximizeWindow();
  }

  //------------------------------ Login State --------------------------//
  // let loginState = false;

  //---------------- Login Validation --------------------//
  let validationErrors: any = {};

  //------------ login Credentials ---------------//
  let loginCredentials = {
    email: "",
    password: "",
  };

  // let errorMessage = "";

  // Handle sign-in with external providers
  const handleSignInWithProvider = (provider: string) => {
    // Handle sign-in with GitHub, Google, Microsoft, etc.
    // You can implement the authentication logic here.
    // Example: Redirect to OAuth authorization URL for the selected provider.
    console.log(`Signing in with ${provider}`);
    // maximizePage();
  };
</script>

<!-- Below used color as color variable -->
<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 100vh;"
>
  <Header />
  <div
    class="d-flex mb-5 flex-column align-items-center justify-content-center"
  >
    <h1
      class="text-whiteColor mt-5 ms-2 me-2 mb-4"
      style="font-size: 40px; width:408px; height:48px;"
    >
      Welcome to Sparrow!
    </h1>
    <form
      class="login-form text-whiteColor ps-1 pe-1 gap-16"
      style="width:408px; height:429px"
      on:submit|preventDefault={async () => {
        validationErrors = await handleLoginValidation(loginCredentials);
        if (isEmailValid && loginCredentials.password.length > 0) {
          validationErrors.password =
            "The email and password combination you entered appears to be incorrect. Please try again.";
        }
      }}
    >
      <h2 class="card-subtitle fs-4 mb-3">Sign In</h2>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label text-red">Email</label
        >
        <input
          type="email"
          class="form-control bg-black border:{validationErrors.email
            ? '3px'
            : '1px'} solid {validationErrors.email
            ? 'border-error'
            : 'border-default'}"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Please enter your registered email id"
          bind:value={loginCredentials.email}
          on:input={validateEmail}
        />
        {#if validationErrors.email}
          <small class="form-text text-dangerColor">
            {validationErrors.email}</small
          >
        {/if}
      </div>

      <div class="mb-4">
        <label
          for="exampleInputPassword1"
          class="form-label"
          data-tauri-drag-region>Password</label
        >
        <input
          type="password"
          class="form-control bg-black"
          id="exampleInputPassword1"
          placeholder="Please enter your Password"
          bind:value={loginCredentials.password}
          style="border:{validationErrors.password
            ? '3px'
            : '1px'} solid {validationErrors.password
            ? 'border-error'
            : 'border-default'}"
        />

        {#if validationErrors.password}<small class="form-text text-dangerColor"
            >{validationErrors.password}</small
          >{/if}
      </div>

      <div class="d-flex mb-4 align-items-center justify-content-end">
        <a
          href="/forgot/password"
          class="text-decoration-none text-primaryColor">Forgot Password?</a
        >
      </div>

      <div class="mb-5">
        <button class="btn btn-primary w-100 text-whiteColor border-0"
          >Sign In</button
        >
      </div>

      <div class="d-flex flex-column align-items-center justify-content-center">
        <p>or continue with</p>
        <div class="d-flex gap-4">
          <!-- <button
            on:click={() => handleSignInWithProvider("Github")}
            style="width: 32px; height:32px"
            class="bg-dark border-0 rounded"
          >
            <img src={githubLogo} alt="Github Logo" class="w-100 h-100" />
          </button> -->
          <button
            on:click={() => handleSignInWithProvider("Google")}
            style="width: 32px; height:32px"
            class="bg-dark border-0 rounded"
          >
            <img src={googleLogo} alt="Google Logo" class="w-100 h-100 p-1" />
          </button>
          <!-- <button
            on:click={() => handleSignInWithProvider("Microsoft")}
            style="width: 32px; height:32px"
            class="bg-dark border-0 rounded"
          >
            <img src={microsoftLogo} alt="Microsoft Logo" class="w-100 h-100" />
          </button> -->
        </div>
        <!-- "New to the website? Create an account" link -->
        <div class="gap-3 d-flex align-items-center">
          <p class="fs-6 mt-3">New to sparrow?</p>
          <a
            href="/register"
            style="color: #007BFF;"
            class=" text-decoration-none text-primaryColor">Create Account</a
          >
        </div>
      </div>
    </form>
  </div>
  <div
    class="BottomLogo text-white mt-5 d-flex justify-content-center align-items-center"
  >
    <img src={logo} alt="" class="w-50" />
  </div>
</div>

<style>
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }

  @media (min-width: 576px) {
    .BottomLogo {
      width: Hug (205px);
      height: Hug (52px);
      padding: 8px;
      gap: 6px;
    }
    .BottomLogo > img {
      width: 200px;
      height: 80px;
    }

    .login-form {
      width: 488px;
      margin: 0px auto;
      padding: 0px;
      border-radius: 8px;
      gap: 16px;
      height: auto; /* Remove fixed height for larger screens */
    }
  }
</style>
