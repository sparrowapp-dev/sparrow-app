<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import angleLeft from "$lib/assets/angleLeft.svg";
  import lineIcon from "$lib/assets/line.svg";
  import starIcon from "$lib/assets/starIcon.svg";
  import { errorMessageText, isLoading, username } from "$lib/store/auth.store";
  import { handleVerifyEmail, isSuccessfulResponse } from "./update-password";

  import { writable } from "svelte/store";
  import { onDestroy } from "svelte";
  import { navigate } from "svelte-navigator";
  import PageLoader from "$lib/components/Transition/PageLoader.svelte";

  const seconds = writable(59);
  const verifyString = writable("");
  let verifyLength: string = "";

  const timerInterval = setInterval(() => {
    $seconds--;
    if ($seconds === 0) clearInterval(timerInterval);
  }, 1000);

  onDestroy(() => clearInterval(timerInterval));

  let verifyCodeCredential = {
    email: "",
    verificationCode: "",
  };

  let verifyCode: string = "";

  let validationErrors;

  let verificationCode1: string = "";
  let verificationCode2: string = "";
  let verificationCode3: string = "";
  let verificationCode4: string = "";
  let verificationCode5: string = "";
  let verificationCode6: string = "";

  let emailText: string = "";
  username.subscribe((value) => {
    if(value){
      emailText = value;
      verifyCodeCredential.email = emailText;
    }
  });

  const handleVerificationCode = () => {
    verifyCode =
      verificationCode1 +
      verificationCode2 +
      verificationCode3 +
      verificationCode4 +
      verificationCode5 +
      verificationCode6;
    verifyCodeCredential.verificationCode = verifyCode;

    verifyString.set(verifyCode);
  };

  verifyString.subscribe((value) => {
    if(value){
      verifyLength = value;
    }
  });

  let isLoadingPage: boolean;
  isLoading.subscribe((value) => {
    isLoadingPage = value;
  });

  let verificationCodeError: boolean;
  isSuccessfulResponse.subscribe((value) => {
      verificationCodeError = value;
  });

  let errorMessage: string = "";
  errorMessageText.subscribe((value) => {
    if(value){
      errorMessage = value;
    }
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
        style="font-size: 40px; width:408px; height:48px;font-weight:500"
      >
        Welcome to Sparrow!
      </p>

      <div
        class="login-form text-lightGray ps-1 pe-1 gap-16"
        style="width:408px; height:183px"
      >
        <div class="d-flex flex-column align-items-left mb-2">
          <div class="d-flex align-items-center mb-3 gap-3">
            <a href="/forgot/password"><img src={angleLeft} alt="" /></a>
            <p class="text-whiteColor fs-5 mb-0">Change Password</p>
          </div>

          <div style="font-size: 15px;">
            <p>
              To ensure that this is really you, we have sent a verification
              code to your email

              <span class="fw-bold text-whiteColor cursor-pointer"
                >{emailText}</span
              >
            </p>
            {#if $seconds > 0}
              <div class="d-flex flex-column bg-blackColor">
                <div class="d-flex align-items-center">
                  <p class="mb-1">Verification Code</p>
                  <img
                    src={starIcon}
                    alt=""
                    class="mb-2 ms-1"
                    style="width: 7px;"
                  />
                </div>
                <div
                  class="d-flex mb-2 align-items-center justify-content-start"
                  style="padding: 6px, 12px, 6px, 12px;border-radius: 4px;border: 1px;gap:8px"
                >
                  <input
                    type="text"
                    class="form-control bg-blackColor text-center rounded fs-5 border:{verificationCodeError ===
                    true
                      ? '3px'
                      : '1px'} solid {verificationCodeError === true
                      ? 'border-error'
                      : 'border-default'}"
                    style="width:48px;height:36px;border-none"
                    bind:value={verificationCode1}
                    on:input={() => {
                      if (verificationCode1.length === 1) {
                        document.getElementById("verificationCode2").focus();
                      } else if (verificationCode1.length > 1) {
                        verificationCode1 = verificationCode1.charAt(0);
                      }
                    }}
                  />
                  <img src={lineIcon} alt="" />
                  <input
                    type="text"
                    id="verificationCode2"
                    style="width:48px;height:36px;"
                    class="form-control bg-blackColor text-center rounded fs-5 border:{verificationCodeError ===
                    true
                      ? '3px'
                      : '1px'} solid {verificationCodeError === true
                      ? 'border-error'
                      : 'border-default'}"
                    bind:value={verificationCode2}
                    on:input={() => {
                      if (verificationCode2.length === 1) {
                        document.getElementById("verificationCode3").focus();
                      } else if (verificationCode2.length > 1) {
                        verificationCode2 = verificationCode2.charAt(0);
                      }
                    }}
                  />
                  <img src={lineIcon} alt="" />
                  <input
                    type="text"
                    id="verificationCode3"
                    style="width:48px;height:36px;"
                    class="form-control bg-blackColor text-center rounded fs-5 border:{verificationCodeError ===
                    true
                      ? '3px'
                      : '1px'} solid {verificationCodeError === true
                      ? 'border-error'
                      : 'border-default'}"
                    bind:value={verificationCode3}
                    on:input={() => {
                      if (verificationCode3.length === 1) {
                        document.getElementById("verificationCode4").focus();
                      } else if (verificationCode3.length > 1) {
                        verificationCode3 = verificationCode3.charAt(0);
                      }
                    }}
                  />
                  <img src={lineIcon} alt="" />
                  <input
                    type="text"
                    id="verificationCode4"
                    style="width:48px;height:36px;"
                    class="form-control bg-blackColor text-center rounded fs-5 border:{verificationCodeError ===
                    true
                      ? '3px'
                      : '1px'} solid {verificationCodeError === true
                      ? 'border-error'
                      : 'border-default'}"
                    bind:value={verificationCode4}
                    on:input={() => {
                      if (verificationCode4.length === 1) {
                        document.getElementById("verificationCode5").focus();
                      } else if (verificationCode4.length > 1) {
                        verificationCode4 = verificationCode4.charAt(0);
                      }
                    }}
                  />
                  <img src={lineIcon} alt="" />
                  <input
                    type="text"
                    id="verificationCode5"
                    style="width:48px;height:36px; "
                    class="form-control bg-blackColor text-center rounded fs-5 border:{verificationCodeError ===
                    true
                      ? '3px'
                      : '1px'} solid {verificationCodeError === true
                      ? 'border-error'
                      : 'border-default'}"
                    bind:value={verificationCode5}
                    on:input={() => {
                      if (verificationCode5.length === 1) {
                        document.getElementById("verificationCode6").focus();
                      } else if (verificationCode5.length > 1) {
                        verificationCode5 = verificationCode5.charAt(0);
                      }
                    }}
                  />
                  <img src={lineIcon} alt="" />
                  <input
                    type="text"
                    id="verificationCode6"
                    style="width:48px;height:36px;"
                    class="form-control bg-blackColor text-center rounded fs-5 border:{verificationCodeError ===
                    true
                      ? '3px'
                      : '1px'} solid {verificationCodeError === true
                      ? 'border-error'
                      : 'border-default'}"
                    bind:value={verificationCode6}
                    on:input={() => {
                      if (verificationCode6.length === 1) {
                        document.getElementById("verificationCode7").focus();
                      } else if (verificationCode6.length > 1) {
                        verificationCode6 = verificationCode6.charAt(0);
                      }
                    }}
                    on:input={handleVerificationCode}
                  />
                </div>
                {#if verificationCodeError === true}<small
                    class="form-text text-dangerColor"
                    >{errorMessage === "Unauthorized Access"
                      ? "You have entered wrong code, please check your email."
                      : errorMessage}</small
                  >
                {/if}
              </div>
            {/if}

            {#if $seconds > 0}
              <p>
                The verification code will expire in <span
                  class="fw-bold text-dangerColor">{$seconds} seconds</span
                >
              </p>
            {:else}
              <p class="fw-bold text-dangerColor">Verification code expired</p>
            {/if}
            {#if $seconds > 0}
              <p>
                If your email ID is registered with us then you would have
                received an email in your inbox with verification link
              </p>
            {:else}
              <p>Please try again to reset your password.</p>
            {/if}
          </div>
          {#if $seconds > 0}
            <button
              class="btn btn-primary bg-labelColor border-0 mb-2"
              on:click|preventDefault={async () => {
                validationErrors = await handleVerifyEmail(
                  verifyCodeCredential,
                );
              }}>Verify</button
            >
          {:else}
            <button
              class="btn btn-primary bg-labelColor border-0 mb-2"
              on:click|preventDefault={() => {
                navigate("/forgot/password");
              }}>Go Back</button
            >
          {/if}
        </div>

        {#if $seconds > 0}
          <div class="d-flex gap-3">
            <p style="font-size: 13px;">
              No email in your inbox or spam folder?
            </p>

            <a
              href="/forgot/password"
              style="font-size: 13px;"
              class="text-decoration-none text-primaryColor fw-bold"
              >Resend
            </a>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
