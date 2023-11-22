<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import starIcon from "$lib/assets/starIcon.svg";

  import { handleForgotPasswordValidation } from "./forgot-password";
  import { isLoading, username } from "$lib/store/auth.store";
  import PageLoader from "$lib/components/Transition/PageLoader.svelte";

  let validationErrors: any = {};

  let forgotPasswordCredential = {
    email: "",
  };

  let isEmailTouched = false;

  let isEmailValid = false;
  const validateEmail = () => {
    username.set(forgotPasswordCredential.email);
    isEmailTouched = true;
    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    isEmailValid = emailRegex.test(forgotPasswordCredential.email);
    if (isEmailValid) {
      validationErrors.email = "";
    } else if (isEmailTouched) {
      validationErrors.email = "";
    }

    if (forgotPasswordCredential.email === "") {
      validationErrors.email =
        "Email cannot be empty. Please provide your registered email ID.";
    }
  };

  let isLoadingPage: boolean;
  isLoading.subscribe((value) => {
    isLoadingPage = value;
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
    <div
      class="d-flex mb-5 flex-column align-items-center justify-content-center"
    >
      <p
        class="text-whiteColor mt-5 ms-2 me-2 mb-5"
        style="font-size: 40px; width:408px; height:48px;font-weight:500;"
      >
        Welcome to Sparrow!
      </p>

      <form
        class="login-form text-whiteColor ps-1 pe-1 gap-16"
        style="width:408px; height:214px"
        on:submit|preventDefault={async () => {
          validationErrors = await handleForgotPasswordValidation(
            forgotPasswordCredential,
          );
        }}
      >
        <div
          class="d-flex flex-column align-items-left justify-content-center mb-2"
        >
          <div
            class="d-flex align-items-center justify-content-start mb-3 gap-3"
          >
            <a href="/"><img src={angleLeft} alt="" class="mb-0" /></a>
            <p class="text-whiteColor fs-5 mb-0">Change Password</p>
          </div>
          <p class="text-lightGray">
            Please enter your Email ID so that we can send you a verification
            code to process your request.
          </p>
        </div>
        <div class="mb-3">
          <label for="exampleInputEmail1" class="form-label text-red"
            >Email</label
          >
          <img src={starIcon} alt="" class="mb-3" />
          <input
            type="email"
            class="form-control bg-black border:{validationErrors.email
              ? '3px'
              : '1px'} solid {validationErrors.email
              ? 'border-error'
              : 'border-default'}"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            required
            placeholder="Please enter your registered email id"
            bind:value={forgotPasswordCredential.email}
            on:input={validateEmail}
          />
          {#if validationErrors.email}
            <small class="form-text text-dangerColor">
              {validationErrors.email}</small
            >
          {/if}
        </div>
        <div class="sendButton">
          <button class="btn btn-primaryColor text-whiteColor w-100"
            >Send Request</button
          >
        </div>
      </form>
    </div>
  {/if}
</div>
