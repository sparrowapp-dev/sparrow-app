<script lang="ts">
  //   import { navigate } from "svelte-navigator";
  //   import { authActions } from "$lib/store/auth.store";
  import Header from "$lib/components/header/Header.svelte";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import { navigate } from "svelte-navigator";

  //------------------------------ TOKEN -----------------------------------//
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const token = urlParams.get("t");
  //   if (token) {
  //     authActions.setUser({ token });
  //     navigate("/reset/password");
  //   }

  let isEmailTouched = false;

  // Function to validate the email
  let isEmailValid = false;
  const validateEmail = () => {
    const emailRegex = /^[\w-]+@([\w-]+\.)+[\w-]{2,6}$/;
    isEmailTouched = true;
    // isEmailValid = emailRegex.test(loginCredentials.email);
    if (isEmailValid) {
      //   validationErrors.email = "";
    } else if (isEmailTouched) {
      // Show an error only if the field has been touched and the email is not valid
      // validationErrors.email = "";
    }
  };

  //this is for testing
  const handleRequest = () => {
    navigate("/update/password");
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
      class="login-form text-whiteColor ps-1 pe-1 gap-16"
      style="width:408px; height:214px"
      on:submit|preventDefault={async () => {
        // validationErrors = await handleLoginValidation(loginCredentials);
      }}
    >
      <div class="d-flex flex-column align-items-left mb-2">
        <div class="d-flex align-items-left mb-3 gap-3">
          <a href="/"><img src={angleLeft} alt="" /></a>
          <h6 class="text-whiteColor fs-5">Change Password</h6>
        </div>
        <p class="text-lightGray">
          Please enter your Email ID so that we can send you a confirmation link
          to process your request.
        </p>
      </div>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label text-lightGray"
          >Email</label
        >
        <input
          type="email"
          class="form-control bg-black"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Please enter your registered email id"
          on:input={validateEmail}
        />
      </div>
      <div class="sendButton">
        <button
          class="btn btn-primaryColor text-whiteColor w-100"
          on:click={handleRequest}>Send Request</button
        >
      </div>
    </form>
  </div>
</div>
