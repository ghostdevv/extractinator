import { rm, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { emitDts } from 'svelte2tsx'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)

const TEMP_DIR = '.extractinator-temp'

export async function emit(input: string) {
	await rm(TEMP_DIR, { force: true, recursive: true })
	await mkdir(TEMP_DIR, { recursive: true })

	await emitDts({
		svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
		declarationDir: TEMP_DIR,
		libRoot: input,
	})

	return {
		location: resolve(TEMP_DIR),
	}
}
