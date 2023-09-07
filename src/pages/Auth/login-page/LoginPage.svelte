<script lang="ts">
  import "./login-page.scss";
  import { navigate } from "svelte-navigator";
  import authService from "$lib/services/auth.service";
  import { notifications } from "$lib/utils/notifications";
  import { checkValidation, loginSchema } from "$lib/utils/validation";
  import { authActions, authStore } from "$lib/store/auth.store";

  //------------------------------ TOKEN -----------------------------------//
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("t");
  if (token) {
    localStorage.setItem("AUTH_TOKEN", token);
    authActions.setUser({ token });
    navigate("/");
    console.log(token);
  }

  //------------------------------Navigation-------------------------------//
  const navigateToRegister = () => {
    navigate("/register");
  };

  const goBack = () => {
    loginState = false;
  };

  const authNavigate = () => {
    navigate("http://localhost:9000/api/auth/google");
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
    <form class="login-form" on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="exampleInputEmail1">Email address</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Enter email"
          bind:value={loginCredentials.email}
        />
      </div>
      {#if validationErrors.email}
        <small class="text-danger form-text">{validationErrors.email}</small>
      {/if}

      <div class="form-group">
        <label for="exampleInputPassword1">Password</label>
        <input
          type="password"
          class="form-control"
          id="exampleInputPassword1"
          placeholder="Password"
          bind:value={loginCredentials.password}
        />
      </div>
      {#if validationErrors.password}
        <small class="text-danger form-text">{validationErrors.password}</small>
      {/if}

      <div class="form-group">
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
      <div class="form-group">
        <button
          class="btn btn-primary googleBt"
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
