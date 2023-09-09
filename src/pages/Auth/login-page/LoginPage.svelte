<script lang="ts">
  import { navigate } from "svelte-navigator";
  import authService from "$lib/services/auth.service";
  import { notifications } from "$lib/utils/notifications";
  import { checkValidation, loginSchema } from "$lib/utils/validation";
  import { authActions } from "$lib/store/auth.store";
  import constants from "$lib/utils/constants";

  //------------------------------ TOKEN -----------------------------------//
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("t");
  if (token) {
    authActions.setUser({ token });
    navigate("/");
  }

  //------------------------------Navigation-------------------------------//
  const navigateToRegister = () => {
    navigate("/register");
  };

  const goBack = () => {
    loginState = false;
  };

  const authNavigate = () => {
    navigate(`${constants.API_URL}/api/auth/google`);
  };

  //------------------------------ Login State --------------------------//
  let loginState = false;
  const enableLogin = () => {
    loginState = true;
  };

  //------------ login Credentails ---------------//
  let loginCredentials = {
    email: "",
    password: "",
  };

  let validationErrors: any = {};

  const handleSubmit = async () => {
    const { isError, errorObject } = await checkValidation(
      loginSchema,
      loginCredentials,
    );
    if (isError) {
      validationErrors = errorObject;
      return;
    } else {
      validationErrors = {};
    }
    try {
      await authService.loginUser(loginCredentials);
      notifications.success("Login successful!");
      navigate("/");
    } catch (error) {
      notifications.error("Something went wrong");
    }
  };
</script>

<div
  class="d-flex flex-column p-5 justify-content-center align-items-center vh-100 m-auto"
  style="max-width: 650px;"
>
  <h1>Welcome to Sparrow App</h1>

  <h2>Create an account or Sign In</h2>

  {#if loginState}
    <form class="login-form w-100" on:submit|preventDefault={handleSubmit}>
      <div class="form-group mt-2">
        <label for="exampleInputEmail1">Email address</label>
        <input
          type="email"
          class="form-control mt-1"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Enter email"
          bind:value={loginCredentials.email}
        />
      </div>
      {#if validationErrors.email}
        <small class="text-danger form-text">{validationErrors.email}</small>
      {/if}

      <div class="form-group mt-2">
        <label for="exampleInputPassword1">Password</label>
        <input
          type="password"
          class="form-control m-1"
          id="exampleInputPassword1"
          placeholder="Password"
          bind:value={loginCredentials.password}
        />
      </div>
      {#if validationErrors.password}
        <small class="text-danger form-text">{validationErrors.password}</small>
      {/if}

      <div class="form-group mt-4">
        <button type="submit" class="btn btn-primary w-100">Login</button>
      </div>
      <div class="form-group mt-2">
        <button
          class="btn googleBt w-100 bg-white text-dark"
          on:click|preventDefault={authNavigate}>Login with google</button
        >
      </div>
    </form>
    <button class="btn btn-link mt-4 w-100" on:click={goBack}>Go Back</button>
  {:else}
    <input
      type="button"
      class="btn btn-primary w-100 mt-5"
      on:click|preventDefault={navigateToRegister}
      value="Create Free Account"
    />
    <input
      type="button"
      class="btn btn-primary mt-2 w-100"
      value="Sign In"
      on:click={enableLogin}
    />
  {/if}
</div>
