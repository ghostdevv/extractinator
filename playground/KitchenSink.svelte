<!-- 
	@component
	Kitchen Sink Svelte Component
 -->
<script context="module">
	import { writable } from 'svelte/store'

	/**
	 * The state the component is in
	 * @default true
	 */
	export const state = writable<string | number | boolean>(true)
</script>

<script lang="ts">
	/**
	 * Let the thing know whether it's on earth
	 */
	export let isOnEarth: boolean
</script>

<button on:click>
	Is On Earth: {isOnEarth}
</button>

<div>
	<slot {isOnEarth} />
	<slot name="test" />
</div>
