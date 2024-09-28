<script lang="ts">
  import vector1 from "$lib/assets/Vector1.svg";
  import vector2 from "$lib/assets/Vector2.svg";
  // import sparrowicon from "$lib/assets/sparrowIcon.svg";
  import vector3 from "$lib/assets/Vector3.svg";
  import starIcon from "$lib/assets/starIcon.svg";
  import { handleResetPasswordValidation } from "./reset-password";
  import { username } from "$lib/store/auth.store";

  import angleLeft from "$lib/assets/angleLeft.svg";
  import eyeHide from "$lib/assets/eye-hide.svg";
  import eyeShow from "$lib/assets/eye-show.svg";
  import {Loader} from "@sparrow/library/ui";

  let passwordText: string = "";

  let resetPasswordCredential = {
    email: "",
    newPassword: "",
  };

  username.subscribe((value) => {
    if (value) {
      resetPasswordCredential.email = value;
    }
  });

  let validationErrors: any = {};

  let isPasswordValid1 = false;
  let isPasswordValid2 = false;
  let isPasswordValid3 = false;
  let isPasswordTouched = false;
  let isValidPassword = false;

  const validatePassword = () => {
    resetPasswordCredential.newPassword = passwordText;

    const password = resetPasswordCredential.newPassword;

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
  let showModal = false;
  let isLoading = false;

  let errorMessage: string = "";
  const handleSubmit = async () => {
    isLoading = true;
    try {
      validationErrors = await handleResetPasswordValidation(
        resetPasswordCredential,
      );
      errorMessage = "Please enter new password";

      if (Object.keys(validationErrors).length === 0) {
        showModal = true;
      }
    } finally {
      isLoading = false;
    }
  };

  let isPasswordVisible = false;

  const togglePasswordVisibility = () => {
    isPasswordVisible = !isPasswordVisible;
    const passwordInput = document.getElementById("newpassword");
    if (passwordInput) {
      passwordInput.type = isPasswordVisible ? "text" : "password";
    }
  };
</script>

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 100vh;"
>
  <!-- <Header /> -->
  <div
    class="d-flex mb-5 flex-column align-items-center justify-content-center"
  >
    <p
      class="text-whiteColor mt-5 ms-2 me-2 mb-4"
      style="font-size: 40px; width:408px; height:48px;font-weight:500"
    >
      Welcome to Sparrow!
    </p>

    {#if isLoading}
      <Loader loaderSize={"80px"} loaderMessage="Please Wait..." />
    {:else}
      <form
        class="register-form text-whiteColor ps-1 pe-1 gap-16"
        style="width:408px; height:429px"
        novalidate
        on:submit|preventDefault={handleSubmit}
      >
        <div class="d-flex align-items-center gap-2 mb-2">
          <a href="/update/password"><img src={angleLeft} alt="" /></a>
          <p class="card-subtitle fs-5">Reset Password & Sign In</p>
        </div>

        <div class="text-lightGray gap-0 line-height-1">
          <p>{resetPasswordCredential.email}</p>
        </div>

        <div class="form-group mb-1 text-lightGray">
          <div>
            <label for="password">New Password</label>
            <img src={starIcon} alt="" class="mb-3" style="width: 7px;" />
          </div>
          <div class="d-flex">
            <input
              class="form-control mt-1 bg-black border:{validationErrors.newPassword
                ? '3px'
                : '1px'} solid {isPasswordValid1 &&
              isPasswordValid2 &&
              isPasswordValid3
                ? 'border-success'
                : validationErrors.newPassword
                ? 'border-error'
                : isPasswordTouched
                ? 'border-error'
                : 'border-default'} eye-icon"
              type="password"
              name="password"
              id="newpassword"
              placeholder="Please enter your new password"
              required
              bind:value={passwordText}
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
          {#if validationErrors.newpassword && passwordText.length === 0}
            <small class="text-dangerColor form-text"
              >{validationErrors.newPassword}</small
            >
          {:else if passwordText.length === 0}
            <small class="form-text text-dangerColor"> {errorMessage}</small>
          {/if}
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
          <button class="btn btn-primary w-100 text-whiteColor border-0"
            >Sign In</button
          >
        </div>
      </form>
    {/if}
    <!-- {#if showModal}
      <div
        class="modal fade show d-flex align-items-center"
        tabindex="-1"
        role="dialog"
        style="display: block;"
        aria-modal="true"
      >
        <div class="modal-dialog" role="document" style="margin: auto;">
          <div class="modal-content">
            <div
              class="modal-header d-flex flex-column align-items-center justify-content-center"
            >
              <div
                class="d-flex flex-column align-items-center justify-content-center"
              >
                <img src={sparrowicon} alt="" />
                <h5 class="modal-title fw-bold">Welcome back Kashif!</h5>
              </div>
            </div>
            <div class="modal-body">
              <p style="font: 300;font-size:14px;">
                Easily document and manage APIs for seamless collaboration
                between frontend and backend teams. Get started now to simplify
                your development workflows.
              </p>
              <div>
                <Welcome />
              </div>
            </div>
            <div
              class="modal-footer d-flex align-items-center justify-content-center"
            >
              <button
                type="button"
                class="btn btn-primary"
                on:click={() => (showModal = false)}>Continue</button
              >
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" />
    {/if} -->
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

    .register-form {
      width: 488px;
      margin: 0px auto;
      padding: 0px;
      border-radius: 8px;
      gap: 16px;
      height: auto;
    }
  }
</style>
