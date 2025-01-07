<script>
  import { AdminHeader } from "src/components";
  import sparrowicon from "../../icons/sparrow-logo.svg";
  import EyeOpen from "../../icons/eye-icon-open.svg";

  let username = "";
  let password = "";
  let showPassword = false;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login submission
    console.log("Login attempted:", { username, password });
  };

  const togglePassword = () => {
    showPassword = !showPassword;
  };
</script>

<div class="background-container">
  <AdminHeader />

  <!-- Main Content -->
  <div class="main-content">
    <div class="logo-section d-flex" style="justify-content: center;">
      <img
        height="20px"
        width="20px"
        src={sparrowicon}
        alt=""
        style="margin-top: 5px;"
      />
      <p style="font-size: 20px; margin-left:5px;">Sparrow</p>
    </div>

    <div class="text-container">
      <p class="welcome-text">
        We are thrilled to know that you are self hosting. Security is always a
        key trait of Sparrow. We aim to bridge the gaps in the developer
        community without compromising security.
      </p>

      <p class="contact-text">
        If you have any questions, please reach our team at
        <a href="mailto:contact@admin@sparrow.dev" style="color: #3670F7;"
          >contact@admin@sparrow.dev</a
        >
      </p>
    </div>

    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="username"
          >Username or Email ID <span style="color: #EB5651;">*</span></label
        >
        <input
          type="text"
          id="username"
          bind:value={username}
          placeholder="Enter your associated username or email ID"
        />
      </div>

      <div class="form-group">
        <label for="password"
          >Password <span style="color: #EB5651;">*</span></label
        >
        <div class="password-input">
          <input
            type="password"
            id="password"
            bind:value={password}
            placeholder="Enter your password to access Sparrow Admin"
          />
          <button
            type="button"
            class="toggle-password"
            on:click={togglePassword}
          >
            <img
              src={showPassword ? EyeOpen : EyeOpen}
              alt="Toggle password visibility"
            />
          </button>
        </div>
      </div>

      <button type="submit" class="sign-in-button"> Sign in </button>
    </form>
  </div>
</div>

<style>
  .background-container {
    width: 100%;
    height: 100%;
    margin: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-image: url("../../icons/Sparrow-Admin.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .main-content {
    max-width: 400px;
    margin: 60px auto;
    text-align: left;
  }
  .text-container {
    background-color: #14181f;
    border-radius: 4px;
  }

  .logo-section {
    margin-bottom: 24px;
  }

  .welcome-text {
    color: #b6b7b9;
    font-size: 14px;
    line-height: 1.5;
    padding: 8px;
  }

  .contact-text {
    color: #b6b7b9;
    font-size: 14px;
    margin-bottom: 32px;
    padding-right: 8px;
    padding-left: 8px;
    padding-bottom: 8px;
  }

  a {
    color: #3b82f6;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .form-group {
    text-align: left;
    margin-bottom: 20px;
  }

  label {
    display: block;
    color: #9ca3af;
    font-size: 14px;
    margin-bottom: 8px;
  }

  input {
    width: 100%;
    padding: 10px;
    background-color: rgba(31, 41, 55, 0.5);
    border: 1px solid #14181f;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    box-sizing: border-box;
  }

  input::placeholder {
    color: #6b7280;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .password-input {
    position: relative;
  }

  .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .toggle-password img {
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }

  .sign-in-button {
    width: 100%;
    padding: 10px;
    background-color: #3670f7;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sign-in-button:hover {
    background-color: #2563eb;
  }
</style>
