<!-- <script lang="ts">
  import vector1 from "@deprecate/assets/Vector1.svg";
  import vector2 from "@deprecate/assets/Vector2.svg";
  import vector3 from "@deprecate/assets/Vector3.svg";
  import { handleRegisterValidation } from "./register-page";
  import { isLoading } from "@app/store/auth.store/auth.store";
  import starIcon from "@deprecate/assets/starIcon.svg";
  import eyeHide from "@deprecate/assets/eye-hide.svg";
  import eyeShow from "@deprecate/assets/eye-show.svg";
  import { Link } from "svelte-navigator";
  import { Loader } from "@sparrow/library/ui";

  let userData = {
    email: "",
    name: "",
    password: "",
    tnsCheckbox: false,
  };

  let validationErrors: any = {};

  let isPasswordValid1 = false;
  let isPasswordValid2 = false;
  let isPasswordValid3 = false;

  let isCheckboxTouched = false;

  let isEmailTouched = false;
  let isNameTouched = false;
  let isPasswordTouched = false;

  let isEmailValid = false;
  const validateEmail = () => {
    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    isEmailTouched = true;
    isEmailValid = emailRegex.test(userData.email);
    if (isEmailValid) {
      validationErrors.email = "";
    } else if (isEmailTouched) {
      validationErrors.email = "";
    }
  };

  let isNameValid = false;
  const validateName = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    let isNameTouched = true;
    isNameValid = nameRegex.test(userData.name);

    if (isNameValid && isNameTouched) {
      validationErrors.name = "";
    } else {
      validationErrors.name =
        "Your first name cannot have numbers or special characters.";
    }
  };

  let isValidPassword = false;

  const validatePassword = () => {
    const password = userData.password;

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
    if (!ischeckBoxValid) {
      validationErrors.tnsCheckbox = "";
    } else if (isCheckboxTouched) {
    }
  };

  let isLoadingPage: boolean;
  isLoading.subscribe((value) => {
    isLoadingPage = value;
  });

  let isPasswordVisible = false;

  const togglePasswordVisibility = () => {
    isPasswordVisible = !isPasswordVisible;
    const passwordInput = document.getElementById("expamplePassword");
    if (passwordInput) {
      passwordInput.type = isPasswordVisible ? "text" : "password";
    }
  };
</script> -->

<!-- <div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 100vh;"
> -->
<!-- <Header /> -->
<!-- {#if isLoadingPage}
    <Loader loaderSize={"80px"} loaderMessage="Please Wait..." />
  {:else}
    <div
      class="d-flex mb-5 flex-column align-items-center justify-content-center"
    >
      <p
        class="text-whiteColor mt-5 ms-2 me-2 mb-4"
        style="font-size: 40px; width:408px; height:48px;font-weight:500;"
      >
        Welcome to Sparrow!
      </p>

      <form
        class="register-form text-whiteColor ps-1 pe-1 gap-16"
        style="width:408px;"
        novalidate
        on:submit|preventDefault={async () => {
          validationErrors = await handleRegisterValidation(userData);
        }}
      >
        <p class="card-subtitle fs-4 mb-3">Create Account</p>
        <div class="form-group gap-0 mb-3">
          <div>
            <label for="email" class="form-label">Email</label>
            <img src={starIcon} alt="" class="mb-3" style="width: 7px;" />
          </div>
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
        <div class="form-group mb-3">
          <div>
            <label for="name">Full Name</label>
            <img src={starIcon} alt="" class="mb-3" style="width: 7px;" />
          </div>

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

        <div class="form-group">
          <div>
            <label for="password" id="password">Password</label>
            <img src={starIcon} alt="" class="mb-3" style="width: 7px;" />
          </div>
          <div class="d-flex">
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
              id="expamplePassword"
              placeholder="Please enter your password"
              required
              bind:value={userData.password}
              on:input={validatePassword}
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
                  style="text:{!isPasswordValid3 ? 'red' : 'red'}"
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
            on:input={validateCheckbox}
          />
          <label
            data-tauri-drag-region
            class="form-check-label ms-2"
            for="tnsCheckbox"
            >I agree to the <a
              href="https://sparrowapp.dev/terms-of-service"
              class="text-decoration-none text-primaryColor">Terms of Service</a
            ></label
          >
        </div>
        {#if validationErrors.tnsCheckbox}
          <small class="text-dangerColor form-text"
            >{validationErrors.tnsCheckbox}</small
          >
        {/if}

        <div class="mb-3 mt-4">
          <button class="btn btn-primary w-100 text-whiteColor border-0"
            >Sign Up</button
          >
        </div>

        <div
          class="d-flex flex-column align-items-center justify-content-center"
        >
          <div class="gap-3 d-flex align-items-center justify-content-center">
            <p class="fs-6 mb-0">Already have an account?</p>
            <Link to="/login" class=" text-decoration-none text-primaryColor"
              >Sign In</Link
            >
          </div>
        </div>
      </form>
    </div>
  {/if}
</div> -->

<!-- <style>
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }

  .btn-primary {
    background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
  }

  .eye-icon > img {
    position: absolute;
    transform: translateX(-4vmax);
  }

  @media (min-width: 1000px) {
    .eye-icon > img {
      position: absolute;
      transform: translateX(-2vmax);
    }
    .register-form {
      width: 488px;
      margin: 0px auto;
      padding: 0px;
      border-radius: 8px;
      gap: 16px;
      height: auto; /* Remove fixed height for larger screens */
    }
  }
</style> -->
