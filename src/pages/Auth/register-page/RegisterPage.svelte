<script lang="ts">
  import authService from "$lib/services/auth.service";
  import { notifications } from "$lib/utils/notifications";
  import { navigate } from "svelte-navigator";
  import { checkValidation, registrationSchema } from "$lib/utils/validation";

  const goBack = () => {
    navigate(-1);
  };

  let userData = {
    email: "",
    username: "",
    fullName: "",
    password: "",
    teamName: "",
    tnsCheckbox: false,
  };

  let validationErrors: any = {};

  const handleFormSubmit = async () => {
    const { isError, errorObject } = await checkValidation(
      registrationSchema,
      userData,
    );
    if (isError) {
      validationErrors = errorObject;
      return;
    }else{
      validationErrors = {}
    }

    try {
        await authService.registerUser({
        email: userData.email,
        name: userData.fullName,
        username: userData.username,
        password: userData.password,
      });
      notifications.success("Registration successful!");
      navigate("/");
    } catch (error) {
      console.log(error);
      notifications.error(error);
    }
  };
</script>

<div
  class="d-flex flex-column p-5 justify-content-center align-items-center vh-100 m-auto"
  style="max-width: 650px;"
>
  <h1>Create Account</h1>
  <p>Create an account to get started.</p>

  <form
    class="form mt-4"
    novalidate
    on:submit|preventDefault={handleFormSubmit}
  >
    <div class="form-group">
      <label for="email">Email</label>
      <input
        class="form-control mt-1"
        type="email"
        name="email"
        id="email"
        required
        bind:value={userData.email}
      />
      {#if validationErrors.email}
        <small class="text-danger form-text">{validationErrors.email}</small>
      {/if}
    </div>
    <div class="form-group mt-3">
      <label for="username">Username</label>
      <input
        class="form-control mt-1"
        type="text"
        name="username"
        id="username"
        required
        bind:value={userData.username}
      />
    </div>
    {#if validationErrors.username}
      <small class="text-danger form-text">{validationErrors.username}</small>
    {/if}
    <div class="form-group mt-3">
      <label for="fullName">Full Name</label>
      <input
        class="form-control mt-1"
        type="text"
        name="fullName"
        id="fullName"
        required
        bind:value={userData.fullName}
      />
    </div>
    {#if validationErrors.fullName}
      <small class="text-danger form-text">{validationErrors.fullName}</small>
    {/if}
    <div class="form-group mt-3">
      <label for="password">Password</label>
      <input
        class="form-control mt-1"
        type="password"
        name="password"
        id="password"
        required
        bind:value={userData.password}
      />
    </div>
    {#if validationErrors.password}
      <small class="text-danger form-text">{validationErrors.password}</small>
    {/if}
    <div class="form-group mt-3">
      <label for="teamName">Team or Organization Name</label>
      <input
        class="form-control mt-1"
        type="text"
        name="teamName"
        id="teamName"
        disabled
      />
      <small class="text-muted form-text"
        >Team name should be all small case and should not contain special
        characters and spaces. (disabled currently / coming soon)</small
      >
    </div>
    <div class="form-group mt-4">
      <input
        type="checkbox"
        class="form-check-input"
        id="tnsCheckbox"
        bind:checked={userData.tnsCheckbox}
      />
      <label class="form-check-label ms-2" for="tnsCheckbox"
        >I agree to the <a href="#">Terms and Conditions</a></label
      >
    </div>

    <button type="submit" class="btn btn-primary mt-4 w-100"
      >Create Free Account</button
    >
  </form>
  <button class="btn btn-link mt-4 w-100" on:click={goBack}>Go Back</button>
</div>
