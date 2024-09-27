<script>
	import { onMount } from 'svelte';

	/**
	 * external link to redirect
	 */
	export let to = '';

	onMount(() => {
		window.location.href = to;
	});
</script>

<div class="redirect d-flex align-items-center justify-content-center p-5">
	<p class="sparrow-fs-18">
		If the email client doesn't open automatically, please click <a href={to}>here</a> to email support.
	</p>
</div>

<style>
	.redirect {
		height: 100vh;
	}
</style>
