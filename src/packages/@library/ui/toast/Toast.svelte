<script>
  import { ToastContainer, BootstrapToast } from "svelte-toasts";
</script>

<ToastContainer let:data>
  <BootstrapToast {data} />
</ToastContainer>
