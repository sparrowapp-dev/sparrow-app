<script>
  import { ToastContainer, FlatToast } from "svelte-toasts";
</script>

<ToastContainer let:data>
  <FlatToast {data} />
</ToastContainer>
