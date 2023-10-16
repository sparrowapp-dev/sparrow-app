<script lang="ts">

  import Header from "$lib/components/header/Header.svelte";
  import angleLeft from "$lib/assets/angleLeft.svg";


  //------------------------------ TOKEN -----------------------------------//
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const token = urlParams.get("t");
  //   if (token) {
  //     authActions.setUser({ token });
  //     navigate("/reset/password");
  //   }

  
</script>

<div
  class="card-body d-flex flex-column bg-black text-white mx-auto rounded overflow-hidden"
  style="height: 800px;"
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

    <div
      class="login-form text-lightGray ps-1 pe-1 gap-16"
      style="width:408px; height:183px"
    >
      <div class="d-flex flex-column align-items-left mb-2">
        <div class="d-flex align-items-left mb-3 gap-3">
          <a href="/"><img src={angleLeft} alt="" /></a>
          <h6 class="text-whiteColor fs-5">Change Password</h6>
        </div>
        <div style="font-size: 15px;">
          <p>
            To ensure that this is really you, we have sent a confirmation link
            to your email

            <span class="fw-bold text-whiteColor cursor-pointer"
              >raman.rayaprolu@techdome.net.in</span
            >
          </p>

          <p>
            The confirmation link will expire in <span
              class="fw-bold text-whiteColor">24 hours</span
            >.
          </p>

          <p>
            If your email ID is registered with us then you would have received
            an email in your inbox with verification link
          </p>
        </div>
      </div>
      <div class="d-flex gap-3">
        <p style="font-size: 13px;">No email in your inbox or spam folder?</p>
        <a
          href="/forgot/password"
          style="font-size: 13px;"
          class="text-decoration-none text-primaryColor fw-bold">Resend Email</a
        >
      </div>
    </div>
  </div>
</div>
