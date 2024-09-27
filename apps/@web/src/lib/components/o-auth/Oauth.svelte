<script>
    import googleLogo from '$lib/assets/googlelogo.svg';
	import constants from '$lib/utils/constants';
	import { navigate } from 'svelte-navigator';
    const handleSignInWithGoogle = async () => {
		navigate(constants.SPARROW_OAUTH);
	};
</script>
<div class="d-flex flex-column align-items-center py-3 justify-content-center">
    <p class="sparrow-fs-12 mb-2">or continue with</p>
    <div class="d-flex gap-4">
        <button
            on:click={handleSignInWithGoogle}
            style="width: 32px; height:32px"
            class="custom-button  border-0 rounded"
        >
            <img src={googleLogo} alt="Google Logo" class="w-100 h-100 p-1" />
        </button>
    </div>
</div>

<style>
    .custom-button {
    background-color:#1C1D2B; 
}

.custom-button:hover{
    background-color:#2A2C3C
;
}
</style>