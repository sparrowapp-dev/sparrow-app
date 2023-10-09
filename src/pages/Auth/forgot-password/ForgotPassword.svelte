<script lang="ts">
  //   import { navigate } from "svelte-navigator";
  //   import { authActions } from "$lib/store/auth.store";
  import Header from "$lib/components/header/Header.svelte";
  import angleLeft from "$lib/assets/angleleft.png";
  import { navigate } from "svelte-navigator";

  //------------------------------ TOKEN -----------------------------------//
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const token = urlParams.get("t");
  //   if (token) {
  //     authActions.setUser({ token });
  //     navigate("/reset/password");
  //   }

  //---------------- Login Validation --------------------//
  //   let validationErrors: any = {};

  //   //------------ login Credentials ---------------//
  //   let loginCredentials = {
  //     email: "",
  //     password: "",
  //   };

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

  const handleRequest = () => {
    navigate("/update/password");
  };
</script>

<div class="card-body">
  <Header />
  <div class="formControl">
    <h1 class="card-title mb-4">Welcome to Sparrow!</h1>
    <div class="UpdateContainer">
      <div class="updatetop1">
        <div>
          <a href="/"><img src={angleLeft} alt="" /></a>
        </div>
        <h6>Change Password</h6>
      </div>
      <div class="updatetop2">
        <p class="paragraph1">
          Please enter your Email ID so that we can send you a confirmation link
          to process your request.
        </p>
        <form
          class="login-form"
          on:submit|preventDefault={async () => {
            // validationErrors = await handleLoginValidation(loginCredentials);
          }}
        >
          <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email</label>
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
            <button class="btn btn-gradient w-100" on:click={handleRequest}
              >Send Request</button
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  @media (min-width: 600px) {
    .card-body {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: black;
      margin: auto;
      padding-top: 10px;
      padding-bottom: 10px;
      max-width: 1500px;
      overflow: hidden;
    }

    .formControl {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 50px;
      width: Fill (408px);
    }

    .login-form {
      width: Fill (408px);
      height: Hug (61px);
      gap: 4px;
    }

    .sendButton {
      width: Fill (408px);
      height: Hug (36px);
      padding: 6px, 12px, 6px, 12px;
      border-radius: 4px;
      gap: 8px;
      margin-bottom: 10px;
      margin-top: 10px;
      background: #1193f0;
    }

    .btn-gradient {
      width: 384px;
      color: #ffffff;
      height: Hug (36px);
      font-size: 16px;
    }

    .formControl > h1 {
      width: 408px;
      height: 48px;
      font-family: Roboto;
      font-size: 40px;
      font-weight: 500;
      line-height: 48px;
      letter-spacing: 0em;
      text-align: left;
      font-variation-settings: "slnt" 0;
    }

    .UpdateContainer {
      width: Fixed (408px);
      height: Hug (214px);
      border-radius: 8px;
      gap: 16px;
      margin-top: 30px;
    }

    .updatetop1 {
      display: flex;
      width: Fill (408px);
      height: Hug (27px);
      display: flex;
      gap: 16px;
    }

    .updatetop1 > h6 {
      width: 376px;
      height: 27px;
      font-size: 18px;
      font-weight: 500;
      line-height: 27px;
      letter-spacing: 0em;
      margin-bottom: 20px;
      color: #ffffff;
      text-align: left;
      font-variation-settings: "slnt" 0;
    }

    .updatetop2 {
      display: flex;
      flex-direction: column;
      width: Fill (408px);
      height: Hug (125px);
      gap: 8px;
    }

    .paragraph1 {
      width: 408px;
      height: 42px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      letter-spacing: 0em;
      text-align: left;
      color: #cccccc;
    }

    h1.card-title {
      width: Fill (408px);
      height: Hug (27px);
      gap: 8px;
      font-size: 40px;
      color: #ffffff;
    }
  }
</style>
