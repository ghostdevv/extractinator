import { INPUT_DIR, OUTPUT_DIR } from './vars'
import { rm, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { emitDts } from 'svelte2tsx'

await rm(OUTPUT_DIR, { force: true, recursive: true })
await mkdir(OUTPUT_DIR, { recursive: true })

const require = createRequire(import.meta.url)

await emitDts({
	svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
	declarationDir: OUTPUT_DIR,
	libRoot: INPUT_DIR,
})
