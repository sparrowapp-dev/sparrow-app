<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import googleLogo from "$lib/assets/googlelogo.svg";
  import githubLogo from "$lib/assets/githublogo.svg";
  import microsoftLogo from "$lib/assets/microsoftlogo.svg";
  import vector1 from "$lib/assets/Vector1.svg";
  import vector2 from "$lib/assets/Vector2.svg";
  import vector3 from "$lib/assets/Vector3.svg";

  import { navigate } from "svelte-navigator";
  import { handleRegisterValidation } from "./register-page";

  let userData = {
    email: "",
    name: "",
    password: "",
    tnsCheckbox: false,
  };

  let validationErrors: any = {};

  //Here i am handling state variable;

  let isPasswordValid1 = false;
  let isPasswordValid2 = false;
  let isPasswordValid3 = false;

  let isCheckboxTouched = false;

  let isEmailTouched = false;
  let isNameTouched = false;
  let isPasswordTouched = false;

  let tnsCheckboxError = "";

  // Function to validate the email
  let isEmailValid = false;
  const validateEmail = () => {
    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    isEmailTouched = true;
    isEmailValid = emailRegex.test(userData.email);
    if (isEmailValid) {
      validationErrors.email = "";
    } else if (isEmailTouched) {
      // Show an error only if the field has been touched and the email is not valid
      // validationErrors.email = "";
    }
  };

  let isNameValid = false;
  const validateName = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    let isNameTouched = true;
    isNameValid = nameRegex.test(userData.name);

    if (isNameValid) {
      validationErrors.name = "";
    } else if (isNameTouched) {
      // validationErrors.name = "";
    }
  };

  let isValidPassword = false;

  const validatePassword = () => {
    const password = userData.password;

    // Check if the password is valid using the isValidPassword function
    isPasswordValid1 = isValidPassword1(password);
    isPasswordValid2 = isValidPassword2(password);
    isPasswordValid3 = isValidPassword3(password);
    isValidPassword = isValid(password);

    if (isPasswordValid1 && isPasswordValid2 && isPasswordValid3) {
      validationErrors.password = "";
    } else if (isPasswordTouched) {
    } else {
      validationErrors.password = isPasswordValid1;
      validationErrors.password = isPasswordValid2;
      validationErrors.password = isPasswordValid3;
    }
  };

  const isValid = (password) => {
    if (
      isValidPassword1(password) &&
      isValidPassword2(password) &&
      isValidPassword3(password)
    ) {
      return true;
    }
    return false;
  };

  const isValidPassword1 = (password) => {
    isPasswordTouched = true;

    if (password.length >= 8) {
      return (isPasswordValid1 = true);
    }
    return (isPasswordValid1 = false);
  };

  const isValidPassword2 = (password) => {
    isPasswordTouched = true;
    if (/(?=.*[0-9])/.test(password)) {
      return (isPasswordValid2 = true);
    }
    return (isPasswordValid2 = false);
  };

  const isValidPassword3 = (password) => {
    isPasswordTouched = true;

    if (/(?=.*[!@#$%^&*])/.test(password)) {
      return (isPasswordValid3 = true);
    }
    return (isPasswordValid3 = false);
  };

  let ischeckBoxValid = false;

  const validateCheckbox = () => {
    isCheckboxTouched = true;
    ischeckBoxValid = userData.tnsCheckbox;
    if (ischeckBoxValid) {
      validationErrors.tnsCheckbox = "";
    } else if (isCheckboxTouched) {
      // validationErrors.tnsCheckbox = "Please accept the terms and conditions";
    }
  };

  // Handle sign-in with external providers
  const handleSignInWithProvider = (provider: string) => {
    // Handle sign-in with GitHub, Google, Microsoft, etc.
    // You can implement the authentication logic here.
    // Example: Redirect to OAuth authorization URL for the selected provider.
    console.log(`Signing in with ${provider}`);
  };
</script>

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 900px;"
  data-tauri-drag-region
>
  <Header />
  <div
    class="d-flex mb-5 flex-column align-items-center justify-content-center"
    data-tauri-drag-region
  >
    <h1
      class="text-whiteColor mt-5 ms-2 me-2 mb-4"
      style="font-size: 40px; width:408px; height:48px;"
    >
      Welcome to Sparrow!
    </h1>

    <form
      class="register-form text-whiteColor ps-1 pe-1 gap-16"
      style="width:408px; height:429px"
      novalidate
      on:submit|preventDefault={async () => {
        validationErrors = await handleRegisterValidation(userData);
      }}
      data-tauri-drag-region
    >
      <h2 class="card-subtitle fs-4 mb-3">Create Account</h2>
      <div class="form-group gap-0 mb-3" data-tauri-drag-region>
        <label for="email" class="form-label" data-tauri-drag-region
          >Email</label
        >
        <input
          class="form-control mt-1 bg-black border:{validationErrors.email
            ? '3px'
            : '1px'} solid {isEmailValid
            ? 'border-success'
            : validationErrors.email
            ? 'border-error'
            : isEmailTouched
            ? 'border-error'
            : 'border-default'}"
          type="email"
          name="email"
          id="email"
          placeholder="Please enter your email id"
          required
          bind:value={userData.email}
          on:input={validateEmail}
        />

        {#if validationErrors.email}
          <small class="text-dangerColor form-text"
            >{validationErrors.email}</small
          >
        {/if}
      </div>
      <div class="form-group mb-3" data-tauri-drag-region>
        <label for="name" data-tauri-drag-region>Full Name</label>
        <input
          class="form-control mt-1 bg-black border:{validationErrors.email
            ? '3px'
            : '1px'} solid {isNameValid
            ? 'border-success'
            : validationErrors.name
            ? 'border-error'
            : isNameTouched
            ? 'border-error'
            : 'border-default'}"
          type="text"
          name="name"
          placeholder="Please enter your full name"
          id="name"
          required
          bind:value={userData.name}
          on:input={validateName}
        />

        {#if validationErrors.name}
          <small class="text-dangerColor form-text"
            >{validationErrors.name}</small
          >
        {/if}
      </div>

      <div class="form-group" data-tauri-drag-region>
        <label for="password" data-tauri-drag-region>Password</label>
        <input
          class="form-control mt-1 bg-black border:{validationErrors.password
            ? '3px'
            : '1px'} solid {isPasswordValid1 &&
          isPasswordValid2 &&
          isPasswordValid3
            ? 'border-success'
            : validationErrors.password
            ? 'border-error'
            : isPasswordTouched
            ? 'border-error'
            : 'border-default'}"
          type="password"
          name="password"
          id="password"
          placeholder="Please enter your password"
          required
          bind:value={userData.password}
          on:input={validatePassword}
        />
      </div>

      <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
          <div
            class="d-flex flex-column align-items-start mt-1 text-sm"
            style="font-size: 13px;"
          >
            <div class="d-flex align-items-center mb-0 gap-2">
              <img
                src={isPasswordValid1
                  ? vector2
                  : isPasswordTouched
                  ? vector3
                  : vector1}
                alt=""
                class="mr-2"
              />
              <p
                class="mb-0 text : {isPasswordValid1
                  ? 'text-successColor'
                  : isPasswordTouched
                  ? 'text-dangerColor'
                  : 'text-defaultColor'}"
              >
                Min 8 characters
              </p>
            </div>
            <div class="d-flex align-items-center mb-0 gap-2">
              <img
                src={isPasswordValid2
                  ? vector2
                  : isPasswordTouched
                  ? vector3
                  : vector1}
                alt=""
                class="mr-2"
              />
              <p
                class="mb-0 text : {isPasswordValid2
                  ? 'text-successColor'
                  : isPasswordTouched
                  ? 'text-dangerColor'
                  : 'text-defaultColor'}"
              >
                Has at least one number
              </p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <img
                src={isPasswordValid3
                  ? vector2
                  : isPasswordTouched
                  ? vector3
                  : vector1}
                alt=""
                class="mr-2"
              />
              <p
                class="mb-0 text : {isPasswordValid3
                  ? 'text-successColor'
                  : isPasswordTouched
                  ? 'text-dangerColor'
                  : 'text-defaultColor'}"
              >
                Has at least one special character
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group mt-2" data-tauri-drag-region>
        <input
          type="checkbox"
          class="form-check-input bg-black"
          id="tnsCheckbox"
          bind:checked={userData.tnsCheckbox}
        />
        <label
          data-tauri-drag-region
          class="form-check-label ms-2"
          for="tnsCheckbox"
          >I agree to the <a
            href="checkbox"
            class="text-decoration-none text-primaryColor">Terms of Service</a
          ></label
        >
      </div>
      {#if validationErrors.tnsCheckbox}
        <small class="text-dangerColor form-text"
          >{validationErrors.tnsCheckbox}</small
        >
      {/if}

      <div class="mb-5 mt-4">
        <button class="btn btn-primary w-100 text-whiteColor border-0"
          >Sign Up</button
        >
      </div>

      <div class="d-flex flex-column align-items-center justify-content-center">
        <p>or continue with</p>
        <div class="d-flex gap-4">
          <button
            on:click={() => handleSignInWithProvider("Github")}
            style="width: 32px; height:32px"
            class="bg-dark border-0 rounded"
          >
            <img src={githubLogo} alt="Github Logo" class="w-100 h-100" />
          </button>
          <button
            on:click={() => handleSignInWithProvider("Google")}
            style="width: 32px; height:32px"
            class="bg-dark border-0 rounded"
          >
            <img src={googleLogo} alt="Google Logo" class="w-100 h-100" />
          </button>
          <button
            on:click={() => handleSignInWithProvider("Microsoft")}
            style="width: 32px; height:32px"
            class="bg-dark border-0 rounded"
          >
            <img src={microsoftLogo} alt="Microsoft Logo" class="w-100 h-100" />
          </button>
        </div>
        <!-- "New to the website? Create an account" link -->
        <div class="gap-3 d-flex align-items-center">
          <p class="fs-6 mt-3">Already have an account?</p>
          <a href="/login" class=" text-decoration-none text-primaryColor"
            >Sign In</a
          >
        </div>
      </div>
    </form>
  </div>
</div>

<style>
  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }

  @media (min-width: 576px) {
    .register-form {
      width: 488px;
      margin: 0px auto;
      padding: 0px;
      border-radius: 8px;
      gap: 16px;
      height: auto; /* Remove fixed height for larger screens */
    }
  }
</style>
