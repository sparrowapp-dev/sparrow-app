<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import vector1 from "$lib/assets/Vector1.svg";
  import vector2 from "$lib/assets/Vector2.svg";
  import vector3 from "$lib/assets/Vector3.svg";

  import { navigate } from "svelte-navigator";
  //   import { handleRegisterValidation } from "./register-page";

  let userData = {
    email: "",
    name: "",
    password: "",
    tnsCheckbox: false,
  };

  let validationErrors: any = {};

  // Here I am handling state variables;
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

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 100vh;"
  data-tauri-drag-region
>
  <Header />
  <div
    class="d-flex mb-5 flex-column align-items-center justify-content-center"
    data-tauri-drag-region
  >
    <h1
      class="text-whiteColor mt-5 ms-2 me-2 mb-5"
      style="font-size: 40px; width:408px; height:48px;"
    >
      Welcome to Sparrow!
    </h1>

    <form
      class="register-form text-whiteColor ps-1 pe-1 gap-16"
      style="width:408px; height:429px"
      novalidate
      on:submit|preventDefault={async () => {
        // validationErrors = await handleRegisterValidation(userData);
      }}
      data-tauri-drag-region
    >
      <h2 class="card-subtitle fs-4 mb-3">Reset Password & Sign In</h2>

      <div class="text-lightGray gap-0 line-height-1">
        <p>Md kashif raza</p>
        <p>kashif.raza@techdome.net.in</p>
      </div>

      <div class="form-group mb-1 text-lightGray" data-tauri-drag-region>
        <label for="password" data-tauri-drag-region>New Password</label>
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
          placeholder="Please enter new your password"
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

      <div class="mb-5 mt-4">
        <button
          class="btn btn-primary w-100 text-whiteColor border-0"
          on:click={handleLogin}>Sign In</button
        >
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
