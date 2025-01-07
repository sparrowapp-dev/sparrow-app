<script>
  export let to;
  import { useNavigate } from "svelte-navigator";
  const navigate = useNavigate();
  navigate(to);
</script>
