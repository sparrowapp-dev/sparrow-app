<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import googleLogo from "$lib/assets/googlelogo.png";
  import vector1 from "$lib/assets/Vector1.png";
  import vector2 from "$lib/assets/Vector2.png";
  import vector3 from "$lib/assets/Vector3.png";

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

  const validateCheckbox = () => {
    isCheckboxTouched = true;
    if (!userData.tnsCheckbox) {
      return "Please accept the terms and conditions";
    }
    return true;
  };

  // Handle sign-in with external providers
  const handleSignInWithProvider = (provider: string) => {
    // Handle sign-in with GitHub, Google, Microsoft, etc.
    // You can implement the authentication logic here.
    // Example: Redirect to OAuth authorization URL for the selected provider.
    console.log(`Signing in with ${provider}`);
  };
</script>

<div class="card-body" data-tauri-drag-region>
  <Header />
  <div class="formControl">
    <h1 class="card-title mb-4" data-tauri-drag-region>Welcome to Sparrow!</h1>
    <form
      class="login-form"
      novalidate
      on:submit|preventDefault={async () => {
        validationErrors = await handleRegisterValidation(userData);
      }}
      data-tauri-drag-region
    >
      <h2 class="card-subtitle">Create Account</h2>
      <div class="form-group gap-0 mb-3" data-tauri-drag-region>
        <label for="email" data-tauri-drag-region>Email</label>
        <input
          class="form-control mt-1 bg-black"
          type="email"
          name="email"
          id="email"
          placeholder="Please enter your email id"
          required
          bind:value={userData.email}
          on:input={validateEmail}
          style="border:{validationErrors.email
            ? '3px'
            : '1px'} solid {isEmailValid
            ? '#8DC599'
            : validationErrors.email
            ? '#E5ACB2'
            : isEmailTouched
            ? '#E5ACB2'
            : '#45494D'}"
        />
        <div>
          {#if validationErrors.email}
            <small class="text-danger form-text">{validationErrors.email}</small
            >
          {/if}
        </div>
      </div>
      <div class="form-group mt-3" data-tauri-drag-region>
        <label for="name" data-tauri-drag-region>Full Name</label>
        <input
          class="form-control mt-1 bg-black"
          type="text"
          name="name"
          placeholder="Please enter your full name"
          id="name"
          required
          bind:value={userData.name}
          on:input={validateName}
          style="border:{validationErrors.name
            ? '3px'
            : '1px'} solid {isNameValid
            ? '#8DC599'
            : validationErrors.name
            ? '#E5ACB2'
            : isNameTouched
            ? '#E5ACB2'
            : '#45494D'}"
        />
        <div>
          {#if validationErrors.name}
            <small class="text-danger form-text">{validationErrors.name}</small>
          {/if}
        </div>
      </div>

      <div class="form-group mt-3" data-tauri-drag-region>
        <label for="password" data-tauri-drag-region>Password</label>
        <input
          class="form-control bg-black"
          type="password"
          name="password"
          id="password"
          placeholder="Please enter your password"
          required
          bind:value={userData.password}
          on:input={validatePassword}
          style="border:{validationErrors.password
            ? '3px'
            : '1px'} solid {isPasswordValid1 &&
          isPasswordValid2 &&
          isPasswordValid3
            ? '#8DC599'
            : validationErrors.password
            ? '#E5ACB2'
            : isPasswordTouched
            ? '#E5ACB2'
            : '#45494D'}"
        />
      </div>

      <div class="validation-button">
        <div>
          <img
            src={isPasswordValid1
              ? vector2
              : isPasswordTouched
              ? vector3
              : vector1}
            alt=""
          />

          <button
            style="color: {isPasswordValid1
              ? '#8DC599'
              : isPasswordTouched
              ? '#E5ACB2'
              : '#45494D'}"
            disabled={!isValid}
          >
            Min 8 characters
          </button>
        </div>
        <div>
          <img
            src={isPasswordValid2
              ? vector2
              : isPasswordTouched
              ? vector3
              : vector1}
            alt=""
          />
          <button
            style="color: {isPasswordValid2
              ? '#8DC599'
              : isPasswordTouched
              ? '#E5ACB2'
              : '#45494D'}"
            disabled={!isValid}
          >
            Has at least one number
          </button>
        </div>
        <div>
          <img
            src={isPasswordValid3
              ? vector2
              : isPasswordTouched
              ? vector3
              : vector1}
            alt=""
          />
          <button
            style="color: {isPasswordValid3
              ? '#8DC599'
              : isPasswordTouched
              ? '#E5ACB2'
              : '#45494D'}"
            disabled={!isValid}
          >
            Has at least one special character
          </button>
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
            href="#"
            class="text-decoration-none"
            style="color: #007BFF;">Terms of Service</a
          ></label
        >
      </div>
      {#if validationErrors.tnsCheckbox}
        <small class="text-danger form-text"
          >{validationErrors.tnsCheckbox}</small
        >
      {/if}

      <div class="mb-3 mt-4">
        <button class="btn btn-gradient w-100">Sign Up</button>
      </div>

      <div class="d-flex flex-column align-items-center justify-content-center">
        <p>or continue with</p>
        <div class="gap-2">
          <!-- <button
                  class="w-8 rounded"
                  on:click={() => handleSignInWithProvider("GitHub")}
                >
                  <i class="fab fa-github" />
                </button> -->
          <button
            class="w-2 card rounded-md bg-light-black d-flex align-items-center justify-content-center"
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

        <p class="fs-6 gap-2 mt-4">
          Already have an account? <a
            href="/login"
            style="color: #007BFF;"
            class=" text-decoration-none">Sign In</a
          >
        </p>
      </div>
    </form>
  </div>
</div>

<style>
  /* Add your custom styles here */
  h2.card-subtitle {
    font-size: 24px; /* Adjust the font size as needed */
    color: white;
    margin-top: 15px;
    margin-bottom: 5px;
  }

  h1.card-title {
    font-size: 40px; /* Adjust the font size as needed */
    color: white;
    margin-left: 30px;
    margin-top: 50px;
  }
  .form-group {
    width: Fill (360px);
    height: Hug (61px);
    gap: 1px;
  }

  .card-body {
    height: 749px;
    display: flex;
    flex-direction: column;
    background: #000000;
    max-width: 500px;
    overflow: hidden;
    border-radius: 14px;
  }

  .login-form {
    width: Fixed (408px);
    height: Hug (400px);
    border-radius: 8px;
    gap: 2px;
    padding: 0px 40px;
  }

  .validation-button {
    width: Fill (408px);
    height: Hug (62px);
    gap: 4px;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
  }

  .validation-button > div {
    width: Fill (408px);
    height: Hug (18px);
    border-radius: 4px;
    gap: 4px;
  }

  .validation-button > div > button {
    border: none;
    font-size: 12px;
    background: #000000;
    color: #45494d;
  }

  .btn-gradient {
    background-image: linear-gradient(to right, hwb(211 0% 0%), #4930eec1);
    color: white;
  }

  .googleLogo {
    width: 23px;
    height: 23px;
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
      margin-top: 10px;
      align-items: center;
      justify-content: flex-start;
    }

    h1.card-title {
      margin-top: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }
</style>
