<script lang="ts">
  //   import { navigate } from "svelte-navigator";
  //   import { authActions } from "$lib/store/auth.store";
  import Header from "$lib/components/header/Header.svelte";
  import angleLeft from "$lib/assets/angleleft.png";

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
          To ensure that this is really you, we have sent a confirmation link to
          your email
          <span class="email-address">raman.rayaprolu@techdome.net.in</span>.
        </p>

        <p class="paragraph1">
          We sent another confirmation link to your email .
          <span class="email-address">raman.rayaprolu@techdome.net.in</span>.
        </p>

        <p class="paragraph2">
          The confirmation link will expire in <b
            style="font-weight: bold; color: #FFFFFF;"
          >
            24 hours
          </b>
        </p>
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
      height: Hug (168px);
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
      gap: 16px;
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
    .paragraph2 {
      width: 408px;
      height: 21px;

      font-family: Roboto;
      font-size: 14px;
      font-weight: 700;
      line-height: 21px;
      letter-spacing: 0em;
      text-align: left;
      margin-bottom: 20px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      letter-spacing: 0em;
      text-align: left;

      color: #cccccc;
    }

    .email-address {
      /* Styles for the email address */
      font-weight: bold;
      color: #ffffff; /* You can change the color to your desired value */
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
