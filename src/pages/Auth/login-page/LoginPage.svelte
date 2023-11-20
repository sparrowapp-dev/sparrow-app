<script lang="ts">
  import { navigate } from "svelte-navigator";
  import { isLoading, isResponseError, setUser } from "$lib/store/auth.store";
  import { jwtDecode } from "$lib/utils/jwt";
  import Header from "$lib/components/header/Header.svelte";
  import logo from "$lib/assets/logo.svg";
  import googleLogo from "$lib/assets/googlelogo.svg";
  // import githubLogo from "$lib/assets/githublogo.svg";
  // import microsoftLogo from "$lib/assets/microsoftlogo.svg";

  import { authNavigate, handleLoginValidation } from "./login-page";
  import PageLoader from "$lib/components/Transition/PageLoader.svelte";

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

  const handleSignInWithGoogle = () => {
    authNavigate();
  };

  let isLoadingPage: boolean;
  isLoading.subscribe((value) => {
    isLoadingPage = value;
  });

  let isPasswordValid: boolean;

  isResponseError.subscribe((value) => {
    isPasswordValid = value;
  });
</script>

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 100vh;"
>
  <Header />
  {#if isLoadingPage}
    <PageLoader />
  {:else}
    <div class="d-flex flex-column align-items-center justify-content-center">
      <p
        class="text-whiteColor mt-5 ms-2 me-2 mb-4"
        style="font-size: 40px; width:408px; height:48px;font-weight:500"
      >
        Welcome to Sparrow!
      </p>
      <form
        class="login-form text-whiteColor ps-1 pe-1 gap-16 mb-4"
        style="width:408px;"
        on:submit|preventDefault={async () => {
          validationErrors = await handleLoginValidation(loginCredentials);
        }}
      >
        <p class="card-subtitle fs-4 mb-3">Sign In</p>
        <div class="mb-3">
          <label for="exampleInputEmail1" class="form-label text-red"
            >Email</label
          >
          <input
            type="email"
            class="form-control bg-black border:{validationErrors.email ||
            isPasswordValid === true
              ? '3px'
              : '1px'} solid {validationErrors.email || isPasswordValid === true
              ? 'border-error'
              : 'border-default'}"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            placeholder="Please enter your registered email id"
            bind:value={loginCredentials.email}
            on:input={validateEmail}
          />
          {#if validationErrors.email && loginCredentials.email.length > 0}
            <small class="form-text text-dangerColor">
              {validationErrors.email}</small
            >
          {/if}
        </div>

        <div class="mb-4">
          <label for="exampleInputPassword1" class="form-label">Password</label>
          <input
            type="password"
            id="exampleInputPassword1"
            placeholder="Please enter your Password"
            bind:value={loginCredentials.password}
            class="form-control bg-black border:{isPasswordValid === true
              ? '3px'
              : '1px'} solid {isPasswordValid === true
              ? 'border-error'
              : 'border-default'}"
          />

          {#if isPasswordValid === true}<small
              class="form-text text-dangerColor"
              >The email and password combination you entered appears to be
              incorrect. Please try again.</small
            >{/if}
        </div>

        <div class="d-flex mb-4 align-items-center justify-content-end">
          <a
            href="/forgot/password"
            class="text-decoration-none text-primaryColor">Forgot Password?</a
          >
        </div>

        <div class="mb-1">
          <button class="btn btn-primary w-100 text-whiteColor border-0"
            >Sign In</button
          >
        </div>
      </form>
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
            on:click={handleSignInWithGoogle}
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
    </div>
    <div
      class="BottomLogo text-white mt-3 d-flex justify-content-center align-items-center"
    >
      <img src={logo} alt="" class="w-50" />
    </div>
  {/if}
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
