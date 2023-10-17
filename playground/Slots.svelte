<script lang="ts">
	interface $$Slots {
		/**
		 * Default slot
		 */
		default: {
			/**
			 * Call this function for disappointment
			 */
			a: () => void
		}
		/**
		 * The slot where you stuff to test goes
		 */
		test: {}
	}
</script>

<slot a={() => {}} />
<slot name="test" />
