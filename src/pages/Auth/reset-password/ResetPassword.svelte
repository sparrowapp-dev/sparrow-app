<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import vector1 from "$lib/assets/Vector1.png";
  import vector2 from "$lib/assets/Vector2.png";
  import vector3 from "$lib/assets/Vector3.png";

  import { navigate } from "svelte-navigator";
  //   import { handleRegisterValidation } from "./register-page";

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

  let isPasswordTouched = false;

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

  const handleLogin = () => {
    navigate("/login");
  };
</script>

<div class="card-body" data-tauri-drag-region>
  <Header />
  <div class="formControl">
    <div class="formContainer">
      <h1 class="card-title mb-4" data-tauri-drag-region>
        Welcome to Sparrow!
      </h1>
      <form
        class="login-form"
        novalidate
        on:submit|preventDefault={async () => {
          // validationErrors = await handleRegisterValidation(userData);
        }}
        data-tauri-drag-region
      >
        <h2 class="card-subtitle">Reset Password & Sign In</h2>

        <div class="userInfo">
          <h6>Md Kashif Raza</h6>
          <h6>kashif.raza@techdome.net.in</h6>
        </div>
        <div class="form-group mt-1" data-tauri-drag-region>
          <label for="password" data-tauri-drag-region>New Password</label>
          <input
            class="form-control bg-black mt-1"
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

        <div class="mb-3 mt-4">
          <button class="btn btn-gradient w-100" on:click={handleLogin}
            >Sign In</button
          >
        </div>
      </form>
    </div>
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
    margin-top: 20px;
  }
  .form-group {
    width: Fill (360px);
    height: Hug (61px);
    gap: 1px;
  }

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

    .validation-button {
      width: Fill (408px);
      height: Hug (62px);
      gap: 4px;
    }

    .validation-button > div {
      width: Fill (408px);
      height: Hug (18px);
      border-radius: 4px;
      gap: 4px;
    }

    .validation-button > div > button {
      width: 388px;
      height: 18px;
      color: #45494d;
      font-family: Roboto;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0em;
      text-align: left;
    }

    .login-form {
      width: Fixed (408px);
      height: Hug (290px);
      border-radius: 8px;
      gap: 16px;
    }

    .form-group {
      width: Fill (408px);
      height: Hug (61px);
      gap: 4px;
    }

    h2.card-subtitle {
      width: 408px;
      height: 29px;

      font-family: Roboto;
      font-size: 24px;
      font-weight: 500;
      line-height: 29px;
      letter-spacing: 0em;
      text-align: left;
      color: #ffffff;

      font-variation-settings: "slnt" 0;
    }

    h1.card-title {
      width: 408px;
      height: 48px;
      margin-top: 50px;
      font-family: Roboto;
      font-size: 40px;
      font-weight: 500;
      line-height: 48px;
      letter-spacing: 0em;
      text-align: center;
      font-variation-settings: "slnt" 0;
    }

    .userInfo {
      width: Fill (408px);
      margin-top: 20px;
      margin-bottom: 20px;
      height: Hug (42px);
    }

    .userInfo > h6 {
      width: 110px;
      height: 21px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      letter-spacing: 0em;
      text-align: left;
      color: #cccccc;
    }
  }
</style>
