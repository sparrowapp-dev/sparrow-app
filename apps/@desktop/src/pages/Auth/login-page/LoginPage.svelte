<script lang="ts">
  import { Link, navigate } from "svelte-navigator";
  import { setUser } from "@app/store/auth.store";
  import { jwtDecode } from "@app/utils/jwt";
  import googleLogo from "@deprecate/assets/googlelogo.svg";
  import eyeHide from "@deprecate/assets/eye-hide.svg";
  import eyeShow from "@deprecate/assets/eye-show.svg";
  import { authNavigate, handleLoginValidation } from "./login-page";
  import sparrowicon from "@deprecate/assets/sparrowIcon.svg";
  import { once } from "@tauri-apps/api/event";
  import { Window } from "@tauri-apps/api/window";

  let isEmailTouched = false;

  let isEmailValid = false;
  const validateEmail = () => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    isEmailTouched = true;
    isEmailValid = emailRegex.test(loginCredentials.email);
    if (isEmailValid) {
      validationErrors.email = "";
    } else if (isEmailTouched) {
      validationErrors.email = "";
    }
    if (loginCredentials.email === "") {
      validationErrors.email = "Please enter an email id";
    }
  };

  //------------------------------ TOKEN -----------------------------------//

  // Use the window object to maximize the page

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("t");

  if (token) {
    setUser(jwtDecode(token));
    navigate("/");
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
  let isLoadingPage: boolean;
  const handleSignInWithGoogle = async () => {
    isLoadingPage = true;
    await authNavigate();
  };

  once("onclose", async (event) => {
    const oauthWindow = await Window.getByLabel("oauth");
    if (oauthWindow) {
      oauthWindow.onCloseRequested(() => {
        isLoadingPage = false;
      });
    }
  });

  let isPasswordtouched: boolean = false;

  // isLoading.subscribe((value) => {
  //   isLoadingPage = value;
  // });

  let isPasswordError: boolean;

  // isResponseError.subscribe((value) => {
  //   isPasswordError = value;
  // });

  let errorMessage: string = "";

  let isPasswordVisible = false;

  const togglePasswordVisibility = () => {
    isPasswordVisible = !isPasswordVisible;
    const passwordInput = document.getElementById("exampleInputPassword1");
    if (passwordInput) {
      passwordInput.type = isPasswordVisible ? "text" : "password";
    }
  };

  const handlePasswordChange = () => {
    isPasswordtouched = true;
    if (isPasswordtouched === true) {
      validationErrors.password = "";
    }
  };

  let isSignInPopup: boolean = false;
  const handleSignInPopup = (flag: boolean) => {
    if (validationErrors.isSuccessful) {
      isSignInPopup = flag;
    }
  };
</script>

{#if isSignInPopup}
  <!-- <LoginWaitingScreen onClick={handleSignInPopup} {isLoadingPage} /> -->
{/if}

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded"
  style="height:100vh;"
>
  <!-- <Header /> -->
  <div
    class="container d-flex flex-column align-items-center justify-content-center"
  >
    <p
      class="container-header text-whiteColor mt-5 ms-2 me-2 mb-4"
      style="font-size:40px;width:408px; height:48px;font-weight:500;"
    >
      Welcome to Sparrow!
    </p>
    <form
      class="login-form text-whiteColor ps-1 pe-1 gap-16 mb-2"
      style="width:408px;"
      novalidate
      on:submit|preventDefault={async () => {
        validationErrors = await handleLoginValidation(loginCredentials);

        if (validationErrors) {
          errorMessage = "Please enter an email id";
        }
        if (validationErrors.isSuccessful) {
          isSignInPopup = true;
        }
      }}
    >
      <p class="card-subtitle fs-4 mb-3">Sign In</p>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label text-red">Email</label
        >
        <input
          type="email"
          class="form-control bg-black border:{validationErrors.email ||
          isPasswordError === true
            ? '3px'
            : '1px'} solid {validationErrors.email || isPasswordError === true
            ? 'border-error'
            : 'border-default'}"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Please enter your registered email id"
          autocorrect="off"
          autocapitalize="none"
          bind:value={loginCredentials.email}
          on:input={validateEmail}
        />

        {#if validationErrors.email && loginCredentials.email.length > 0}
          <small class="form-text text-dangerColor">
            {validationErrors.email}</small
          >
        {:else if loginCredentials.email.length === 0}
          <small class="form-text text-dangerColor"> {errorMessage}</small>
        {/if}
      </div>

      <div class="mb-4">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <div class="d-flex">
          <input
            type="password"
            autocomplete="off"
            on:click={handlePasswordChange}
            id="exampleInputPassword1"
            placeholder="Please enter your Password"
            bind:value={loginCredentials.password}
            class="form-control bg-black border:{isPasswordError === true
              ? '3px'
              : '1px'} solid {isPasswordError === true ||
            validationErrors.password
              ? 'border-error'
              : 'border-default'}"
          />
          <button
            type="button"
            on:click={togglePasswordVisibility}
            class="bg-blackColor border-0 eye-icon d-flex align-items-center"
          >
            {#if isPasswordVisible}
              <img src={eyeShow} alt="eye-show" />
            {:else}
              <img src={eyeHide} alt="eye-hie" />
            {/if}
          </button>
        </div>

        {#if validationErrors.password || validationErrors.password?.length === 0}
          <small class="form-text text-dangerColor"
            >{validationErrors.password}</small
          >
        {:else if isPasswordError === true || validationErrors.password?.length > 0}
          <small class="form-text text-dangerColor"
            >The email and password combination you entered appears to be
            incorrect. Please try again.</small
          >
        {/if}
      </div>
      <div class="d-flex mb-4 align-items-center justify-content-end">
        <Link
          to="/forgot/password"
          class="text-decoration-none text-primaryColor">Forgot Password?</Link
        >
      </div>

      <div class="mb-1">
        <button
          class="btn btn-primary w-100 text-whiteColor border-0"
          on:click={() => {
            handleSignInPopup(true);
          }}>Sign In</button
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
        <Link
          to="/register"
          style="color: #007BFF;"
          class=" text-decoration-none text-primaryColor">Create Account</Link
        >
      </div>
    </div>
  </div>
  <div
    class="BottomLogo text-white d-flex justify-content-center align-items-center"
  >
    <img src={sparrowicon} alt="" class="w-50" />
  </div>
</div>

<style>
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }
  .eye-icon > img {
    position: absolute;
    transform: translateX(-4vmax);
  }

  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }

  @media (min-width: 1000px) {
    .eye-icon > img {
      position: absolute;
      transform: translateX(-2vmax);
    }
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
      margin: 0px auto;
      padding: 0px;
      border-radius: 8px;
      gap: 16px;
      height: auto;
    }
  }
</style>
