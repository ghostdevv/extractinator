<script lang="ts" context="module">
	interface A {
		foo: string
	}

	interface B {
		bar: boolean
	}

	// prettier-ignore
	type IntersectProps = A & B & {
        baz: 'ok buddy'
    };
</script>

<script lang="ts">
	// prettier-ignore
	type $$Props = IntersectProps;
</script>

<slot a={() => {}} />
<slot name="test" />
