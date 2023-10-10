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
  import { error } from "$lib/api/api.common";

  // Function to validate the email
  let isEmailTouched = false;

  // Function to validate the email
  let isEmailValid = false;
  const validateEmail = () => {
    const emailRegex = /^[\w-]+@([\w-]+\.)+[\w-]{2,6}$/;
    isEmailTouched = true;
    isEmailValid = emailRegex.test(loginCredentials.email);
    if (isEmailValid) {
      validationErrors.email = "";
    } else if (isEmailTouched) {
      // Show an error only if the field has been touched and the email is not valid
      // validationErrors.email = "";
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
    authActions.setUser({ token });
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

  let errorMessage = "";

  const handleLogin = async () => {
    // Check if the entered password matches the registered password

    if (loginCredentials.password.length <= 0) {
      errorMessage = "Please enter a password";
    }

    // isEmailValid = false;

    if (validationErrors.password && loginCredentials.password.length > 0) {
      errorMessage =
        "The email and password combination you entered appears to be incorrect. Please try again."; // Set an error message
    }
    // Reset the password error message
    validationErrors.password = "";
  };

  // Handle sign-in with external providers
  const handleSignInWithProvider = (provider: string) => {
    // Handle sign-in with GitHub, Google, Microsoft, etc.
    // You can implement the authentication logic here.
    // Example: Redirect to OAuth authorization URL for the selected provider.
    console.log(`Signing in with ${provider}`);
    maximizePage();
  };
</script>

<div class="card-body">
  <Header />

  <div class="formControl">
    <h1 class="card-title mb-4">Welcome to Sparrow!</h1>

    <form
      class="login-form"
      on:submit|preventDefault={handleLogin}
      on:submit|preventDefault={async () => {
        validationErrors = await handleLoginValidation(loginCredentials);
      }}
    >
      <h2 class="card-subtitle">Sign In</h2>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">Email</label>
        <input
          type="email"
          class="form-control bg-black"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Please enter your registered email id"
          bind:value={loginCredentials.email}
          on:input={validateEmail}
          style="border:{validationErrors.email
            ? '3px'
            : '1px'} solid {isEmailValid
            ? '#8DC599'
            : validationErrors.email && validationErrors.password
            ? '#E5ACB2'
            : isEmailTouched
            ? '#E5ACB2'
            : '#45494D'}"
        />
        {#if validationErrors.email}
          <small class="form-text" style="color: #FE8C98;">
            {validationErrors.email}</small
          >
        {/if}
      </div>

      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input
          type="password"
          class="form-control bg-black"
          id="exampleInputPassword1"
          placeholder="Please enter your Password"
          bind:value={loginCredentials.password}
          style="border:{validationErrors.password
            ? '3px'
            : '1px'} solid {validationErrors.password ? ' #FE8C98' : '#313233'}"
        />
        <small class="form-text" style="color: #FE8C98;">{errorMessage}</small>
      </div>

      <a
        href="/reset/password"
        style="color: #007BFF;"
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
          New to Sparrow? <a
            href="/register"
            style="color: #007BFF;"
            class=" text-decoration-none">Create Account</a
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
    font-size: 40px; /* Adjust the font size as needed */
    color: white;
    margin-left: 30px;
    margin-top: 30px;
  }

  .card-body {
    height: 749px;
    display: flex;
    flex-direction: column;
    background: #000000;
    margin: auto;
    max-width: 500px;
    overflow: hidden;
    border-radius: 14px;
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
    width: Hug (205px);
    height: Hug (52px);
    padding-top: 12px;
    gap: 2px;
  }

  .BottomLogo > img {
    width: 40vw;
  }

  @media (min-width: 600px) {
    .card-body {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: black;
      margin: auto;
      padding-top: 1px;
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
      width: 408px;
      height: 48px;
      font-size: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    .BottomLogo {
      margin-top: 75px;
    }
  }
</style>
