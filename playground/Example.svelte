<!-- 
	@component
	Example Svelte Component

	@example Simple
	```html
	<Example />
	```

	@example Slots
	```html
	<Example>
		<div slot="test">Test</div>
	</Example>
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
	 * Let the thing know whether it's an example or not.
	 */
	export let isExample: boolean
</script>

<button on:click>
	Is an example: {isExample}
</button>

<div>
	<slot {isExample} />
	<slot name="test" />
</div>
